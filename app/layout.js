import './globals.css';

export const metadata = {
  title: '메모',
  description: '언제 어디서든 메모',
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#111827',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
