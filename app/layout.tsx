import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const playfair = Playfair_Display({ 
  subsets: ['latin'], 
  style: ['italic', 'normal'],
  variable: '--font-playfair'
});

export const metadata: Metadata = {
  title: 'Glambook - Reserva tu Cita',
  description: 'Reserva tu cita de belleza en segundos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${playfair.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}