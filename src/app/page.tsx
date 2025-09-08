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
    return <Status content="Carregando..." />
  }

  if (!folders) {
    return <Status content="Erro" />
  }

  return (
    <>
      <div className=" w-full flex justify-between">
        <div className="w-10 h-6" onDoubleClick={() => fetchFolders("+")}/>
        <div className="w-10 h-6" onDoubleClick={unlock}/>
      </div>
      <Plus
        size={40}
        className="border-2 border-gray-300 rounded-md text-gray-300 cursor-pointer mb-10"
        onClick={createFolder}
      />
      <ul className="flex flex-col items-center space-y-2 w-full">
        {folders.map((item: FolderType) => (
          <li key={item.id} className="flex flex-row items-center justify-between p-4 bg-gray-800 rounded-md shadow-sm w-full">
            <div
              className="flex space-x-2 active:text-gray-600 transition-colors duration-300 cursor-pointer"
              onClick={() => router.push(`/files-list/${item.id}`)}
            >
              <Folder className="text-gray-300" />
              <p className="text-gray-300 font-bold">{item.name}</p>
            </div>

            <div className="flex space-x-4">
              <Edit
                className="text-gray-300 active:text-gray-600 transition-colors duration-300 cursor-pointer"
                onClick={() => updateFolder(item.id)}
              />
              <Trash
                className="text-gray-300 active:text-gray-600 transition-colors duration-300 cursor-pointer"
                onClick={() => deleteFolder(item.id)}
              />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
