import React from 'react'
import url from '@/app/api/url'
import { FileType } from '@/types/file-type'


interface Props {
  params: Promise<{ id: string }>
}

export default async function VideoPlayer({ params }: Props) {
  const { id } = await params

  const response = await fetch(url + `/file/${id}`)
  const data: FileType = await response.json()

  return (
    <>
      <h1 className='text-slate-100'>{data.name}</h1>
      <video controls className='m-auto w-96'>
        <source src={`${url}/file/stream/${data.filename}`} type='video/mp4' />
        Seu navegador não suporta a tag de vídeo.
      </video>
    </>
  )
}
