'use client'

export default function GlobalError() {
  return (
    <html>
      <body className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-sans">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold">Oops! Algo deu errado.</h1>
          <p className="text-lg text-slate-200">
            Desculpe pelo inconveniente. Por favor, tente novamente.
          </p>
          <button
            className="mt-6 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  )
}