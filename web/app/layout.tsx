import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EscolaFácil - Educação de Excelência",
  description: "Portal institucional e sistema de gestão escolar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        {/* Notificações globais */}
        <Toaster richColors position="top-right" />
        
        {/* Renderiza o que vier (Site, Sistema ou Login) */}
        {children}
      </body>
    </html>
  );
}