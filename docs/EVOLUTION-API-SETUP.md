# Como conseguir as variáveis da Evolution API (primeiro contato)

A Evolution API **não é um serviço que você acessa num site**. Você precisa **subir um servidor** (no seu PC, VPS ou em um serviço gratuito) e **criar uma instância** conectada ao seu WhatsApp. As 3 variáveis vêm desse processo.

---

## Sua aplicação está na Vercel

O **Hora Extra** roda na **Vercel**. Isso muda o seguinte:

| Onde você testa                 | Onde a Evolution precisa estar                                                                                             | Onde configurar as variáveis                                                                                                                                                         |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **No seu PC** (`yarn dev`)      | Pode ser `localhost` (Docker no PC)                                                                                        | `.env` na raiz do projeto                                                                                                                                                            |
| **Em produção** (app na Vercel) | **Tem que ser um servidor na internet** (Render, Railway, VPS). `localhost` **não funciona** — a Vercel não acessa seu PC. | **Dashboard da Vercel**: projeto → Settings → Environment Variables. Adicione `EVOLUTION_API_URL`, `EVOLUTION_INSTANCE` e `EVOLUTION_API_KEY` para Production (e Preview se quiser). |

**Resumo:** para o WhatsApp funcionar quando alguém acessar seu app pelo link da Vercel, você precisa:

1. Hospedar a **Evolution API na nuvem** (ex.: Render, plano free).
2. Colocar as **3 variáveis** no **painel da Vercel** (Environment Variables), não só no `.env` local.

---

## Resumo rápido

| Variável               | O que é                                          | Onde vem                                                                                  |
| ---------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| **EVOLUTION_API_URL**  | Endereço do servidor da Evolution que você subiu | URL do seu servidor (ex: `http://localhost:8080` ou `https://sua-evolution.onrender.com`) |
| **EVOLUTION_INSTANCE** | Nome da instância (uma “sessão” do WhatsApp)     | Você escolhe ao criar a instância (ex: `hora-extra`)                                      |
| **EVOLUTION_API_KEY**  | Chave para autenticar nas requisições            | Você define no .env **do servidor da Evolution** (e repete no .env do Hora Extra)         |

---

## Opção 1: Rodar no seu PC com Docker (mais fácil para testar)

### 1. Instalar Docker

- Windows/Mac: [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Depois de instalar, abra o terminal e teste: `docker --version`

### 2. Subir a Evolution API

No terminal (em qualquer pasta):

```bash
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=MinhaChaveSecreta123 \
  atendai/evolution-api:latest
```

- **AUTHENTICATION_API_KEY**: invente uma chave (ex: `MinhaChaveSecreta123`). Essa será sua **EVOLUTION_API_KEY** no Hora Extra.

### 3. Criar a instância e conectar o WhatsApp

1. Abra no navegador: **http://localhost:8080**
2. Se tiver interface, use; senão use a API direto:

**Criar instância** (no terminal ou Postman/Insomnia):

```bash
curl -X POST "https://evolution-api-p67i.onrender.com/instance/create" \
  -H "apikey: 07cbae6646d04d9fbe13dac94dd90d76" \
  -H "Content-Type: application/json" \
  -d '{"instanceName": "hora-extra", "integration": "WHATSAPP-BAILEYS", "qrcode": true}'
```

- Troque `MinhaChaveSecreta123` pela mesma chave que você colocou no `docker run`.
- **instanceName** `hora-extra` será sua **EVOLUTION_INSTANCE**.

3. A resposta traz um **QR code** (em base64) ou um link. Abra o link ou use um decodificador de base64 para ver o QR.
4. No celular: WhatsApp → Configurações → Aparelhos conectados → Conectar um aparelho → Escanear o QR code.

### 4. Preencher o .env do Hora Extra

No `.env` do projeto **hora_extra** (na raiz):

```env
EVOLUTION_API_URL="http://localhost:8080"
EVOLUTION_INSTANCE="hora-extra"
EVOLUTION_API_KEY="MinhaChaveSecreta123"
```

- Em produção você troca **EVOLUTION_API_URL** pela URL pública do servidor (ex: Render, VPS).

---

## Opção 2: Hospedar na nuvem (obrigatório para a app na Vercel)

Como o **Hora Extra está na Vercel**, em produção a Evolution **precisa** estar na internet (Render, Railway ou VPS). Senão a Vercel não consegue chamar a API.

### Render (plano free)

1. Crie uma conta em [render.com](https://render.com).

2. **Criar o banco PostgreSQL primeiro** (a Evolution exige banco):
   - **New → PostgreSQL**.
   - Dê um nome (ex: `evolution-db`), região mais próxima, plano **Free**.
   - Crie. Anote a **Internal Database URL** (você vai usar no passo 4).

3. **New → Web Service**.
   - Conecte o repositório [Evolution API](https://github.com/EvolutionAPI/evolution-api) (ou use um template/Blueprint que suba a Evolution com Docker).

4. No serviço da Evolution, em **Environment**, adicione **todas** estas variáveis (sem espaços extras no valor):

   | Key                               | Value                                                                                                                                                                                |
   | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
   | `AUTHENTICATION_API_KEY`          | Uma chave que você inventar (ex: `MinhaChaveSecreta123`)                                                                                                                             |
   | `DATABASE_PROVIDER`               | `postgresql`                                                                                                                                                                         |
   | `DATABASE_CONNECTION_URI`         | A **Internal Database URL** do PostgreSQL que você criou (ex: `postgresql://hora_extra_db_user:oqAcuF0TxBwH5mflhgGdurWjX22SOtEn@dpg-xxx-a.oregon-postgres.render.com/hora_extra_db`) |
   | `DATABASE_CONNECTION_CLIENT_NAME` | `evolution_exchange`                                                                                                                                                                 |
   | `SERVER_URL`                      | A URL do seu Web Service (ex: `https://evolution-xxx.onrender.com`) — pode preencher depois do 1º deploy                                                                             |
   | `CACHE_REDIS_ENABLED`             | `false` (para não exigir Redis no free tier)                                                                                                                                         |
   | `CACHE_LOCAL_ENABLED`             | `true`                                                                                                                                                                               |

   **Importante:** em `DATABASE_CONNECTION_URI`, use a URL **Internal** do Postgres (no painel do banco, aba **Info** ou **Connect**). Se o Render já vinculou o banco ao serviço, às vezes a variável aparece como `DATABASE_URL` — nesse caso use `DATABASE_CONNECTION_URI` com o mesmo valor.

5. Faça o **deploy**. A URL do Web Service (ex: `https://evolution-xxx.onrender.com`) é sua **EVOLUTION_API_URL**.

#### Se aparecer "Database provider invalid"

- Confirme que **DATABASE_PROVIDER** está exatamente `postgresql` (tudo minúsculo, sem espaço antes/depois).
- Confirme que **DATABASE_CONNECTION_URI** está preenchida com a Internal URL do Postgres.
- Se o banco foi criado depois do serviço, vincule o Postgres ao Web Service (ver abaixo).

#### Se aparecer "Can't reach database server at dpg-xxx:5432" / Migration failed

O Web Service não está conseguindo falar com o PostgreSQL. Faça o seguinte:

1. **Vincular o PostgreSQL ao Web Service (obrigatório)**
   - No Render, abra o **Web Service** da Evolution.
   - Vá em **Environment** (ou **Settings**).
   - Procure por **"Link Resource"**, **"Add Resource"** ou **"Database"**.
   - Vincule o **PostgreSQL** que você criou. Isso faz o Render liberar a rede entre o serviço e o banco e injetar a URL interna correta.

2. **Usar a URL interna**
   - Depois de vincular, o Render pode criar uma variável tipo `DATABASE_URL` ou `INTERNAL_DATABASE_URL`.
   - No painel do **PostgreSQL**, em **Info** ou **Connect**, copie a **Internal Database URL** (host deve ser algo como `dpg-xxxxx-a.oregon-postgres.render.com`).
   - Em **Environment** do Web Service, defina **DATABASE_CONNECTION_URI** com essa URL interna (não use a External URL).

3. **Mesma região**
   - PostgreSQL e Web Service precisam estar na **mesma região** (ex.: Oregon). Ao criar os dois, escolha a mesma.

4. **Banco “dormindo” (free tier)**
   - No plano free, o Postgres pode ficar inativo. Abra o painel do banco no Render (isso “acorda” o serviço), espere ~1 minuto e tente **Manual Deploy** de novo no Web Service.

5. **Desativar migrations no deploy (só se nada mais funcionar)**
   - Alguns blueprints rodam migrations no deploy; se o banco só fica acessível depois do container subir, o deploy pode falhar. Nesse caso, dá para tentar mudar o **Start Command** do Web Service para não rodar `db:deploy` no início (e rodar migrations à mão depois). Só use isso se o suporte do Render ou da Evolution indicar.

### Criar a instância e conectar o WhatsApp

No terminal (troque a URL e a chave pelos seus valores):

```bash
curl -X POST "https://evolution-xxx.onrender.com/instance/create" \
  -H "apikey: MinhaChaveSecreta123" \
  -H "Content-Type: application/json" \
  -d '{"instanceName": "hora-extra", "integration": "WHATSAPP-BAILEYS", "qrcode": true}'
```

A resposta vem em JSON com o QR code em **base64** (campo `qrcode.base64`). O terminal não mostra a imagem; é preciso exibir esse base64 como imagem para escanear.

#### Como exibir e escanear o QR code

**Opção A – Abrir em um arquivo HTML (recomendado)**

1. Na resposta do `curl`, copie **todo** o valor do campo `"base64"` (começa com `data:image/png;base64,` e termina na última letra antes de `"`).
2. Crie um arquivo `qrcode.html` com o conteúdo abaixo, colando o valor que você copiou no lugar de `COLE_O_BASE64_AQUI`:

```html
<!DOCTYPE html>
<html>
<body style="text-align:center; padding: 20px;">
  <h2>Escaneie com WhatsApp</h2>
  <img src="COLE_O_BASE64_AQUI" alt="QR Code" style="max-width: 300px;" />
  <p>WhatsApp → Configurações → Aparelhos conectados → Conectar um aparelho</p>
</body>
</html>
```

3. Salve, abra `qrcode.html` no navegador (duplo clique ou arrastar para o Chrome/Edge).
4. No celular: **WhatsApp → Configurações → Aparelhos conectados → Conectar um aparelho** e escaneie o QR que aparece na tela.

**Opção B – Novo QR se expirar**

O QR code expira em poucos segundos. Se não der tempo de escanear, peça um novo:

```bash
curl -X GET "https://evolution-xxx.onrender.com/instance/connect/hora-extra" \
  -H "apikey: MinhaChaveSecreta123"
```

(Substitua a URL e a apikey pelas suas.) A resposta traz um novo `qrcode.base64`; use a Opção A de novo para exibir e escanear.

**Dica:** Deixe o celular ao lado do PC, rode o `curl`, abra o HTML assim que gerar e escaneie logo.

### Configurar na Vercel (importante)

No **dashboard da Vercel** → seu projeto **hora_extra** → **Settings** → **Environment Variables**, adicione:

| Name                 | Value                                                    |
| -------------------- | -------------------------------------------------------- |
| `EVOLUTION_API_URL`  | `https://evolution-xxx.onrender.com` (sua URL do Render) |
| `EVOLUTION_INSTANCE` | `hora-extra`                                             |
| `EVOLUTION_API_KEY`  | `MinhaChaveSecreta123` (a mesma do Render)               |

Marque **Production** (e **Preview** se quiser). Depois, faça um novo deploy para as variáveis valerem.

---

## "Não foi possível conectar" ao escanear o QR no WhatsApp

Esse erro no celular costuma aparecer quando a Evolution API está no **Render (plano free)** ou em outro host que “dorme” após um tempo sem acesso.

### Por que acontece

1. **Serviço dormindo (Render free)**  
   O Web Service fica inativo. Quando você gera o QR e escaneia, o WhatsApp tenta falar com a Evolution para completar o pareamento. Se a Evolution ainda estiver acordando ou cair logo depois, a conexão falha e o app mostra “não foi possível conectar, tente novamente mais tarde”.

2. **QR expirado**  
   O QR vale por poucos segundos. Se demorar para escanear, o pareamento não completa.

3. **Bloqueio / limite do WhatsApp**  
   Muitas tentativas seguidas ou uso de API não oficial podem gerar bloqueio temporário do número.

### O que fazer

#### 1. Acordar o serviço antes de gerar o QR

1. Abra no navegador a URL da Evolution (ex.: `https://evolution-api-p67i.onrender.com`).
2. Espere **cerca de 1 minuto** (o Render free leva um tempo para acordar).
3. Rode o `curl` para pegar um **novo** QR code.
4. Exiba o QR no `docs/qrcode-viewer.html` e **escaneie na hora**.

Assim a Evolution já está “acordada” quando o WhatsApp tentar completar o pareamento.

#### 2. Conectar por **código de pareamento** em vez de QR

No celular você pode usar “Vincular com número de telefone” em vez de escanear o QR. A Evolution pode gerar um código de pareamento:

```bash
curl -X GET "https://evolution-api-p67i.onrender.com/instance/connect/hora-extra?number=5511999999999" \
  -H "apikey: SUA_API_KEY"
```

Troque `5511999999999` pelo número do WhatsApp que vai conectar (país + DDD + número, sem espaços). Na resposta pode vir o campo **`pairingCode`** (ex.: `ABCD-1234`). No celular: WhatsApp → Aparelhos conectados → Conectar um aparelho → **Vincular com número de telefone** → digite o código. Assim você não depende do QR e pode dar tempo do serviço estar estável.

(Se a sua versão da Evolution não retornar `pairingCode` nesse endpoint, use a opção 1.)

#### 3. Evitar muitas tentativas seguidas

Se der erro várias vezes, espere **15–30 minutos** e tente de novo. O WhatsApp pode limitar tentativas seguidas.

#### 4. Servidor que não dorme (se nada funcionar)

No Render free o serviço dorme; em horários de pouco uso isso atrapalha o pareamento. Alternativas:

- **Render pago** (plano que não dorme), ou  
- **VPS** (ex.: Hostinger, DigitalOcean, Contabo) com Evolution em Docker  

Com o serviço sempre ligado, o QR e o pareamento costumam funcionar de forma estável.

---

## Resumo do que você precisa fazer

1. **Subir** a Evolution na nuvem (ex.: Render), já que o app está na Vercel.
2. **Definir** a chave no servidor da Evolution (`AUTHENTICATION_API_KEY`).
3. **Criar** uma instância (nome, ex: `hora-extra`) e **conectar** o WhatsApp pelo QR code.
4. **Na Vercel**: em Settings → Environment Variables, preencher:
   - **EVOLUTION_API_URL** = URL pública da Evolution (ex: `https://evolution-xxx.onrender.com`).
   - **EVOLUTION_INSTANCE** = nome da instância (ex: `hora-extra`).
   - **EVOLUTION_API_KEY** = mesma chave do servidor da Evolution.
5. Fazer um **novo deploy** na Vercel para carregar as variáveis.
