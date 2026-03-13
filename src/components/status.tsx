import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  content: string;
  type?: "loading" | "error"; // Adicionei o tipo para mudar o visual
  onRetry?: () => void;      // Opcional: função para tentar novamente
}

export function Status({ content, type = "loading", onRetry }: Props) {
  const isError = type === "error";

  return (
    <div className="flex flex-col flex-1 min-h-[400px] w-full items-center justify-center p-6 text-center animate-in fade-in duration-500">
      <div className={`p-4 rounded-full mb-4 ${isError ? "bg-red-500/10" : "bg-blue-500/10"}`}>
        {isError ? (
          <AlertCircle className="w-12 h-12 text-red-500" />
        ) : (
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        )}
      </div>

      <h1 className={`text-xl font-medium max-w-xs md:max-w-md ${isError ? "text-red-200" : "text-gray-300"}`}>
        {content}
      </h1>

      {isError && onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 flex items-center gap-2 px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-full border border-gray-600 transition-all active:scale-95"
        >
          <RefreshCw size={18} />
          Tentar novamente
        </button>
      )}

      {/* Decorativo: fundo sutil para preencher o espaço */}
      {!isError && (
        <p className="mt-4 text-sm text-gray-500 animate-pulse">
          Isso pode levar alguns segundos...
        </p>
      )}
    </div>
  );
}