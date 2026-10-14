'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface Servicio {
  id: string
  nombre: string
  duracion: string
  precio: number
  icono: string
}

const SERVICIOS: Servicio[] = [
  { id: '1', nombre: 'Lash Lifting', duracion: '60 min', precio: 350, icono: '👁️' },
  { id: '2', nombre: 'Maquillaje Social', duracion: '90 min', precio: 600, icono: '💄' },
  { id: '3', nombre: 'Corte y Peinado', duracion: '50 min', precio: 400, icono: '✂️' },
  { id: '4', nombre: 'Manicura Gelish', duracion: '60 min', precio: 300, icono: '💅' },
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
    const fechaHoraISO = new Date(`${fecha}T${hora}:00`).toISOString()
    const fechaSolo = fecha // Formato YYYY-MM-DD

    // 1. VERIFICAR BLOQUEO MANUAL DE FECHA (ADMIN)
    const { data: bloqueos, error: errBloqueo } = await supabase
      .from('horarios_bloqueados')
      .select('*')
      .eq('fecha_bloqueada', fechaSolo)

    if (bloqueos && bloqueos.length > 0) {
      setErrorForm('Lo sentimos, esta fecha se encuentra bloqueada por el establecimiento.')
      setEnviando(false)
      return
    }

    // 2. VERIFICAR DOBLE RESERVA AUTOMÁTICA (Misma fecha y hora exacta)
    const { data: citasExistentes, error: errCitas } = await supabase
      .from('citas')
      .select('*')
      .eq('fecha_hora', fechaHoraISO)

    if (citasExistentes && citasExistentes.length > 0) {
      setErrorForm('Este horario ya ha sido reservado por otro cliente. Por favor elige otra hora.')
      setEnviando(false)
      return
    }

    // 3. INSERTAR LA CITA SI TODO ESTÁ LIBRE
    const { error } = await supabase.from('citas').insert([
      {
        cliente_nombre: nombre,
        cliente_telefono: telefono,
        servicio_nombre: servicioSeleccionado.nombre,
        precio: servicioSeleccionado.precio,
        fecha_hora: fechaHoraISO,
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
    <main className="min-h-screen bg-pink-50/40 py-8 px-4 sm:px-6 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-lg space-y-6">
        
        {/* Encabezado Glambook */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-extrabold text-pink-600 tracking-tight">Glambook ✨</h1>
          <p className="text-sm text-neutral-500 font-medium">Agenda tu cita de belleza en segundos</p>
        </div>

        {/* 1. Selección de Servicio */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block px-1">
            1. Selecciona tu servicio
          </label>
          <div className="grid grid-cols-1 gap-3">
            {SERVICIOS.map((servicio) => {
              const estaElegido = servicioSeleccionado?.id === servicio.id
              return (
                <button
                  key={servicio.id}
                  type="button"
                  onClick={() => setServicioSeleccionado(servicio)}
                  className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between text-left ${
                    estaElegido
                      ? 'border-pink-500 bg-white shadow-md ring-2 ring-pink-500/20'
                      : 'border-pink-100 bg-white/80 hover:bg-white shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{servicio.icono}</span>
                    <div>
                      <h3 className="font-bold text-neutral-800 text-base">{servicio.nombre}</h3>
                      <span className="text-xs text-neutral-400 font-medium">⏱️ {servicio.duracion}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-extrabold text-pink-600">${servicio.precio}</span>
                    {estaElegido && (
                      <div className="text-[10px] bg-pink-100 text-pink-600 font-bold px-2 py-0.5 rounded-full mt-1">
                        Elegido ✨
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 2. Formulario de Datos */}
        <form onSubmit={handleConfirmarCita} className="bg-white p-6 rounded-3xl border border-pink-100 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h2 className="text-lg font-bold italic text-neutral-800">2. Agenda tu horario</h2>
            <span className="text-xs text-pink-500 font-semibold bg-pink-50 px-2.5 py-1 rounded-full">Paso 2 de 2</span>
          </div>

          {/* Servicio Seleccionado */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Servicio Seleccionado
            </label>
            <div className="w-full px-4 py-3 rounded-2xl border border-pink-200 bg-pink-50/30 font-medium text-pink-600 text-sm">
              {servicioSeleccionado ? servicioSeleccionado.nombre : 'Selecciona un servicio arriba'}
            </div>
          </div>

          {/* Nombre */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Tu Nombre
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Sofía Martínez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:border-pink-500 outline-none text-neutral-800 text-sm transition"
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Teléfono / WhatsApp
            </label>
            <input
              type="tel"
              required
              placeholder="Ej. 8714580364"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:border-pink-500 outline-none text-neutral-800 text-sm transition"
            />
          </div>

          {/* FECHA Y HORA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Fecha
              </label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3 py-3 rounded-2xl border border-neutral-200 focus:border-pink-500 outline-none text-neutral-800 text-sm bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Hora
              </label>
              <input
                type="time"
                required
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full px-3 py-3 rounded-2xl border border-neutral-200 focus:border-pink-500 outline-none text-neutral-800 text-sm bg-white transition"
              />
            </div>
          </div>

          {/* Mensajes de Error o Éxito */}
          {errorForm && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-center text-red-600 text-xs font-semibold">
              {errorForm}
            </div>
          )}

          {mensajeExito && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-emerald-700 text-xs font-semibold">
              ¡Cita agendada con éxito! 🎉 Te esperamos con gusto.
            </div>
          )}

          {/* Botón de Confirmación */}
          <button
            type="submit"
            disabled={enviando}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 active:scale-[0.99] text-white font-bold rounded-2xl shadow-lg shadow-pink-500/25 transition duration-200 disabled:opacity-50 text-base"
          >
            {enviando ? 'Verificando y Agendando...' : 'Confirmar Cita ✨'}
          </button>
        </form>

      </div>
    </main>
  )
}