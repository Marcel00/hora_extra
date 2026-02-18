-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ItemCardapio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "maxSelecoes" INTEGER NOT NULL DEFAULT 99,
    "cardapioId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ItemCardapio_cardapioId_fkey" FOREIGN KEY ("cardapioId") REFERENCES "Cardapio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ItemCardapio" ("cardapioId", "categoria", "createdAt", "disponivel", "id", "nome", "updatedAt") SELECT "cardapioId", "categoria", "createdAt", "disponivel", "id", "nome", "updatedAt" FROM "ItemCardapio";
DROP TABLE "ItemCardapio";
ALTER TABLE "new_ItemCardapio" RENAME TO "ItemCardapio";
CREATE TABLE "new_Pedido" (
    "numero" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nomeCliente" TEXT NOT NULL,
    "telefone" TEXT,
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
INSERT INTO "new_Pedido" ("createdAt", "itens", "nomeCliente", "numero", "observacoes", "pontoEntregaId", "quantidade", "status", "telefone", "updatedAt", "valorTotal", "whatsappEnviado") SELECT "createdAt", "itens", "nomeCliente", "numero", "observacoes", "pontoEntregaId", "quantidade", "status", "telefone", "updatedAt", "valorTotal", "whatsappEnviado" FROM "Pedido";
DROP TABLE "Pedido";
ALTER TABLE "new_Pedido" RENAME TO "Pedido";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
