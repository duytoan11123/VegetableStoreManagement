import { AuthProvider } from '@/context/AuthProvider'; // Đảm bảo đường dẫn đúng
import './globals.css'; // File CSS mặc định của Next.js
import React from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <title>VegiFarm Pro</title>
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}