CREATE TYPE "GravidadeOcorrencia" AS ENUM ('BAIXA', 'MEDIA', 'ALTA');

ALTER TABLE "ocorrencias" ADD COLUMN     "gravidade" "GravidadeOcorrencia" NOT NULL DEFAULT 'MEDIA';
