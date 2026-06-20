'use client';
import { useEvents } from '@/context/EventsContext';

export function ProgressBar() {
  const { loading } = useEvents();
  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] h-0.5 bg-[var(--eb-border)] overflow-hidden">
      <div className="h-full bg-[#c9a96e] animate-progress-bar" />
      <style>{`
        @keyframes progress-bar {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(-10%); }
          100% { transform: translateX(0%); }
        }
        .animate-progress-bar {
          animation: progress-bar 1.2s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  );
}
