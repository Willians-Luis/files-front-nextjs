interface Props {
  content: string;
}

export function Status({ content }: Props) {
  return (
    <div className="flex flex-col min-h-screen items-center space-y-4">
      <h1 className="text-slate-100">{content}</h1>
    </div>
  )
}
