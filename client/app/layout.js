import './globals.css';

export const metadata = {
  title: 'EventBasket',
  description: 'לוח שנה משותף / Shared Calendar',
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
