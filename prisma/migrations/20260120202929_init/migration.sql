-- CreateTable
CREATE TABLE "PontoEntrega" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "horario" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Cardapio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "preco" REAL NOT NULL DEFAULT 20.00,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ItemCardapio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "cardapioId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ItemCardapio_cardapioId_fkey" FOREIGN KEY ("cardapioId") REFERENCES "Cardapio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pedido" (
    "numero" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nomeCliente" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "itens" TEXT NOT NULL,
    "observacoes" TEXT,
    "valorTotal" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "pontoEntregaId" TEXT NOT NULL,
    "whatsappEnviado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pedido_pontoEntregaId_fkey" FOREIGN KEY ("pontoEntregaId") REFERENCES "PontoEntrega" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Configuracao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "horarioAbertura" TEXT NOT NULL DEFAULT '08:00',
    "horarioFechamento" TEXT NOT NULL DEFAULT '11:00',
    "mensagemWhatsApp" TEXT NOT NULL DEFAULT '🍱 *Pedido Confirmado!*

Olá {nome}!

Seu pedido foi recebido com sucesso.',
    "telefoneNotificacao" TEXT NOT NULL DEFAULT '',
    "senhaAdmin" TEXT NOT NULL DEFAULT '1234',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
