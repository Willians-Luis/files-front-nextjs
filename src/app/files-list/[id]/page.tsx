import { FolderOpen } from "lucide-react"
import url from "@/app/api/url"
import List from "../components/list"
import { FolderType } from "@/types/folder-type"


interface Props {
    params: Promise<{ id: string }>
}

export default async function Files({ params }: Props) {
    const { id } = await params

    const response = await fetch(url + `/folder/${id}`)
    const data: FolderType = await response.json()

    return (
        <>
            <div className="flex w-full space-x-2">
                <FolderOpen className="text-slate-100" />
                <h1 className="text-xl text-slate-100">{data.name}</h1>
            </div>
            <List folder={data} />
        </>
    )
}