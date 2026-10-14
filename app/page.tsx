'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface Servicio {
  id: string
  nombre: string
  duracion: string
  precio: number
  icono: string
  descripcion: string
}

const SERVICIOS: Servicio[] = [
  { id: '1', nombre: 'Lash Lifting', duracion: '60 min', precio: 350, icono: '👁️', descripcion: 'Rizado natural e hidratación de pestañas' },
  { id: '2', nombre: 'Maquillaje Social', duracion: '90 min', precio: 600, icono: '💄', descripcion: 'Maquillaje de larga duración para eventos' },
  { id: '3', nombre: 'Corte y Peinado', duracion: '50 min', precio: 400, icono: '✂️', descripcion: 'Estilizado profesional según tu rostro' },
  { id: '4', nombre: 'Manicura Gelish', duracion: '60 min', precio: 300, icono: '💅', descripcion: 'Esmaltado semipermanente de alta duración' },
]

const HORARIOS_DISPONIBLES = [
  '09:00', '10:00', '11:00', '12:00', 
  '13:00', '15:00', '16:00', '17:00', '18:00'
]

const RESEÑAS = [
  { id: 1, nombre: 'Camila R.', comentario: '¡Me encantó mi Lash Lifting! Súper atenta y profesional. 💖', estrellas: 5 },
  { id: 2, nombre: 'Valeria M.', comentario: 'El maquillaje me duró toda la noche en la boda. 100/10 ✨', estrellas: 5 },
  { id: 3, nombre: 'Andrea G.', comentario: 'Excelente atención y el lugar súper limpio y bonito. 🥰', estrellas: 5 },
]

const GALERIA = [
  { id: 1, titulo: 'Lash Lifting Natural', imagen: 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&q=80&w=500' },
  { id: 2, titulo: 'Glam Makeup', imagen: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=500' },
  { id: 3, titulo: 'Uñas Gelish', imagen: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=500' },
]

export default function Home() {
  const [servicioSeleccionado, setServicioSeleccionado] = useState<Servicio | null>(null)
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState(false)
  const [errorForm, setErrorForm] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleConfirmarCita = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorForm('')

    if (!servicioSeleccionado) {
      setErrorForm('Por favor selecciona un servicio.')
      return
    }

    if (!nombre || !telefono || !fecha || !hora) {
      setErrorForm('Por favor completa todos los campos de la cita.')
      return
    }

    setEnviando(true)

    // 1. VERIFICAR BLOQUEO MANUAL DE FECHA (ADMIN)
    const { data: bloqueos } = await supabase
      .from('horarios_bloqueados')
      .select('*')
      .eq('fecha_bloqueada', fecha)

    if (bloqueos && bloqueos.length > 0) {
      setErrorForm('Lo sentimos, esta fecha se encuentra bloqueada por el establecimiento.')
      setEnviando(false)
      return
    }

    // 2. VERIFICAR DOBLE RESERVA AUTOMÁTICA
    const { data: citasExistentes } = await supabase
      .from('citas')
      .select('*')
      .eq('fecha', fecha)
      .eq('hora', hora)

    if (citasExistentes && citasExistentes.length > 0) {
      setErrorForm('Este horario ya ha sido reservado por otro cliente. Por favor elige otra hora.')
      setEnviando(false)
      return
    }

    // 3. INSERTAR CITA EN SUPABASE
    const { error } = await supabase.from('citas').insert([
      {
        cliente_nombre: nombre,
        cliente_telefono: telefono,
        servicio: servicioSeleccionado.nombre,
        fecha: fecha,
        hora: hora,
      },
    ])

    setEnviando(false)

    if (error) {
      setErrorForm('Ocurrió un error al agendar: ' + error.message)
    } else {
      setMensajeExito(true)
      setNombre('')
      setTelefono('')
      setFecha('')
      setHora('')
      setServicioSeleccionado(null)
    }
  }

  return (
    <main className="min-h-screen bg-rose-50/30 py-10 px-4 sm:px-6 flex flex-col items-center font-sans relative">
      <div className="w-full max-w-lg space-y-8 pb-24">
        
        {/* ENCABEZADO CON TIPOGRAFÍA Y ESTILO GLAMBOOK */}
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-rose-500 bg-rose-100/60 px-3 py-1 rounded-full">
            Estudio de Belleza
          </span>
          <h1 className="text-4xl font-extrabold text-neutral-800 tracking-tight font-serif italic">
            Glambook <span className="not-italic text-rose-500">✨</span>
          </h1>
          <p className="text-sm text-neutral-500 font-medium max-w-xs mx-auto">
            Reserva tu espacio de consentimiento y resalta tu belleza natural
          </p>
        </div>

        {/* 1. SELECCIÓN DE SERVICIO CON DESCRIPCIÓN Y PRECIOS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
              1. Selecciona tu servicio
            </label>
            <span className="text-xs text-rose-500 font-medium">Exclusividad & Calidad</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {SERVICIOS.map((servicio) => {
              const estaElegido = servicioSeleccionado?.id === servicio.id
              return (
                <button
                  key={servicio.id}
                  type="button"
                  onClick={() => setServicioSeleccionado(servicio)}
                  className={`w-full p-4.5 rounded-3xl border transition-all duration-200 flex items-center justify-between text-left ${
                    estaElegido
                      ? 'border-rose-400 bg-white shadow-xl ring-2 ring-rose-400/20 translate-y-[-2px]'
                      : 'border-rose-100/80 bg-white/90 hover:bg-white shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <span className="text-3xl p-2 bg-rose-50 rounded-2xl">{servicio.icono}</span>
                    <div className="space-y-0.5">
                      <h3 className="font-bold text-neutral-800 text-base">{servicio.nombre}</h3>
                      <p className="text-xs text-neutral-400 font-normal">{servicio.descripcion}</p>
                      <span className="inline-block text-[11px] text-rose-500 font-semibold bg-rose-50 px-2 py-0.5 rounded-md mt-1">
                        ⏱️ {servicio.duracion}
                      </span>
                    </div>
                  </div>

                  <div className="text-right pl-2">
                    <span className="text-xl font-black text-neutral-800">${servicio.precio}</span>
                    {estaElegido && (
                      <div className="text-[10px] bg-rose-500 text-white font-bold px-2 py-0.5 rounded-full mt-1 shadow-sm">
                        Elegido ✨
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 2. FORMULARIO Y SELECCIÓN VISUAL DE HORARIOS */}
        <form onSubmit={handleConfirmarCita} className="bg-white p-6 sm:p-7 rounded-[2.5rem] border border-rose-100 shadow-2xl shadow-rose-900/5 space-y-6">
          <div className="flex items-center justify-between border-b border-rose-100/60 pb-4">
            <div>
              <h2 className="text-xl font-bold font-serif italic text-neutral-800">2. Agenda tu cita</h2>
              <p className="text-xs text-neutral-400">Completa tus datos y horario preferido</p>
            </div>
            <span className="text-xs text-rose-600 font-bold bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100">
              Paso 2 de 2
            </span>
          </div>

          {/* Servicio Seleccionado */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Servicio Seleccionado
            </label>
            <div className="w-full px-4 py-3.5 rounded-2xl border border-rose-200/80 bg-rose-50/40 font-semibold text-rose-600 text-sm flex items-center justify-between">
              <span>{servicioSeleccionado ? servicioSeleccionado.nombre : 'Elige un servicio arriba'}</span>
              {servicioSeleccionado && <span className="font-bold">${servicioSeleccionado.precio}</span>}
            </div>
          </div>

          {/* Nombre */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Tu Nombre Completo
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Sofía Martínez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 outline-none text-neutral-800 text-sm transition"
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Teléfono / WhatsApp
            </label>
            <input
              type="tel"
              required
              placeholder="Ej. 8714580364"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 outline-none text-neutral-800 text-sm transition"
            />
          </div>

          {/* Fecha */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Selecciona la Fecha
            </label>
            <input
              type="date"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 outline-none text-neutral-800 text-sm bg-white transition"
            />
          </div>

          {/* SELECCIÓN VISUAL DE HORARIOS (BOTONES) */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
              Selecciona la Hora
            </label>
            <div className="grid grid-cols-3 gap-2">
              {HORARIOS_DISPONIBLES.map((h) => {
                const seleccionado = hora === h
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHora(h)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      seleccionado
                        ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-rose-300'
                    }`}
                  >
                    {h} hrs
                  </button>
                )
              })}
            </div>
          </div>

          {/* MENSAJES DE ERROR O ÉXITO */}
          {errorForm && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-center text-rose-600 text-xs font-semibold">
              {errorForm}
            </div>
          )}

          {mensajeExito && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-emerald-700 text-xs font-semibold space-y-1">
              <p className="text-sm font-bold">¡Cita agendada con éxito! 🎉</p>
              <p className="text-emerald-600 font-normal">Te esperamos con mucho gusto para atenderte.</p>
            </div>
          )}

          {/* BOTÓN DE CONFIRMACIÓN */}
          <button
            type="submit"
            disabled={enviando}
            className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 active:scale-[0.99] text-white font-bold rounded-2xl shadow-xl shadow-rose-500/25 transition duration-200 disabled:opacity-50 text-base tracking-wide"
          >
            {enviando ? 'Verificando y Agendando...' : 'Confirmar Mi Cita ✨'}
          </button>
        </form>

        {/* 3. GALERÍA DE TRABAJOS RECIENTES */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              ✨ Galería de Resultados
            </h2>
            <span className="text-xs text-rose-500 font-medium">Trabajos Recientes</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {GALERIA.map((item) => (
              <div key={item.id} className="relative group overflow-hidden rounded-2xl aspect-square shadow-sm border border-rose-100 bg-white">
                <img
                  src={item.imagen}
                  alt={item.titulo}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-2.5">
                  <span className="text-[11px] font-medium text-white">{item.titulo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. SECCIÓN DE OPINIONES DE CLIENTAS */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              💬 Lo que dicen nuestras clientas
            </h2>
            <span className="text-xs text-amber-500 font-bold">★ 5.0 Excelente</span>
          </div>
          <div className="space-y-2.5">
            {RESEÑAS.map((resena) => (
              <div key={resena.id} className="p-4 bg-white/90 backdrop-blur-sm rounded-2xl border border-rose-100/70 shadow-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-neutral-800">{resena.nombre}</span>
                  <div className="text-amber-400 text-xs">
                    {'★'.repeat(resena.estrellas)}
                  </div>
                </div>
                <p className="text-xs text-neutral-600 italic">"{resena.comentario}"</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* BOTÓN FLOTANTE DE WHATSAPP */}
      <a
        href="https://wa.me/528714580364?text=Hola,%20me%20gustaría%20más%20información%20sobre%20sus%20servicios%20de%20belleza"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 ring-4 ring-emerald-500/20"
        title="Contáctanos por WhatsApp"
      >
        <span className="text-2xl">💬</span>
      </a>
    </main>
  )
}