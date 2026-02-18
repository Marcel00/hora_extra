import { prisma } from '@/lib/db'
import { ConfigClient } from './ConfigClient'

export default async function ConfigPage() {
  const config = await prisma.configuracao.findFirst()

  return <ConfigClient config={config} />
}
