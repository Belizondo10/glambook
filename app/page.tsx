'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

interface Cita {
  id: string
  cliente_nombre: string
  servicio_nombre: string
  fecha_hora: string
  cliente_telefono: string
  precio: number
  estado?: string
}

interface Bloqueo {
  id: string
  fecha_bloqueada: string
  motivo?: string
}

export default function AdminDashboard() {
  const [citas, setCitas] = useState<Cita[]>([])
  const [bloqueos, setBloqueos] = useState<Bloqueo[]>([])
  const [nuevaFechaBloqueo, setNuevaFechaBloqueo] = useState('')
  const [motivoBloqueo, setMotivoBloqueo] = useState('')
  const [cargando, setCargando] = useState(true)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const verificarSesionYCargar = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      // Cargar citas iniciales
      const { data: dataCitas } = await supabase
        .from('citas')
        .select('*')
        .order('fecha_hora', { ascending: true })

      if (dataCitas) setCitas(dataCitas)

      // Cargar bloqueos iniciales
      const { data: dataBloqueos } = await supabase
        .from('horarios_bloqueados')
        .select('*')
        .order('fecha_bloqueada', { ascending: true })

      if (dataBloqueos) setBloqueos(dataBloqueos)

      setCargando(false)

      // Escuchar cambios en tiempo real (Citas y Bloqueos)
      const canal = supabase
        .channel('admin_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'citas' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setCitas((prev) => [...prev, payload.new as Cita])
            } else if (payload.eventType === 'DELETE') {
              setCitas((prev) => prev.filter((c) => c.id !== payload.old.id))
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'horarios_bloqueados' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setBloqueos((prev) => [...prev, payload.new as Bloqueo])
            } else if (payload.eventType === 'DELETE') {
              setBloqueos((prev) => prev.filter((b) => b.id !== payload.old.id))
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(canal)
      }
    }

    verificarSesionYCargar()
  }, [router, supabase])

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleCancelarCita = async (id: string) => {
    const confirmar = confirm('¿Estás seguro de que deseas cancelar esta cita?')
    if (!confirmar) return

    const { error } = await supabase.from('citas').delete().eq('id', id)
    if (error) {
      alert('Error al cancelar la cita: ' + error.message)
    }
  }

  const handleBloquearFecha = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevaFechaBloqueo) return

    const { error } = await supabase.from('horarios_bloqueados').insert([
      {
        fecha_bloqueada: nuevaFechaBloqueo,
        motivo: motivoBloqueo || 'Día no disponible',
      },
    ])

    if (error) {
      alert('Error al bloquear fecha: ' + error.message)
    } else {
      setNuevaFechaBloqueo('')
      setMotivoBloqueo('')
      alert('Fecha bloqueada correctamente. Los clientes ya no podrán agendar ese día.')
    }
  }

  const handleEliminarBloqueo = async (id: string) => {
    const confirmar = confirm('¿Deseas habilitar nuevamente esta fecha?')
    if (!confirmar) return

    const { error } = await supabase.from('horarios_bloqueados').delete().eq('id', id)
    if (error) {
      alert('Error al desbloquear: ' + error.message)
    }
  }

  const formatearFecha = (fechaIso: string) => {
    if (!fechaIso) return 'Sin fecha'
    const fecha = new Date(fechaIso)
    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(fecha)
  }

  const formatearPrecio = (cantidad: number | undefined | null) => {
    if (cantidad === undefined || cantidad === null) return '$0'
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(cantidad)
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
        Cargando panel de administración...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-12 space-y-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-neutral-900 p-6 rounded-2xl border border-neutral-800 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-pink-500">Panel de Control - Glambook</h1>
            <p className="text-sm text-neutral-400">Administración de citas y bloqueos de agenda</p>
          </div>
          <button
            onClick={handleCerrarSesion}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-sm font-medium rounded-xl transition"
          >
            Cerrar Sesión
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Tabla de Citas (Ocupa 2 espacios) */}
          <div className="lg:col-span-2 bg-neutral-900 rounded-2xl border border-neutral-800 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-neutral-200">
              Citas Agendadas ({citas.length})
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-neutral-300">
                <thead className="text-xs uppercase bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                  <tr>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Servicio</th>
                    <th className="p-4">Fecha y Hora</th>
                    <th className="p-4">Teléfono</th>
                    <th className="p-4">Precio</th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {citas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-neutral-500">
                        No hay citas agendadas por el momento.
                      </td>
                    </tr>
                  ) : (
                    citas.map((cita) => (
                      <tr key={cita.id} className="hover:bg-neutral-800/50 transition">
                        <td className="p-4 font-medium text-white">{cita.cliente_nombre}</td>
                        <td className="p-4 text-pink-400 font-medium">{cita.servicio_nombre}</td>
                        <td className="p-4 capitalize">{formatearFecha(cita.fecha_hora)}</td>
                        <td className="p-4 font-mono text-neutral-300">{cita.cliente_telefono}</td>
                        <td className="p-4 font-semibold text-emerald-400">
                          {formatearPrecio(cita.precio)}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleCancelarCita(cita.id)}
                            className="px-3 py-1.5 bg-red-900/30 text-red-400 hover:bg-red-900/60 rounded-lg text-xs font-medium transition"
                          >
                            Cancelar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Columna Derecha: Bloqueo de Fechas (Ocupa 1 espacio) */}
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-neutral-200">
              Bloquear Fechas 🔒
            </h2>

            <form onSubmit={handleBloquearFecha} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-neutral-400 font-medium">Fecha a bloquear</label>
                <input
                  type="date"
                  required
                  value={nuevaFechaBloqueo}
                  onChange={(e) => setNuevaFechaBloqueo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm outline-none focus:border-pink-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-400 font-medium">Motivo (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej. Vacaciones, Descanso"
                  value={motivoBloqueo}
                  onChange={(e) => setMotivoBloqueo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm outline-none focus:border-pink-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-xl text-sm transition shadow-lg shadow-pink-600/20"
              >
                Bloquear Día
              </button>
            </form>

            {/* Lista de días bloqueados activos */}
            <div className="space-y-3 pt-4 border-t border-neutral-800">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Días bloqueados ({bloqueos.length})
              </h3>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {bloqueos.length === 0 ? (
                  <p className="text-xs text-neutral-500">No hay días bloqueados actualmente.</p>
                ) : (
                  bloqueos.map((b) => (
                    <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-sm">
                      <div>
                        <div className="font-semibold text-neutral-200">{b.fecha_bloqueada}</div>
                        <div className="text-xs text-neutral-400">{b.motivo}</div>
                      </div>
                      <button
                        onClick={() => handleEliminarBloqueo(b.id)}
                        className="text-xs text-rose-400 hover:text-rose-300 font-medium px-2 py-1 bg-rose-950/40 rounded-lg transition"
                      >
                        Desbloquear
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}