-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "tamanhoId" TEXT,
ADD COLUMN     "tamanhoNome" TEXT;

-- CreateTable
CREATE TABLE "Tamanho" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "cardapioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tamanho_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Tamanho" ADD CONSTRAINT "Tamanho_cardapioId_fkey" FOREIGN KEY ("cardapioId") REFERENCES "Cardapio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
