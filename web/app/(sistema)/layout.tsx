'use client'

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function SistemaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Fixa (Menu Lateral) */}
      <Sidebar />

      {/* Área Direita (Conteúdo) */}
      <div className="flex-1 flex flex-col pl-64"> 
        {/* pl-64: Padding Left para compensar a largura da Sidebar (w-64) */}
        
        {/* Header Superior */}
        <Header />

        {/* Conteúdo Principal das Páginas */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}