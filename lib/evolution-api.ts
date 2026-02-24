/**
 * Cliente para Evolution API (WhatsApp).
 * Envio de mensagens de texto via POST /message/sendText/{instance}
 * @see https://doc.evolution-api.com/v2/api-reference/message-controller/send-text
 */

function getConfig() {
  const baseUrl = process.env.EVOLUTION_API_URL?.replace(/\/$/, '')
  const instance = process.env.EVOLUTION_INSTANCE
  const apikey = process.env.EVOLUTION_API_KEY
  return { baseUrl, instance, apikey }
}

/**
 * Garante número no formato esperado pela Evolution: 5511999999999 (país + DDD + número)
 */
export function formatNumberForEvolution(telefone: string): string {
  const digits = telefone.replace(/\D/g, '')
  if (digits.length >= 12 && digits.startsWith('55')) return digits
  if (digits.length >= 10) return '55' + digits
  return ''
}

/**
 * Envia uma mensagem de texto para um número via Evolution API.
 * Retorna true se enviou com sucesso, false caso contrário (não lança erro).
 */
export async function sendEvolutionText(
  number: string,
  text: string
): Promise<{ ok: boolean; error?: string }> {
  const { baseUrl, instance, apikey } = getConfig()
  if (!baseUrl || !instance) {
    console.warn('[Evolution API] EVOLUTION_API_URL ou EVOLUTION_INSTANCE não configurados.')
    return { ok: false, error: 'Evolution API não configurada' }
  }

  const normalized = formatNumberForEvolution(number)
  if (!normalized) {
    console.warn('[Evolution API] Número inválido:', number)
    return { ok: false, error: 'Número inválido' }
  }

  const url = `${baseUrl}/message/sendText/${instance}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (apikey) headers['apikey'] = apikey

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ number: normalized, text }),
    })
    if (!res.ok) {
      const body = await res.text()
      console.error('[Evolution API] Erro ao enviar:', res.status, body)
      return { ok: false, error: body || res.statusText }
    }
    return { ok: true }
  } catch (err) {
    console.error('[Evolution API] Falha de rede:', err)
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Erro ao enviar',
    }
  }
}
