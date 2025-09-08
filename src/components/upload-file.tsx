import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import url from '@/app/api/url';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  loaded?: number;
  total?: number;
  currentChunk?: number;
  totalChunks?: number;
}

interface Props {
  refetchFiles: () => void;
  folderId: string;
}

export function UploadFile({ refetchFiles, folderId }: Props) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const abortControllers = useRef(new Map<string, AbortController>());

  const uploadFileInChunks = async (fileObj: UploadFile) => {
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB por chunk
    const totalChunks = Math.ceil(fileObj.file.size / CHUNK_SIZE);

    // Atualizar informações totais do arquivo
    setFiles(prev => prev.map(f =>
      f.id === fileObj.id ? {
        ...f,
        totalChunks,
        currentChunk: 0,
        status: 'uploading'
      } : f
    ));

    // Criar um AbortController para este arquivo
    const abortController = new AbortController();
    abortControllers.current.set(fileObj.id, abortController);

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      // Verificar se o upload foi cancelado
      if (abortController.signal.aborted) {
        break;
      }

      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, fileObj.file.size);
      const chunk = fileObj.file.slice(start, end);

      try {
        const response = await fetch(`${url}/file/upload/folder/${folderId}`, {
          method: 'POST',
          body: chunk,
          headers: {
            'File-Name': encodeURIComponent(fileObj.file.name),
            'Chunk-Index': chunkIndex.toString(),
            'Total-Chunks': totalChunks.toString(),
            'Content-Type': encodeURIComponent(fileObj.file.type),
          },
          signal: abortController.signal
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Atualizar progresso
        const progress = Math.round(((chunkIndex + 1) / totalChunks) * 100);
        setFiles(prev => prev.map(f =>
          f.id === fileObj.id ? {
            ...f,
            progress,
            currentChunk: chunkIndex + 1,
            loaded: (chunkIndex + 1) * CHUNK_SIZE,
            total: fileObj.file.size
          } : f
        ));

      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Upload cancelado');
          break;
        } else {
          console.error('Erro no chunk:', chunkIndex, error);
          setFiles(prev => prev.map(f =>
            f.id === fileObj.id ? {
              ...f,
              status: 'error'
            } : f
          ));
          break;
        }
      }
    }

    // Remover o abort controller
    abortControllers.current.delete(fileObj.id);

    // Se completou todos os chunks, marcar como concluído
    setFiles(prev => prev.map(f => {
      if (f.id === fileObj.id && f.status === 'uploading' && f.currentChunk === f.totalChunks) {
        return {
          ...f,
          status: 'completed',
          progress: 100
        };
      }
      return f;
    }));
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending',
      id: Math.random().toString(36).substr(2, 9),
      loaded: 0,
      total: file.size,
      currentChunk: 0,
      totalChunks: 0
    }));

    setFiles(prevFiles => [...prevFiles, ...newFiles]);
    startUpload(newFiles);
  }, []);

  const startUpload = async (filesToUpload: UploadFile[]) => {
    setIsUploading(true);

    for (const fileObj of filesToUpload) {
      await uploadFileInChunks(fileObj);
    }

    // Verificar se todos os uploads terminaram
    const allDone = files.every(f => f.status === 'completed' || f.status === 'error');
    if (allDone) {
      //refetchFiles();
    }
  };

  const cancelUpload = (fileId: string) => {
    const controller = abortControllers.current.get(fileId);
    if (controller) {
      controller.abort();
    }

    setFiles(prev => prev.filter(f => f.id !== fileId));

    // Se não há mais arquivos, mostra a caixa de upload novamente
    if (files.length === 1) {
      setIsUploading(false);
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));

    // Se não há mais arquivos, mostra a caixa de upload novamente
    if (files.length === 1) {
      setIsUploading(false);
      refetchFiles();
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024 * 1024, // 10GB em bytes
    disabled: isUploading,
  });

  const getStatusColor = (status: UploadFile['status']) => {
    switch (status) {
      case 'uploading': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'uploading':
        return (
          <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 mb-4">
      {!isUploading && files.length === 0 ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-gray-900' : 'border-gray-300 hover:border-gray-600'}`}
        >
          <input {...getInputProps()} />

          <div className={`space-y-4  ${isDragActive ? 'text-gray-600' : 'text-gray-600'}`}>
            <div>
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>

            <div>
              <h3 className="text-lg font-semibold">
                {isDragActive ? 'Solte o arquivo aqui' : 'Arraste e solte arquivos'}
              </h3>
              <p className="text-sm">
                ou clique para selecionar
              </p>
            </div>
          </div>

        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-300">Uploads em andamento</h3>

          {files.map((fileObj) => (
            <div key={fileObj.id} className="rounded-lg p-4 bg-gray-300 shadow-sm h-24">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="flex-shrink-0">
                    {getStatusIcon(fileObj.status)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fileObj.file.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {fileObj.status === 'uploading' && (
                    <button
                      onClick={() => cancelUpload(fileObj.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Cancelar upload"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}

                  {(fileObj.status === 'completed' || fileObj.status === 'error') && (
                    <button
                      onClick={() => removeFile(fileObj.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                      title="Remover"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/*barra de status*/}
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 mb-1 rounded-full transition-all duration-300 ${getStatusColor(fileObj.status)}`}
                    style={{ width: `${fileObj.progress}%` }}
                  />
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">
                      {formatFileSize(fileObj.file.size)}
                    </span>
                    {fileObj.status === 'uploading' && fileObj.totalChunks && (
                      <span className="text-xs text-gray-500">
                        {fileObj.progress}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {files.length === 0 && (
            <button
              onClick={() => setIsUploading(false)}
              className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Voltar para upload
            </button>
          )}
        </div>
      )}
    </div>
  );
}