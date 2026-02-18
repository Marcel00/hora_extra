import { prisma } from './lib/db'
import { hashPassword } from './lib/admin-auth'

async function seedAdmin() {
  const existingAdmin = await prisma.usuario.findUnique({
    where: { email: 'admin@horaextra.com' },
  })

  if (existingAdmin) {
    console.log('✅ Admin user already exists')
    return
  }

  const hashedPassword = await hashPassword('admin')

  await prisma.usuario.create({
    data: {
      email: 'admin@horaextra.com',
      senha: hashedPassword,
      nome: 'Administrador',
      role: 'admin',
      ativo: true,
    },
  })

  console.log('✅ Admin user created: admin@horaextra.com / admin')
}

seedAdmin()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
