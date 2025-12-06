import type { Metadata } from 'next';
import { Inter, Baloo_Da_2, Hind_Siliguri } from 'next/font/google';
import './globals.css';
import { ThemeContextProvider } from '@/context/ThemeContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const balooDa2 = Baloo_Da_2({ 
  subsets: ['bengali', 'latin'], 
  weight: ['600', '700'], 
  variable: '--font-baloo' 
});
const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600'],
  variable: '--font-hind'
});

export const metadata: Metadata = {
  title: 'ভূমিকম্প কবে?',
  description: 'এশিয়ার ভূমিকম্প তথ্য ও পূর্বাভাস',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" suppressHydrationWarning className={`${inter.variable} ${balooDa2.variable} ${hindSiliguri.variable}`}>
      <body className="antialiased transition-colors duration-300">
        <ThemeContextProvider>
          {children}
        </ThemeContextProvider>
      </body>
    </html>
  );
}