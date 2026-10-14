'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const SERVICIOS = [
  { id: 1, nombre: 'Manicura Gelish', precio: '$250', duracion: '45 min', icono: '💅' },
  { id: 2, nombre: 'Lash Lifting', precio: '$350', duracion: '60 min', icono: '👁️' },
  { id: 3, nombre: 'Maquillaje Social', precio: '$600', duracion: '90 min', icono: '💄' },
  { id: 4, nombre: 'Corte y Peinado', precio: '$400', duracion: '50 min', icono: '✂️' },
];

const GALERIA_LOOKBOOK = [
  { id: 1, titulo: 'Gelish Rose Gold', servicio: 'Manicura Gelish', img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&auto=format&fit=crop&q=60' },
  { id: 2, titulo: 'Lash Lift & Tint', servicio: 'Lash Lifting', img: 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=500&auto=format&fit=crop&q=60' },
  { id: 3, titulo: 'Glam Social Night', servicio: 'Maquillaje Social', img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=500&auto=format&fit=crop&q=60' },
];

const TESTIMONIOS = [
  { id: 1, nombre: 'Valeria R.', comentario: '¡Me encantó el Lash Lifting! Duró súper bonito y el trato fue de 10. ✨', estrellas: '⭐⭐⭐⭐⭐' },
  { id: 2, nombre: 'Camila S.', comentario: 'El Gelish intacto por 3 semanas. Súper recomendado. 💅', estrellas: '⭐⭐⭐⭐⭐' },
];

const NUMERO_WHATSAPP_NEGOCIO = '5218714580364'; 

export default function Home() {
  const [servicioSeleccionado, setServicioSeleccionado] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [reservaConfirmada, setReservaConfirmada] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleReservar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!servicioSeleccionado || !nombre || !telefono || !fecha || !hora) {
      alert('Por favor completa todos los campos.');
      return;
    }

    setCargando(true);

    const { error } = await supabase
      .from('citas')
      .insert([
        { 
          servicio: servicioSeleccionado, 
          cliente_nombre: nombre, 
          cliente_telefono: telefono, 
          fecha: fecha, 
          hora: hora 
        }
      ]);

    setCargando(false);

    if (error) {
      console.error('Error detallado:', error);
      alert(`Error al guardar: ${error.message || 'Verifica la conexión'}`);
    } else {
      setReservaConfirmada(true);
    }
  };

  const abrirWhatsApp = () => {
    const mensaje = `Hola! Acabo de agendar una cita en Glambook. Clienta: ${nombre} | Servicio: ${servicioSeleccionado} | Fecha: ${fecha} | Hora: ${hora} | Tel: ${telefono}`;
    window.open(`https://wa.me/${NUMERO_WHATSAPP_NEGOCIO}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50/60 to-purple-50/40 p-4 md:p-10 font-sans text-gray-800">
      
      {/* Header Estilo Pinterest */}
      <header className="max-w-4xl mx-auto text-center mb-10 pt-4">
        <div className="inline-flex items-center gap-1.5 bg-rose-100/80 text-rose-600 font-semibold text-xs px-4 py-1.5 rounded-full mb-3 tracking-widest border border-rose-200 shadow-sm backdrop-blur-sm">
          <span>🌸</span> RESERVAS EN LÍNEA <span>✨</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-serif italic font-normal bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 bg-clip-text text-transparent tracking-wide py-1 drop-shadow-sm">
          Glambook
        </h1>
        <p className="text-gray-500 text-sm md:text-base mt-1 italic font-light max-w-md mx-auto">
          Reserva tu cita de belleza & resalta tu brillo natural ✨
        </p>
      </header>

      {/* Grid Principal: Servicios y Formulario */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-16">
        
        {/* Catálogo de Servicios */}
        <section className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-serif italic text-gray-800 tracking-tight">1. Selecciona tu servicio</h2>
            <span className="text-xs text-rose-400 font-medium italic">Paso 1 de 2</span>
          </div>

          <div className="space-y-3">
            {SERVICIOS.map((servicio) => {
              const estaSeleccionado = servicioSeleccionado === servicio.nombre;
              return (
                <div 
                  key={servicio.id} 
                  onClick={() => {
                    setServicioSeleccionado(servicio.nombre);
                    setReservaConfirmada(false);
                  }}
                  className={`group relative p-4 rounded-2xl transition-all duration-300 cursor-pointer border ${
                    estaSeleccionado 
                      ? 'bg-white border-rose-400 ring-2 ring-rose-300/60 shadow-lg shadow-rose-100' 
                      : 'bg-white/90 backdrop-blur-sm border-rose-100/80 hover:border-rose-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition-all ${
                        estaSeleccionado ? 'bg-gradient-to-tr from-rose-400 to-pink-500 text-white shadow-md' : 'bg-rose-50 text-gray-700 group-hover:bg-rose-100'
                      }`}>
                        {servicio.icono}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-base">{servicio.nombre}</h3>
                        <p className="text-xs text-rose-400 font-medium mt-0.5">⏱️ {servicio.duracion}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-extrabold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent block">
                        {servicio.precio}
                      </span>
                      {estaSeleccionado && (
                        <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 italic">
                          Elegido ✨
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Formulario de Reserva */}
        <section className="bg-white/95 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-xl shadow-rose-100/60 border border-rose-100/80">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif italic text-gray-800 tracking-tight">2. Agenda tu horario</h2>
            <span className="text-xs text-rose-400 font-medium italic">Paso 2 de 2</span>
          </div>

          {reservaConfirmada ? (
            <div className="bg-gradient-to-b from-rose-50/80 to-pink-50/80 border border-rose-200 text-rose-950 p-6 rounded-2xl text-center space-y-4 shadow-inner">
              <div className="w-14 h-14 bg-gradient-to-tr from-rose-400 to-pink-500 text-white rounded-full flex items-center justify-center text-2xl mx-auto shadow-md animate-bounce">
                🌸
              </div>
              <div>
                <h3 className="font-serif italic text-2xl text-rose-900">¡Tu cita está lista!</h3>
                <p className="text-xs text-rose-600/80 mt-1">Guardamos tu lugar con éxito.</p>
              </div>

              <div className="bg-white p-4 rounded-2xl text-left text-xs space-y-2 border border-rose-100 shadow-sm text-gray-700">
                <p>👤 <strong>Cliente:</strong> {nombre}</p>
                <p>💅 <strong>Servicio:</strong> {servicioSeleccionado}</p>
                <p>📅 <strong>Fecha:</strong> {fecha}</p>
                <p>⏰ <strong>Hora:</strong> {hora}</p>
              </div>

              <button 
                onClick={abrirWhatsApp}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold rounded-2xl shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span>📲</span> Confirmar por WhatsApp
              </button>

              <button 
                onClick={() => {
                  setReservaConfirmada(false);
                  setNombre('');
                  setTelefono('');
                  setFecha('');
                  setHora('');
                }}
                className="text-xs text-rose-500 hover:text-rose-700 font-medium italic underline block mx-auto pt-1"
              >
                Agendar otra cita ✨
              </button>
            </div>
          ) : (
            <form onSubmit={handleReservar} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                  Servicio Seleccionado
                </label>
                <input 
                  type="text" 
                  readOnly 
                  value={servicioSeleccionado || '🌸 Elige un servicio de la izquierda'} 
                  className={`w-full px-4 py-3 rounded-2xl text-xs font-semibold border transition-all ${
                    servicioSeleccionado ? 'bg-rose-50/60 border-rose-300 text-rose-700' : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                  Tu Nombre
                </label>
                <input 
                  type="text" 
                  placeholder="Ej. Sofía Martínez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-2xl text-sm border border-rose-100 focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all bg-rose-50/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                  Teléfono / WhatsApp
                </label>
                <input 
                  type="tel" 
                  placeholder="Ej. 8714580364"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-2xl text-sm border border-rose-100 focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all bg-rose-50/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                    Fecha
                  </label>
                  <input 
                    type="date" 
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-2xl text-xs border border-rose-100 focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all bg-rose-50/20"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                    Hora
                  </label>
                  <input 
                    type="time" 
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-2xl text-xs border border-rose-100 focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all bg-rose-50/20"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={!servicioSeleccionado || cargando}
                className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wide text-white transition-all shadow-md ${
                  servicioSeleccionado && !cargando 
                    ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:opacity-95 active:scale-[0.98] shadow-rose-200 cursor-pointer' 
                    : 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed'
                }`}
              >
                {cargando ? 'Guardando...' : 'Confirmar Cita ✨'}
              </button>
            </form>
          )}
        </section>
      </div>

      {/* Galería Lookbook / Trabajos Reales */}
      <section className="max-w-4xl mx-auto mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif italic text-gray-800">Galería de Resultados ✨</h2>
          <p className="text-xs text-rose-400 font-medium italic mt-1">Nuestros trabajos más populares</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {GALERIA_LOOKBOOK.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl overflow-hidden shadow-md shadow-rose-100/50 border border-rose-100/60 group hover:shadow-lg transition-all duration-300">
              <div className="h-48 overflow-hidden relative">
                <img src={item.img} alt={item.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-bold text-sm text-gray-800">{item.titulo}</h3>
                <p className="text-xs text-rose-400 italic mt-0.5">{item.servicio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reseñas de Clientas */}
      <section className="max-w-4xl mx-auto mb-16 bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-rose-100/80 shadow-sm">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-serif italic text-gray-800">Lo que dicen nuestras clientas 💖</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TESTIMONIOS.map((item) => (
            <div key={item.id} className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100/60">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-sm text-gray-800">{item.nombre}</span>
                <span className="text-xs">{item.estrellas}</span>
              </div>
              <p className="text-xs text-gray-600 italic">"{item.comentario}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ubicación e Información del Negocio */}
      <section className="max-w-4xl mx-auto mb-12 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white p-8 rounded-3xl shadow-xl shadow-rose-200/50 text-center space-y-4">
        <h2 className="text-3xl font-serif italic">Visítanos 📍</h2>
        <p className="text-xs md:text-sm font-light max-w-md mx-auto">
          Estamos esperándote para brindarte la mejor experiencia de belleza.
        </p>
        
        <div className="flex flex-wrap justify-center gap-6 text-xs pt-2 font-medium">
          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl">
            📍 Calle Principal #123, Centro
          </div>
          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl">
            ⏰ Lun - Sáb: 10:00 AM - 7:00 PM
          </div>
          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl">
            📲 WhatsApp: 871 458 0364
          </div>
        </div>
      </section>

      <footer className="max-w-4xl mx-auto text-center pb-6">
        <Link href="/admin" className="text-xs font-serif italic text-rose-400 hover:text-rose-600 underline transition-all">
          Acceso Administrador ⚙️
        </Link>
      </footer>
    </main>
  );
}