import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Verifica se está dentro do horário de pedidos (08h-11h)
 */
export function isPedidoAberto(horarioAbertura: string, horarioFechamento: string): boolean {
  const now = new Date()
  const hora = now.getHours()
  const minuto = now.getMinutes()
  const horaAtual = hora * 60 + minuto
  
  const [horaAb, minAb] = horarioAbertura.split(':').map(Number)
  const [horaFech, minFech] = horarioFechamento.split(':').map(Number)
  
  const abertura = horaAb * 60 + minAb
  const fechamento = horaFech * 60 + minFech
  
  return horaAtual >= abertura && horaAtual < fechamento
}

/**
 * Formata telefone para WhatsApp (apenas números)
 */
export function formatarTelefoneWhatsApp(telefone: string): string {
  return telefone.replace(/\D/g, '')
}

/**
 * Formata valor em reais
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

/**
 * Formata data e hora
 */
export function formatarDataHora(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(data))
}

/**
 * Formata apenas hora
 */
export function formatarHora(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(data))
}
