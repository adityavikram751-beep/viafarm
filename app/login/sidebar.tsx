/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  ShoppingBasket,
  Users,
  ShoppingCart,
  Settings,
  LayoutDashboard,
  Image as ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const routes = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: ShoppingBasket },
  { href: "/vendors", label: "Vendors", icon: Users },
  { href: "/buyers", label: "Buyers", icon: Users },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/manageapp", label: "Manage App", icon:ImageIcon },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white rounded-r-4xl border-r-4 flex flex-col border-amber-600">
      {/* Logo */}
      <div className="p-6 border-b">
        <h1 className="text-4xl font-bold text-gray-900">Via Farm</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-2">
        {routes.map((route) => {
          const Icon = route.icon
          const isActive = pathname === route.href

          return (
            <Link key={route.href} href={route.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-48 justify-start text-gray-900 p-2 m-4 rounded-lg transition-all duration-200 font-semibold",
                  isActive
                    ? "bg-green-500 text-white hover:bg-green-500"
                    : "hover:bg-green-500 hover:text-white"
                )}
              >
                <Icon className="mr-2 h-4 w-4" />
                {route.label}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <p className="text-xs text-gray-500">© 2025 Via Farm</p>
      </div>
    </aside>
  )
}
