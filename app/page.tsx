import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">Racing Telemetry App</h1>
      <div className="flex gap-4">
        <Link href="/create" className="bg-blue-600 px-4 py-2 rounded">
          + Nueva Sesión
        </Link>
        <button className="bg-slate-700 px-4 py-2 rounded">
          Ver Historial
        </button>
      </div>
    </main>
  )
}

