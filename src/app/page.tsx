'use client'

import { useEffect, useState } from "react"
import { Edit, Folder, Plus, Trash } from "lucide-react"

import { FolderType } from "@/types/folder-type"

import { Status } from "@/components/status"
import { useRouter } from "next/navigation"
import url from "./api/url"


export default function Home() {
  const [folders, setFolders] = useState<FolderType[] | null>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const router = useRouter()

  const fetchFolders = async (lock: string = "+") => {
    setIsLoading(true)
    try {
      const response = await fetch(`${url}/folder`)
      const data: FolderType[] = await response.json()

      const sortedAndPublicFolders: FolderType[] = data
        .filter(f => !f.name.startsWith(lock))
        .sort((a: any, b: any) => a.name.localeCompare(b.name))

      setFolders(sortedAndPublicFolders)
    } catch (error) {
      setFolders(null)
    } finally {
      setIsLoading(false)
    }
  }

  const createFolder = async () => {
    try {
      const name = window.prompt('Digite o nome da pasta...')
      if (!name) return
      if (name.trim().length <= 0) return window.alert('Nome muito curto!')

      const response = await fetch(`${url}/folder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        window.alert("Erro ao criar pasta!")
      }

      window.alert("Sucesso ao criar pasta!")
      fetchFolders()
    } catch (error) {
      window.alert("Erro ao criar pasta!")
    }
  }

  const updateFolder = async (id: string) => {
    try {
      const name = window.prompt('Digite o novo nome da pasta...')
      if (!name) return
      if (name.trim().length <= 0) return window.alert('Nome muito curto!')
      const response = await fetch(`${url}/folder/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })
      if (!response.ok) {
        window.alert("Erro ao editar pasta!")
      }
      window.alert("Sucesso ao editar pasta!")
      fetchFolders()
    } catch (error) {
      window.alert("Erro ao editar pasta!")
    }
  }

  const deleteFolder = async (id: string) => {
    try {
      const response = await fetch(`${url}/file/folder/${id}`)
      const files = await response.json()
      if (files.length > 0) {
        return window.alert("Erro, a pasta deve estar vazia para ser excluída!")
      }

      const result = await fetch(`${url}/folder/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!result.ok) {
        window.alert("Erro ao excluir pasta!")
      }
      window.alert("Sucesso ao excluir pasta!")
      fetchFolders()
    } catch (error) {
      window.alert("Erro ao excluir pasta!")
    }
  }

  const unlock = () => {
    const name = window.prompt('Digite a senha...')
    if (name === process.env.NEXT_PUBLIC_UNLOCK) {
      fetchFolders("~")
      return
    }
    window.alert("Erro!")
  }

  useEffect(() => {
    fetchFolders()
  }, [])

  if (isLoading) {
    return <Status content="Carregando..." type="loading" />
  }

  if (!folders) {
    return <Status content="Erro" type="error" />
  }

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto px-2">
      {/* ÁREAS INVISÍVEIS DE INTERAÇÃO (Easter Eggs) */}
      <div className="w-full flex justify-between mb-2">
        <div className="w-12 h-8 cursor-default opacity-0" onDoubleClick={() => fetchFolders("+")} />
        <div className="w-12 h-8 cursor-default opacity-0" onDoubleClick={unlock} />
      </div>

      {/* BOTÃO CRIAR PASTA - Centralizado e Estilizado */}
      <div className="flex flex-col items-center mb-8 group">
        <button
          onClick={createFolder}
          className="p-3 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 hover:text-blue-400 hover:border-blue-400 hover:bg-blue-400/5 transition-all duration-300 group-active:scale-95"
        >
          <Plus size={32} />
        </button>
        <span className="text-xs text-gray-500 mt-2 font-medium uppercase tracking-widest group-hover:text-blue-400 transition-colors">
          Nova Pasta
        </span>
      </div>

      {/* LISTA DE PASTAS */}
      <ul className="flex flex-col space-y-3 w-full">
        {folders.map((item: FolderType) => (
          <li
            key={item.id}
            className="flex items-center justify-between p-4 bg-gray-800/60 border border-gray-700 rounded-xl shadow-lg hover:bg-gray-800 hover:border-gray-500 transition-all group w-full"
          >
            {/* LADO ESQUERDO: Ícone e Nome (Área de clique principal) */}
            <div
              className="flex items-center space-x-4 flex-1 min-w-0 cursor-pointer"
              onClick={() => router.push(`/files-list/${item.id}`)}
            >
              <div className="p-2 bg-yellow-500/10 rounded-lg group-hover:bg-yellow-500/20 transition-colors">
                <Folder className="w-6 h-6 text-yellow-500 fill-current" />
              </div>
              <p className="text-gray-200 font-bold truncate text-base sm:text-lg group-hover:text-white transition-colors">
                {item.name}
              </p>
            </div>

            {/* LADO DIREITO: Ações */}
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={(e) => { e.stopPropagation(); updateFolder(item.id); }}
                className="p-2.5 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-full transition-all"
                title="Renomear"
              >
                <Edit size={20} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteFolder(item.id); }}
                className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all"
                title="Excluir"
              >
                <Trash size={20} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
