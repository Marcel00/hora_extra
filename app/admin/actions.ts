'use server'

import { authenticateAdmin } from '@/lib/admin-auth'

export async function loginAdmin(email: string, password: string) {
  try {
    const user = await authenticateAdmin(email, password)
    
    if (!user) {
      return { success: false, error: 'Credenciais inválidas' }
    }

    return { success: true, user }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'Erro ao fazer login' }
  }
}
