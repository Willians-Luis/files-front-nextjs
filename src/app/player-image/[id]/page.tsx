import url from '@/app/api/url'
import { FileType } from '@/types/file-type'

import { Image } from '@/components/image'


interface Props {
  params: Promise<{ id: string }>
}

export default async function AudioPlayer({ params }: Props) {
  const { id } = await params

  const response = await fetch(url + `/file/${id}`)
  const data: FileType = await response.json()

  return (
    <Image filename={data.filename} alt={"Imagem"} size="large" />
  )
}
