'use client'
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  // LÓGICA DE EXIBIÇÃO DO LAYOUT
  // 1. É área do Portal (Pais)?
  const isPortal = pathname?.startsWith('/portal');
  
  // 2. É página de Login (Pública)?
  const isLogin = pathname === '/login';

  // 3. Deve mostrar o Layout Administrativo (Sidebar + Header)?
  // Regra: NÃO pode ser portal E NÃO pode ser login.
  const showAdminLayout = !isPortal && !isLogin;

  return (
    <html lang="pt-BR">
      <title>Sistema Escolar</title>
      <body className={`${inter.className} bg-gray-50 min-h-screen flex`}>

        {/* Adicione o Toaster aqui, logo no início do body */}
        <Toaster richColors position="top-right" />
        
        {/* Renderiza Sidebar apenas se estiver no Admin logado */}
        {showAdminLayout && <Sidebar />}

        <div className="flex-1 flex flex-col">
          
          {/* Renderiza Header apenas se estiver no Admin logado */}
          {showAdminLayout && <Header />}

          {/* Ajuste de margens:
             - Se for Admin: padding-8 e margem-esquerda-64 (para compensar a sidebar fixa)
             - Se for Login ou Portal: tela cheia (p-0 m-0)
          */}
          <main className={`flex-1 overflow-y-auto h-screen ${showAdminLayout ? 'p-8 ml-64' : 'p-0 ml-0'}`}>
            {children}
          </main>
          
        </div>

      </body>
    </html>
  );
}