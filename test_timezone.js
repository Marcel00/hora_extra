// Simular UTC (Node na Vercel roda em UTC)
// process.env.TZ = 'UTC' // Não funciona dentro do script node diretamente para mudar o comportamento do Date, mas a lógica deve independer

const now = new Date(); // Atual d máquina
console.log('Data da máquina (ISO):', now.toISOString());

// Implementação anterior (Suspeita)
const dataBrasiliaHacky = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
console.log('Hacky Hours:', dataBrasiliaHacky.getHours());

// Implementação Robusta proposta
const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Sao_Paulo',
  hour: 'numeric',
  minute: 'numeric',
  hour12: false
});

const parts = formatter.formatToParts(now);
const hora = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
const minuto = parseInt(parts.find(p => p.type === 'minute')?.value || '0');

console.log(`Robusta: ${hora}:${minuto}`);

const horaPadrao = now.getHours();
console.log(`Padrão (Sem ajuste): ${horaPadrao}`);
