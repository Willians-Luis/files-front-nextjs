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
                window.alert("Erro ao editar arquivo!")
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
                    window.alert("Erro ao excluir arquivo!")
                }
                window.alert("Sucesso ao excluir arquivo!")
                fetchFiles()
            } catch (error) {
                window.alert("Erro ao excluir arquivo!")
            }
        }
    }

    const downloadFileByFilename = async (filename: string) => {
        try {
            if (window.confirm("Deseja iniciar o download?")) {
                const response = await fetch(`${url}/file/download/${filename}`)

                if (!response.ok) {
                    throw new Error('Erro ao baixar o arquivo')
                }

                const blob = await response.blob()
                const downloadUrl = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.style.display = 'none'
                a.href = downloadUrl
                a.download = filename
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(downloadUrl)
            }
        } catch (error) {
            window.alert("Erro ao baixar arquivo!")
        }
    }

    const formatFileSize = (sizeInBytes: number): string => {
        const sizeInKB = sizeInBytes / 1024
        return `${sizeInKB.toFixed(0).padStart(10).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ".")} KB`
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

            <ul className="flex flex-col items-center space-y-2 w-full">
                {files.map((item) => (
                    <li
                        key={item.id}
                        className="flex items-center justify-between w-full p-2 bg-gray-950 rounded-md shadow-sm transition-colors duration-300 space-x-4"
                    >
                        <div className="flex space-x-2 items-center overflow-x-hidden">
                            <div className=" flex items-center justify-center w-14">
                                {item.mimetype.includes("video") && (
                                    <Link href={`/player-video/${item.id}`}>
                                        <Play className="w-6 h-6 text-slate-200 rounded-md hover:bg-gray-700 active:bg-gray-600" />
                                    </Link>
                                )}
                                {item.mimetype.includes("audio") && (
                                    <Link href={`/player-audio/${item.id}`}>
                                        <Music className="w-6 h-6 text-slate-200 rounded-md hover:bg-gray-700 active:bg-gray-600" />
                                    </Link>
                                )}
                                {item.mimetype.includes("image") && (
                                    <Link href={`/player-image/${item.id}`} className="w-14">
                                        <Image filename={item.filename} alt="Imagem" />
                                    </Link>
                                )}
                            </div>
                            <div className="flex flex-col flex-1">
                                <p className="text-slate-200 overflow-hidden">
                                    {`${item.name.replace(/^\d+_/, '').toLowerCase()}`}
                                </p>
                                <p className="text-slate-200 overflow-hidden">
                                    {formatFileSize(item.size)}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 items-center sm:flex-row">
                            <Download
                                onClick={() => downloadFileByFilename(item.filename)}
                                className="w-6 h-6 text-slate-200 rounded-md hover:bg-gray-700 active:bg-gray-600 cursor-pointer"
                            />

                            <Edit
                                onClick={() => updateFile(item)}
                                className="w-6 h-6 text-slate-200 rounded-md hover:bg-gray-700 active:bg-gray-600 cursor-pointer"
                            />

                            <Trash
                                onClick={() => deleteFile(item.filename)}
                                className="w-6 h-6 text-slate-200 rounded-md hover:bg-gray-700 active:bg-gray-600 cursor-pointer"
                            />
                        </div>
                    </li>
                ))}
            </ul>
        </>
    )
}