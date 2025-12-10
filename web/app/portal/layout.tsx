import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css"; // Note os dois pontos (subiu dois níveis)

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Portal do Aluno",
  description: "Área da Família",
};

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${inter.className} min-h-screen bg-gray-50 flex flex-col`}>
      {/* HEADER SIMPLES */}
      <header className="bg-white py-4 shadow-sm text-center">
        <h1 className="text-xl font-bold text-gray-800">
          Escola<span className="text-blue-600">Fácil</span> <span className="text-sm font-normal text-gray-400">| Portal</span>
        </h1>
      </header>

      {/* CONTEÚDO */}
      <main className="flex-1">
        {children}
      </main>

      {/* RODAPÉ */}
      <footer className="py-6 text-center text-xs text-gray-400">
        &copy; 2025 Sistema Escolar. Ambiente Seguro.
      </footer>
    </div>
  );
}