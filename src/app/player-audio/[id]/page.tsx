import url from '@/app/api/url'
import { FileType } from '@/types/file-type'


interface Props {
  params: Promise<{ id: string }>
}

export default async function AudioPlayer({ params }: Props) {
  const { id } = await params

  const response = await fetch(url + `/file/${id}`)
  const data: FileType = await response.json()

  return (
    <>
      <h1 className='text-slate-100'>{data.name}</h1>
      <audio controls className="w-80">
        <source src={`${url}/file/stream/${data.filename}`} type={data.mimetype} />
        Seu navegador não suporta a tag de áudio.
      </audio>
    </>
  )
}
