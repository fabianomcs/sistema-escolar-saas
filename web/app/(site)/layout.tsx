import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      {/* Menu Fixo no Topo */}
      <SiteHeader />

      {/* Conteúdo das Páginas (Home, Sobre, etc) 
          pt-20 compensa a altura do menu fixo para não cortar o conteúdo */}
      <main className="flex-1 pt-20"> 
        {children}
      </main>

      {/* Rodapé Padrão */}
      <SiteFooter />
    </div>
  );
}