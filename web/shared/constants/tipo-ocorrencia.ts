import {
    Banknote,
    Building2,
    BrushCleaning,
    CircleHelp,
    DoorOpen,
    Droplets,
    FileWarning,
    Gavel,
    Hammer,
    PaintRoller,
    ShieldAlert,
    Sofa,
    Volume2,
    type LucideIcon
} from 'lucide-react'

export const TIPO_OCORRENCIA_OPTIONS = [
    { value: 'ABANDONO_IMOVEL', label: 'Abandono do imóvel' },
    { value: 'ACAO_JUDICIAL', label: 'Ação Judicial' },
    { value: 'CONDOMINIO', label: 'Condomínio' },
    { value: 'DANOS_MOBILIA', label: 'Danos a mobília' },
    { value: 'DANOS_IMOVEL', label: 'Danos ao imóvel' },
    { value: 'DEBITO_ALUGUEL', label: 'Débito de aluguel' },
    { value: 'DESCUMPRIMENTO_CONTRATUAL', label: 'Descumprimento contratual' },
    { value: 'HIGIENE_LIMPEZA', label: 'Higiene e Limpeza' },
    { value: 'LUZ_AGUA_IPTU', label: 'Luz/Água/Iptu' },
    { value: 'MULTA_RESCISORIA_NAO_QUITADA', label: 'Multa rescisória não quitada' },
    { value: 'PERTURBACAO_SOSSEGO', label: 'Perturbação do sossego' },
    { value: 'PINTURA', label: 'Pintura' }
] as const

export type TipoOcorrencia = (typeof TIPO_OCORRENCIA_OPTIONS)[number]['value']

export const TIPO_OCORRENCIA_LABEL: Record<string, string> = Object.fromEntries(
    TIPO_OCORRENCIA_OPTIONS.map((option) => [option.value, option.label])
)

export const TIPO_OCORRENCIA_ICON: Record<string, LucideIcon> = {
    ABANDONO_IMOVEL: DoorOpen,
    ACAO_JUDICIAL: Gavel,
    CONDOMINIO: Building2,
    DANOS_MOBILIA: Sofa,
    DANOS_IMOVEL: ShieldAlert,
    DEBITO_ALUGUEL: Banknote,
    DESCUMPRIMENTO_CONTRATUAL: FileWarning,
    HIGIENE_LIMPEZA: BrushCleaning,
    LUZ_AGUA_IPTU: Droplets,
    MULTA_RESCISORIA_NAO_QUITADA: Hammer,
    PERTURBACAO_SOSSEGO: Volume2,
    PINTURA: PaintRoller
}

export const TIPO_OCORRENCIA_ICON_PADRAO: LucideIcon = CircleHelp
