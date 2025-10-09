import "./globals.css"
import type { Metadata } from "next"


export const metadata: Metadata = {
  title: "Vi-Farm Admin Dashboard",
  description: "Admin panel for managing vendors, buyers, products, and orders",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex bg-gray-50">
        {/* Sidebar */}


        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </body>
    </html>
  )
}

