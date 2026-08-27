import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ระบบทำเนียบและแสดงผลอัพเดทรายชื่อผู้บริหารภาครัฐ | ThaiGov Directory',
  description: 'ระบบสืบค้นและจัดการทำเนียบผู้บริหาร ส่วนราชการ ส่วนภูมิภาค ระดับอำเภอ และองค์กรปกครองส่วนท้องถิ่น',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&family=Sarabun:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}
