-- AlterTable: tipo único -> lista de tipos, preservando os registros existentes
ALTER TABLE "ocorrencias" ADD COLUMN "tipos" "TipoOcorrencia"[] NOT NULL DEFAULT ARRAY[]::"TipoOcorrencia"[];

UPDATE "ocorrencias" SET "tipos" = ARRAY["tipo"];

ALTER TABLE "ocorrencias" ALTER COLUMN "tipos" DROP DEFAULT;

ALTER TABLE "ocorrencias" DROP COLUMN "tipo";
