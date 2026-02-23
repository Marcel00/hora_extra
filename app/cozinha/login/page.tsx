'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuthStore } from '@/lib/auth-store'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function LoginCozinha() {
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const router = useRouter()
  const login = useAuthStore((state) => state.login)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')

    if (login(senha)) {
      router.push('/cozinha')
    } else {
      setErro('Senha incorreta!')
      setSenha('')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <Image
            src="/logo.png"
            alt="Hora Extra"
            width={200}
            height={100}
            className="mx-auto mb-4 h-auto w-full max-w-[200px] object-contain"
          />
          <h1 className="text-2xl sm:text-4xl font-bold text-orange-600 dark:text-orange-500 mb-2">
            🔐 Acesso Cozinha
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Digite a senha para acessar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="senha" 
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              Senha
            </label>
            <Input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite a senha"
              autoFocus
              required
              className="min-h-[44px]"
            />
            {erro && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {erro}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full min-h-[48px]" variant="primary">
            Entrar
          </Button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
          >
            ← Voltar para página inicial
          </a>
        </div>
      </Card>
    </main>
  )
}
