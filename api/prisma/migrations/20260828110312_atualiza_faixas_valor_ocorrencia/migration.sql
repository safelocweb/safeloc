-- AlterEnum
-- Os valores antigos (ATE_5_MIL, DE_5_MIL_A_20_MIL, ACIMA_20_MIL) não têm
-- correspondência exata nos novos — mapeados para a faixa mais próxima em vez de
-- um cast direto, que quebraria em qualquer ocorrência já salva com valor antigo.
BEGIN;
CREATE TYPE "FaixaValorOcorrencia_new" AS ENUM ('ATE_1_MIL', 'DE_1_MIL_A_2_MIL', 'DE_2_MIL_A_5_MIL', 'ACIMA_10_MIL');
ALTER TABLE "ocorrencias" ALTER COLUMN "faixaValor" TYPE "FaixaValorOcorrencia_new" USING (
    CASE "faixaValor"::text
        WHEN 'ATE_5_MIL' THEN 'DE_2_MIL_A_5_MIL'
        WHEN 'DE_5_MIL_A_20_MIL' THEN 'ACIMA_10_MIL'
        WHEN 'ACIMA_20_MIL' THEN 'ACIMA_10_MIL'
        ELSE "faixaValor"::text
    END::"FaixaValorOcorrencia_new"
);
ALTER TYPE "FaixaValorOcorrencia" RENAME TO "FaixaValorOcorrencia_old";
ALTER TYPE "FaixaValorOcorrencia_new" RENAME TO "FaixaValorOcorrencia";
DROP TYPE "public"."FaixaValorOcorrencia_old";
COMMIT;
