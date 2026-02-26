import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ecommerce Platform',
  description: 'Ecommerce authentication platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}