'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname()
  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/caselisting", label: "Case Listings" },
    { href: "/fraudalert", label: "Fraud Reports" },
    { href: "/uploadorder", label: "Upload Order" },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex-shrink-0 flex items-center">
                <Image
                  src="/logo.svg"
                  alt="Litigence Logo"
                  width={70}
                  height={70}
                  priority
                />
                <span className="ml-2 text-2xl font-bold text-gray-900">Litigence</span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <NavItem key={item.href} {...item} isActive={pathname === item.href} />
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs justify-center align-items">3</Badge>
                    <span className="sr-only">Notifications</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>New high-risk alert: CASE-1095</DropdownMenuItem>
                  <DropdownMenuItem>5 cases require investigation</DropdownMenuItem>
                  <DropdownMenuItem>Monthly fraud report available</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

interface NavItemProps {
  href: string
  label: string
  isActive: boolean
}

function NavItem({ href, label, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ease-in-out",
        isActive
          ? "border-indigo-500 text-gray-900"
          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
      )}
    >
      {label}
    </Link>
  )
}