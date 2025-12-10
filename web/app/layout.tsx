'use client' // <--- Transformamos em Client Component para verificar a rota
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  // Verifica se estamos dentro da área do portal
  const isPortal = pathname?.startsWith('/portal');

  return (
    <html lang="pt-BR">
      <title>Sistema Escolar</title>
      <body className={`${inter.className} bg-gray-50 min-h-screen flex`}>
        
        {/* LÓGICA CONDICIONAL: Só mostra Sidebar se NÃO for portal */}
        {!isPortal && <Sidebar />}

        <div className="flex-1 flex flex-col">
          
          {/* Só mostra Header da Diretoria se NÃO for portal */}
          {!isPortal && <Header />}

          {/* O conteúdo principal se ajusta dependendo de onde estamos */}
          <main className={`flex-1 overflow-y-auto h-screen ${!isPortal ? 'p-8 ml-64' : 'p-0 ml-0'}`}>
            {children}
          </main>
          
        </div>

      </body>
    </html>
  );
}