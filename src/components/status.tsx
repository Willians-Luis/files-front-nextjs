interface Props {
  content: string;
}

export function Status({ content }: Props) {
  return (
    <div className="flex flex-col min-h-screen items-center space-y-4">
      <h1 className="text-gray-300">{content}</h1>
    </div>
  )
}
