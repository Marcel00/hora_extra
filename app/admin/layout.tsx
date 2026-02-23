'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { useAdminAuthStore } from '@/lib/admin-auth-store'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, logout, user } = useAdminAuthStore()

  useEffect(() => {
    if (!isAuthenticated && pathname !== '/admin/login') {
      router.push('/admin/login')
    }
  }, [isAuthenticated, pathname, router])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  // Don't show layout on login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (!isAuthenticated) {
    return null
  }

  const navItems = [
    { href: '/admin', label: '📊 Dashboard', icon: '📊' },
    { href: '/admin/cardapio', label: '📋 Cardápio', icon: '📋' },
    { href: '/admin/pontos', label: '📍 Pontos', icon: '📍' },
    { href: '/admin/config', label: '⚙️ Config', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <ThemeToggle />
      
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="Hora Extra"
                  width={120}
                  height={60}
                  className="h-10 w-auto object-contain"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    Painel Admin
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Hora Extra
                  </p>
                </div>
              </Link>

              <div className="hidden md:flex items-center gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      pathname === item.href
                        ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {user?.nome}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
              <Button onClick={handleLogout} variant="secondary">
                🚪 Sair
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden mt-4 flex gap-2 overflow-x-auto pb-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                  pathname === item.href
                    ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
