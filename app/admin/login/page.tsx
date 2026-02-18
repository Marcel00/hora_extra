'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuthStore } from '@/lib/admin-auth-store'
import { loginAdmin } from '../actions'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default function AdminLoginPage() {
  const router = useRouter()
  const { login } = useAdminAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await loginAdmin(email, password)

    if (result.success && result.user) {
      login(result.user)
      router.push('/admin')
    } else {
      setError(result.error || 'Erro ao fazer login')
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <ThemeToggle />
      
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Login Administrativo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Hora Extra
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              E-mail
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="h-12 text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Senha
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="h-12 text-lg"
            />
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900 border-2 border-red-500 dark:border-red-600 rounded-lg p-4 text-center">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 text-lg font-bold"
          >
            {loading ? 'Entrando...' : 'Acessar Painel'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm underline"
          >
            ← Voltar para Início
          </button>
        </div>
      </Card>
    </main>
  )
}
