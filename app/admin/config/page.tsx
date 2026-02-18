import { prisma } from '@/lib/db'
import { ConfigClient } from './ConfigClient'

export default async function ConfigPage() {
  const [config, cardapio] = await Promise.all([
    prisma.configuracao.findFirst(),
    prisma.cardapio.findFirst({ where: { ativo: true } }),
  ])

  const defaultConfig = {
    horarioAbertura: config?.horarioAbertura || '08:00',
    horarioFechamento: config?.horarioFechamento || '11:00',
    mensagemWhatsApp:
      config?.mensagemWhatsApp ||
      '🍱 *Pedido Confirmado!*\n\nOlá {nome}!\n\nSeu pedido foi recebido com sucesso.',
    telefoneNotificacao: config?.telefoneNotificacao || '',
  }

  const precoMarmita = cardapio?.preco || 20.0

  return <ConfigClient config={defaultConfig} precoMarmita={precoMarmita} />
}
