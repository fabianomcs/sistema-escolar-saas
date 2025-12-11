'use client'

export default function GaleriaPage() {
  const fotos = [
    { url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800", titulo: "Fachada Moderna" },
    { url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800", titulo: "Sala de Aula Interativa" },
    { url: "https://images.unsplash.com/photo-1544531696-9342e508c650?w=800", titulo: "Biblioteca" },
    { url: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800", titulo: "Laboratório de Ciências" },
    { url: "https://images.unsplash.com/photo-1562774053-701939374585?w=800", titulo: "Área Verde" },
    { url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800", titulo: "Quadra Poliesportiva" },
  ]

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">Nossos Ambientes</h1>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Conheça os espaços planejados para estimular a criatividade, o convívio e o aprendizado seguro.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {fotos.map((foto, idx) => (
            <div key={idx} className="group relative overflow-hidden rounded-2xl aspect-square cursor-pointer">
              <img 
                src={foto.url} 
                alt={foto.titulo} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                <span className="text-white font-bold text-lg">{foto.titulo}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}