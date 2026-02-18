import bcrypt from 'bcryptjs'
import { prisma } from './db'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createAdminUser(
  email: string,
  password: string,
  nome: string
) {
  const hashedPassword = await hashPassword(password)
  
  return prisma.usuario.create({
    data: {
      email,
      senha: hashedPassword,
      nome,
      role: 'admin',
      ativo: true,
    },
  })
}

export async function authenticateAdmin(email: string, password: string) {
  const user = await prisma.usuario.findUnique({
    where: { email, ativo: true },
  })

  if (!user) {
    return null
  }

  const isValid = await verifyPassword(password, user.senha)
  if (!isValid) {
    return null
  }

  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    role: user.role,
  }
}
