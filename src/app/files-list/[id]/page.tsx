import { Folder } from "lucide-react"
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
        <div className="min-h-screen bg-gray-900 pb-10 w-full">

            {/* HEADER: w-full garante que a linha do topo vá de ponta a ponta */}
            <header className="w-full bg-gray-800/60 border-b border-gray-700 sticky top-0 z-20 backdrop-blur-md">
                <div className="w-full px-4 py-4 md:py-6">
                    {/* Aqui dentro removemos o max-w-5xl ou centralizamos apenas o conteúdo se preferir */}
                    <div className="flex items-center gap-3 md:gap-4 max-w-7xl mx-auto">
                        <div className="flex-shrink-0 p-2 bg-blue-500/10 rounded-lg">
                            <Folder className="w-6 h-6 text-yellow-500 fill-current" />
                            {/* <FolderOpen className="text-blue-400 w-6 h-6 md:w-8 md:h-8" /> */}
                        </div>

                        <div className="flex flex-col min-w-0">
                            <span className="text-[9px] md:text-[10px] text-blue-400 uppercase tracking-widest font-bold">
                                Diretório
                            </span>
                            <h1 className="text-lg md:text-2xl font-bold text-white truncate">
                                {data.name}
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN: Ajustado para não dar "zoom" no mobile e ocupar espaço no PC */}
            <main className="w-full px-2 md:px-6 mt-6">
                <div className="w-full max-w-[100%] lg:max-w-7xl mx-auto">
                    <List folder={data} />
                </div>
            </main>
        </div>
    )
}