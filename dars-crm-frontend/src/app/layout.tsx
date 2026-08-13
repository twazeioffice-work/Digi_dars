import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'Digi Dars CRM - Academic & Tarbiyyah Platform',
  description: 'Enterprise Islamic Education & Masjid Management Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
