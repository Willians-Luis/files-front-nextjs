'use client'

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload } from "lucide-react"
import url from "@/app/api/url";


interface Props {
  refetchFiles: () => void;
  folderId: string;
}

export function UploadFile({ refetchFiles, folderId }: Props) {
  const [isLoading, setIsLoading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const formData = new FormData()
    acceptedFiles.forEach((file) => {
      formData.append("file", file)
    })

    try {
      setIsLoading(true)
      const response = await fetch(`${url}/file/upload/folder/${folderId}`, {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        window.alert("Erro ao enviar arquivo!")
      }
      window.alert("Sucesso ao enviar arquivo!")
      refetchFiles()
    } catch (error) {
      alert("Erro ao enviar arquivo!")
    } finally {
      setIsLoading(false)
    }
  }, [folderId, refetchFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  })

  return (
    <div
      {...getRootProps()}
      className={`flex items-center justify-center w-80 h-28 p-4 border-2 border-dashed rounded-md transition-colors 
      duration-300 cursor-pointer ${isDragActive ? "border-green-500" : "border-slate-100"} hover:bg-sky-800`}
    >
      <input {...getInputProps()} />
      {isLoading ? (
        <div className="flex items-center">
          <svg
            className="animate-spin h-5 w-5 mr-3 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-center text-slate-100">Carregando...</p>
        </div>
      ) : (
        <div className="flex items-center flex-col">
          <Upload className={`text-center ${isDragActive ? "text-green-500" : "text-slate-100"}`} />
          <p className={`text-center ${isDragActive ? "text-green-500" : "text-slate-100"}`}>
            {isDragActive ? "Solte os arquivos aqui ..." : "Arraste ou clique para enviar arquivos"}
          </p>
        </div>
      )}
    </div>
  )
}