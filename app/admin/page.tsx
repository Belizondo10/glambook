'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

interface Cita {
  id: string
  created_at: string
  servicio: string
  precio: number
  fecha: string
  hora: string
  cliente_nombre: string
  cliente_telefono: string
}

export default function AdminPage() {
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchCitas = async () => {
      // Verificar sesión activa
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      // Cargar citas desde Supabase
      const { data, error } = await supabase
        .from('citas')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setCitas(data)
      }
      setLoading(false)
    }

    fetchCitas()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleEliminarCita = async (id: string) => {
    if (confirm('¿Seguro que deseas cancelar esta cita?')) {
      const { error } = await supabase.from('citas').delete().eq('id', id)
      if (!error) {
        setCitas(citas.filter((cita) => cita.id !== id))
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <p className="text-pink-500 animate-pulse font-medium">Cargando panel de administración...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-neutral-900 p-6 rounded-2xl border border-neutral-800">
          <div>
            <h1 className="text-2xl font-bold text-pink-500">Panel de Control - Glambook</h1>
            <p className="text-sm text-neutral-400">Administración de citas de clientes</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Cerrar Sesión
          </button>
        </div>

        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
          <div className="p-4 border-b border-neutral-800">
            <h2 className="font-semibold text-lg">Citas Agendadas ({citas.length})</h2>
          </div>

          {citas.length === 0 ? (
            <p className="p-6 text-neutral-500 text-center">No hay citas registradas por el momento.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 text-xs uppercase tracking-wider bg-neutral-950/50">
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Servicio</th>
                    <th className="p-4">Fecha y Hora</th>
                    <th className="p-4">Teléfono</th>
                    <th className="p-4">Precio</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-sm">
                  {citas.map((cita) => (
                    <tr key={cita.id} className="hover:bg-neutral-800/40">
                      <td className="p-4 font-medium text-white">{cita.cliente_nombre}</td>
                      <td className="p-4 text-pink-400">{cita.servicio}</td>
                      <td className="p-4 text-neutral-300">{cita.fecha} - {cita.hora}</td>
                      <td className="p-4 text-neutral-400">{cita.cliente_telefono}</td>
                      <td className="p-4 font-semibold text-emerald-400">${cita.precio}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleEliminarCita(cita.id)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-md text-xs transition"
                        >
                          Cancelar Cita
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}