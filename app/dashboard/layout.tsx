import "../globals.css"
import type { Metadata } from "next"
import { Sidebar } from "../login/sidebar"

export const metadata: Metadata = {
  title: "Via-Farm Admin Dashboard",
  description: "Admin panel for managing vendors, buyers, products, and orders",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {/* ✅ Keep background same on both sides */}
      <body className="flex bg-gray-100">
        <div className="flex min-h-screen">
          <aside className="fixed left-0 top-0 h-screen w-64 overflow-y-auto">
            <Sidebar />
          </aside>

          <main className="flex-1 ml-64 p-10">{children}</main>
        </div>
      </body>
    </html>
  )
}
