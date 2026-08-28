import { Chrome } from 'lucide-react'

export default function LoginScreen({
  onSignIn,
  signingIn,
  error,
}: {
  onSignIn: () => void
  signingIn: boolean
  error: string | null
}) {
  return (
    <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center px-6 text-center">
      <div className="h-16 w-16 rounded-2xl bg-navy-800 flex items-center justify-center mb-5">
        <span className="text-2xl">🎬</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-50">Life Tracker</h1>
      <p className="text-sm text-slate-400 mt-2 max-w-xs">
        Llevá el registro de tus libros, juegos, películas, series y comics en
        un solo lugar.
      </p>

      <button
        type="button"
        onClick={onSignIn}
        disabled={signingIn}
        className="mt-8 flex items-center gap-2.5 bg-white text-navy-900 font-semibold px-5 py-3 rounded-xl disabled:opacity-60 active:scale-95 transition-transform"
      >
        <Chrome size={20} />
        {signingIn ? 'Ingresando…' : 'Continuar con Google'}
      </button>

      {error && (
        <p className="text-sm text-red-400 mt-4 max-w-xs">{error}</p>
      )}
    </div>
  )
}
