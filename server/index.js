require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
});

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ─── Mongoose Models ─────────────────────────────────────────────────────────

const GroupSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  code:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Group = mongoose.model('Group', GroupSchema);

const EVENT_TYPES = [
  'general', 'doctor', 'birthday', 'reminder',
  'meeting', 'holiday', 'sport', 'school', 'social', 'family',
];

const RecurrenceSchema = new mongoose.Schema({
  frequency: { type: String, enum: ['once', 'daily', 'weekly', 'monthly', 'yearly'], default: 'once' },
  endDate:   { type: Date, default: null },
}, { _id: false });

const EventSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  type:        { type: String, enum: EVENT_TYPES, default: 'general' },
  start:       { type: Date, required: true },
  end:         { type: Date, default: null },
  allDay:      { type: Boolean, default: false },
  description: { type: String, default: '' },
  location:    { type: String, default: '' },
  reminder:    { type: Number, default: 0 },
  recurrence:  { type: RecurrenceSchema, default: () => ({ frequency: 'once', endDate: null }) },
  createdBy:   { type: String, required: true },
  groupId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  createdAt:   { type: Date, default: Date.now },
});
const Event = mongoose.model('Event', EventSchema);

// ─── Groups ──────────────────────────────────────────────────────────────────

// Create group
app.post('/groups', async (req, res) => {
  const { name, code, createdBy } = req.body;
  if (!name || !code || !createdBy) return res.status(400).json({ error: 'name, code, createdBy required' });
  const exists = await Group.findOne({ code: code.toLowerCase().trim() });
  if (exists) return res.status(409).json({ error: 'Code already taken' });
  const group = await Group.create({ name, code, createdBy });
  res.status(201).json(group);
});

// Join group by code
app.post('/groups/join', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'code required' });
  const group = await Group.findOne({ code: code.toLowerCase().trim() });
  if (!group) return res.status(404).json({ error: 'Group not found' });
  res.json(group);
});

// Get group by id
app.get('/groups/:id', async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) return res.status(404).json({ error: 'Group not found' });
  res.json(group);
});

// Delete group (creator only) — deletes all events
app.delete('/groups/:id', async (req, res) => {
  const { username } = req.body;
  const group = await Group.findById(req.params.id);
  if (!group) return res.status(404).json({ error: 'Group not found' });
  if (group.createdBy !== username) return res.status(403).json({ error: 'Only the creator can delete this group' });
  await Event.deleteMany({ groupId: group._id });
  await group.deleteOne();
  io.to(req.params.id).emit('group-deleted');
  res.json({ success: true });
});

// ─── Events ──────────────────────────────────────────────────────────────────

// Get events for a group (optional ?start=&end= range filter)
app.get('/groups/:groupId/events', async (req, res) => {
  const { start, end } = req.query;
  const filter = { groupId: req.params.groupId };
  if (start || end) {
    filter.start = {};
    if (start) filter.start.$gte = new Date(start);
    if (end)   filter.start.$lte = new Date(end);
  }
  const events = await Event.find(filter).sort({ start: 1 });
  res.json(events);
});

// Get events created by a user across multiple groups
app.post('/events/mine', async (req, res) => {
  const { username, groupIds } = req.body;
  if (!username || !groupIds?.length) return res.status(400).json({ error: 'username and groupIds required' });
  const events = await Event.find({ createdBy: username, groupId: { $in: groupIds } }).sort({ start: 1 });
  res.json(events);
});

// Create event
app.post('/groups/:groupId/events', async (req, res) => {
  const { title, type, start, end, description, location, recurrence, createdBy } = req.body;
  if (!title || !start || !createdBy) return res.status(400).json({ error: 'title, start, createdBy required' });
  const group = await Group.findById(req.params.groupId);
  if (!group) return res.status(404).json({ error: 'Group not found' });
  const event = await Event.create({
    title, type, start, end: end || null,
    description, location, recurrence,
    createdBy, groupId: req.params.groupId,
  });
  io.to(req.params.groupId).emit('event-added', event);
  res.status(201).json(event);
});

// Update event (creator only)
app.patch('/groups/:groupId/events/:id', async (req, res) => {
  const { username, ...updates } = req.body;
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (event.createdBy !== username) return res.status(403).json({ error: 'Only the creator can edit this event' });
  Object.assign(event, updates);
  await event.save();
  io.to(req.params.groupId).emit('event-updated', event);
  res.json(event);
});

// Delete event (creator only)
app.delete('/groups/:groupId/events/:id', async (req, res) => {
  const { username } = req.body;
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (event.createdBy !== username) return res.status(403).json({ error: 'Only the creator can delete this event' });
  await event.deleteOne();
  io.to(req.params.groupId).emit('event-deleted', { _id: req.params.id });
  res.json({ success: true });
});

// ─── Socket.IO ───────────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  socket.on('join-group', (groupId) => {
    socket.join(groupId);
  });
  socket.on('leave-group', (groupId) => {
    socket.leave(groupId);
  });
});

// ─── DB + Start ───────────────────────────────────────────────────────────────

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`EventBasket server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
