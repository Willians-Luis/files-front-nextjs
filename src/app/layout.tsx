import { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Server",
  description: "Gerenciamento de arquivos via LAN",
  openGraph: {
    title: "Server",
    description: "Gerenciamento de arquivos via LAN",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
    }
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body
        className={`antialiased`}
      >
        <div className="flex flex-col items-center min-h-screen bg-gray-950">
          {children}
        </div>
      </body>
    </html>
  );
}
