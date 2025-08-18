import type React from "react"
export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="h-full">
      <head>
        <style>{`
          body {
            background: transparent !important;
            margin: 0;
            padding: 0;
          }
        `}</style>
      </head>
      <body className="h-full bg-transparent">{children}</body>
    </html>
  )
}
