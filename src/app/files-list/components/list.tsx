'use client'

import url from "@/app/api/url"
import { Image } from "@/components/image"
import { Status } from "@/components/status"
import { UploadFile } from "@/components/upload-file"
import { FileType } from "@/types/file-type"
import { FolderType } from "@/types/folder-type"
import { Download, Edit, Music, Play, Trash } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function List({ folder }: { folder: FolderType }) {

    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [files, setFiles] = useState<FileType[] | null>([])

    const fetchFiles = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${url}/file/folder/${folder.id}`)
            const data = await response.json()
            const sortedFolders = data.sort((a: any, b: any) => a.name.localeCompare(b.name))
            setFiles(sortedFolders)
        } catch (error) {
            setFiles(null)
        } finally {
            setIsLoading(false)
        }
    }

    const updateFile = async (file: FileType) => {
        try {
            const name = window.prompt("Digite o novo nome do arquivo...")
            if (!name) return
            if (name.trim().length <= 0) return window.alert('Nome muito curto!')
            const response = await fetch(`${url}/file/${file.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name }),
            })
            if (!response.ok) {
                return window.alert("Erro ao editar arquivo!")
            }
            window.alert("Sucesso ao editar arquivo!")
            fetchFiles()
        } catch (error) {
            window.alert("Erro ao editar arquivo!")
        }
    }

    const deleteFile = async (filename: string) => {
        if (window.confirm("Deseja apagar este arquivo?")) {
            try {
                const response = await fetch(`${url}/file/${filename}`, {
                    method: 'DELETE',
                })
                if (!response.ok) {
                    return window.alert("Erro ao excluir arquivo!")
                }
                window.alert("Sucesso ao excluir arquivo!")
                fetchFiles()
            } catch (error) {
                window.alert("Erro ao excluir arquivo!")
            }
        }
    }

    const formatFileSize = (sizeInBytes: number): string => {
        const sizeInKB = sizeInBytes / 1024
        return `${sizeInKB.toFixed(0).padStart(10).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ".")} KB`
    }

    const handlePlay = (filename: string) => {
        const isAndroid = /Android/i.test(navigator.userAgent);
        const streamUrl = `192.168.31.145:3333/file/stream/${encodeURIComponent(filename)}`

        if (isAndroid) {
            // Formato Intent para Android
            window.location.href = `intent://${streamUrl}#Intent;scheme=http;type=video/*;end`
        } else {
            // Formato padrão para PC/iOS (Tente o %3A se o : sumir)
            window.location.href = `vlc:http://${streamUrl}`
        }
    }

    useEffect(() => {
        fetchFiles()
    }, [folder.id])

    if (isLoading) {
        return <Status content="Carregando..." />
    }

    if (!files || !folder) {
        return <Status content="Erro" />
    }
    return (
        <>
            <UploadFile refetchFiles={() => fetchFiles()} folderId={folder.id} />

            <ul className="flex flex-col items-center space-y-4 w-full max-w-4xl mx-auto px-2">
                {files.map((item) => (
                    <li
                        key={item.id}
                        className="flex flex-col w-full p-4 bg-gray-800/60 border border-gray-700 rounded-xl shadow-lg transition-all gap-3"
                    >
                        {/* LINHA SUPERIOR: Player Principal + Nome do Arquivo */}
                        <div className="flex items-center gap-3 w-full">
                            <div className="flex-shrink-0">
                                {item.mimetype.includes("video") && (
                                    <Link href={`/player-video/${item.id}`} className="block p-2 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors">
                                        <Play className="w-6 h-6 text-blue-400 fill-current" />
                                    </Link>
                                )}
                                {item.mimetype.includes("audio") && (
                                    <Link href={`/player-audio/${item.id}`} className="block p-2 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-colors">
                                        <Music className="w-6 h-6 text-purple-400" />
                                    </Link>
                                )}
                                {item.mimetype.includes("image") && (
                                    <Link href={`/player-image/${item.id}`} className="block w-10 h-10 rounded-lg overflow-hidden border border-gray-600">
                                        <Image filename={item.filename} alt="Preview" />
                                    </Link>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-gray-100 font-semibold truncate text-base">
                                    {item.name.toLowerCase()}
                                </p>
                            </div>
                        </div>

                        {/* LINHA INFERIOR: VLC, Tamanho e Botões de Ação */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
                            <div className="flex items-center gap-3">
                                {/* Botão VLC (Apenas se for vídeo) */}
                                {item.mimetype.includes("video") && (
                                    <button
                                        onClick={() => handlePlay(item.filename)}
                                        className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-black px-3 py-1.5 rounded-md uppercase shadow-sm active:scale-95 transition-all"
                                    >
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                        VLC
                                    </button>
                                )}

                                {/* Tamanho do Arquivo */}
                                <span className="text-xs font-mono text-gray-400 bg-gray-900/50 px-2 py-1 rounded">
                                    {formatFileSize(item.size)}
                                </span>
                            </div>

                            {/* Grupo de Ações */}
                            <div className="flex items-center gap-1 sm:gap-2">
                                <a
                                    href={`${url}/file/download/${item.filename}`}
                                    download
                                    className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-400/10 rounded-lg transition-all"
                                >
                                    <Download className="w-5 h-5" />
                                </a>

                                <button
                                    onClick={() => updateFile(item)}
                                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={() => deleteFile(item.filename)}
                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                >
                                    <Trash className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </>
    )
}