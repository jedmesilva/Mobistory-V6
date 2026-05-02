export const VEHICLE = {
  name: "Honda Civic",
  version: "XLI 1.6",
  plate: "ABC-1234",
  year: 2021,
  color: "Prata",
  fuel: "Flex",
  verified: true,
  bond: { type: "Proprietário", since: "jan. 2023", status: "Ativo" },
};

export const RECORDS = [
  { id: "fuel", label: "Abastecimento", lastDate: "Hoje, 09:14", lastValue: "45L · R$ 312,30" },
  { id: "tire", label: "Pneus", lastDate: "Há 3 dias", lastValue: "32 PSI · 4 pneus" },
  { id: "bonds", label: "Vínculos", lastDate: "jan. 2023", lastValue: "Proprietário" },
];

export const MODULES = [
  { id: "fuel", label: "Abastecimento", desc: "Histórico de abastecimentos" },
  { id: "tire", label: "Pneus", desc: "Histórico de calibragens" },
  { id: "bonds", label: "Vínculos", desc: "Histórico de vínculos do veículo" },
];

export const REGISTER_MODULES = [
  { id: "fuel", label: "Abastecimento", desc: "Registrar novo abastecimento" },
  { id: "tire", label: "Pneus", desc: "Registrar calibragem dos pneus" },
  { id: "bonds", label: "Vínculo", desc: "Registrar novo vínculo com o veículo" },
];

export const BOND_TIMELINE = [
  { id: 1, label: "Vínculo verificado", desc: "Sua identidade e documentação foram confirmadas", date: "15 jan. 2023 · 14:32", type: "shield" },
  { id: 2, label: "Vínculo aprovado", desc: "O vínculo foi aprovado pelo sistema Mobistory", date: "12 jan. 2023 · 09:18", type: "check" },
  { id: 3, label: "Solicitação enviada", desc: "Você solicitou o vínculo como Proprietário", date: "10 jan. 2023 · 17:05", type: "clock" },
];

export const IDENTITY = {
  id:        "MBS-2021-00847",
  status:    "Ativa",
  emittedAt: "15 jan. 2023",
  emittedBy: "Mobistory",
  registro: [
    { label: "Placa",         value: "ABC-1234"          },
    { label: "RENAVAM",       value: "123.456.789-0"      },
    { label: "Chassi",        value: "9BWZZZ377VT004251"  },
    { label: "Ano fab./mod.", value: "2021 / 2021"        },
  ],
  caracteristicas: [
    { label: "Combustível", value: "Flex"       },
    { label: "Cor",         value: "Prata"      },
    { label: "Potência",    value: "126 cv"     },
    { label: "Cilindrada",  value: "1.598 cc"   },
    { label: "Carroceria",  value: "Sedã"       },
    { label: "Categoria",   value: "Particular" },
  ],
  documentacao: [
    { label: "CRLV 2024", status: "Regular", ok: true  },
    { label: "IPVA 2024", status: "Pago",    ok: true  },
    { label: "Multas",    status: "Nenhuma", ok: true  },
  ],
};

export const ALL_FUEL = [
  { id: 1, date: "01 mai. 2026", time: "09:14", volume: "45L", type: "Gasolina comum", value: "R$ 312,30", pricePerL: "R$ 6,94", km: "45.230 km", station: "Shell Centro" },
  { id: 2, date: "30 abr. 2026", time: "18:45", volume: "40L", type: "Etanol", value: "R$ 198,00", pricePerL: "R$ 4,95", km: "44.910 km", station: "Ipiranga Marginal" },
  { id: 3, date: "25 abr. 2026", time: "07:55", volume: "50L", type: "Gasolina aditivada", value: "R$ 368,50", pricePerL: "R$ 7,37", km: "44.610 km", station: "BR Mania" },
  { id: 4, date: "10 jan. 2023", time: "20:30", volume: "38L", type: "Etanol", value: "R$ 174,80", pricePerL: "R$ 4,60", km: "28.320 km", station: "Ale Combustíveis" },
  { id: 5, date: "02 jan. 2023", time: "11:20", volume: "42L", type: "Gasolina comum", value: "R$ 281,40", pricePerL: "R$ 6,70", km: "27.890 km", station: "Posto Petrobras" },
  { id: 6, date: "18 dez. 2022", time: "15:00", volume: "35L", type: "Etanol", value: "R$ 157,50", pricePerL: "R$ 4,50", km: "27.120 km", station: "Auto Posto Central" },
];

export const ALL_BONDS = [
  { id: 1, user: "Lucas Mendes", type: "Proprietário", since: "jan. 2023", until: null as string | null, active: true },
  { id: 2, user: "Carla Souza", type: "Condutor", since: "mar. 2023", until: null as string | null, active: true },
  { id: 3, user: "Felipe Ramos", type: "Gestor de frota", since: "jun. 2023", until: null as string | null, active: true },
  { id: 4, user: "Ana Lima", type: "Condutor", since: "fev. 2022", until: "dez. 2022", active: false },
  { id: 5, user: "Roberto Costa", type: "Condutor", since: "jan. 2021", until: "jan. 2022", active: false },
  { id: 6, user: "Marina Torres", type: "Gestor de frota", since: "ago. 2020", until: "dez. 2020", active: false },
];

export const MY_VEHICLES = [
  { id: 1, name: "Honda Civic", version: "XLI 1.6", plate: "ABC-1234", year: 2021, bond: "Proprietário", verified: true },
  { id: 2, name: "Toyota Corolla", version: "XEI 2.0", plate: "DEF-5678", year: 2019, bond: "Condutor", verified: true },
  { id: 3, name: "Fiat Pulse", version: "Impetus", plate: "GHI-9012", year: 2023, bond: "Gestor de frota", verified: false },
];

export const ACTIVITY_TYPES = [
  { id: "todos", label: "Todos" },
  { id: "abastecimento", label: "Abastecimento" },
  { id: "pneus", label: "Pneus" },
  { id: "vinculo", label: "Vínculos" },
  { id: "documento", label: "Documentos" },
];

export const ACTIVITIES = [
  { id: 1, type: "abastecimento", iconType: "fuel", title: "Abastecimento registrado", desc: "45L · Gasolina comum · R$ 312,30", time: "09:14", date: "01 mai. 2026", subcount: 0 },
  { id: 2, type: "pneus", iconType: "gauge", title: "Calibragem registrada", desc: "32 PSI · 4 pneus calibrados", time: "08:30", date: "01 mai. 2026", subcount: 0 },
  { id: 3, type: "abastecimento", iconType: "fuel", title: "Abastecimento registrado", desc: "40L · Etanol · R$ 198,00", time: "18:45", date: "30 abr. 2026", subcount: 0 },
  { id: 4, type: "vinculo", iconType: "user", title: "Vínculo aprovado", desc: "Felipe Ramos · Gestor de frota", time: "14:20", date: "30 abr. 2026", subcount: 3 },
  { id: 5, type: "documento", iconType: "file", title: "Documento adicionado", desc: "CRLV 2024 anexado ao veículo", time: "11:05", date: "28 abr. 2026", subcount: 0 },
  { id: 6, type: "abastecimento", iconType: "fuel", title: "Abastecimento registrado", desc: "50L · Gasolina aditivada · R$ 368,50", time: "07:55", date: "25 abr. 2026", subcount: 0 },
  { id: 7, type: "pneus", iconType: "gauge", title: "Calibragem registrada", desc: "34 PSI · 4 pneus calibrados", time: "16:10", date: "22 abr. 2026", subcount: 0 },
  { id: 8, type: "vinculo", iconType: "user", title: "Vínculo verificado", desc: "Lucas Mendes · Proprietário", time: "09:00", date: "15 jan. 2023", subcount: 3 },
  { id: 9, type: "abastecimento", iconType: "fuel", title: "Abastecimento registrado", desc: "38L · Etanol · R$ 174,80", time: "20:30", date: "10 jan. 2023", subcount: 0 },
];

export type ActivityItem = (typeof ACTIVITIES)[number];

export const EVENT_DETAILS: Record<number, {
  fields: { label: string; value: string }[];
  location: string | null;
  subevents: { id: number; title: string; desc: string; date: string; time: string; iconType: string }[];
}> = {
  1: {
    fields: [
      { label: "Volume", value: "45L" }, { label: "Tipo", value: "Gasolina comum" },
      { label: "Valor", value: "R$ 312,30" }, { label: "Preço/L", value: "R$ 6,94" },
      { label: "KM", value: "45.230 km" }, { label: "Posto", value: "Shell Centro" },
    ],
    location: "Shell Centro · Av. Paulista, 1000",
    subevents: [],
  },
  2: {
    fields: [
      { label: "Pressão", value: "32 PSI" }, { label: "Pneus", value: "4 calibrados" },
      { label: "KM", value: "45.180 km" }, { label: "Local", value: "Borracharia Rápida" },
    ],
    location: "Borracharia Rápida · Rua das Flores, 42",
    subevents: [],
  },
  3: {
    fields: [
      { label: "Volume", value: "40L" }, { label: "Tipo", value: "Etanol" },
      { label: "Valor", value: "R$ 198,00" }, { label: "Preço/L", value: "R$ 4,95" },
      { label: "KM", value: "44.910 km" }, { label: "Posto", value: "Ipiranga Marginal" },
    ],
    location: "Ipiranga Marginal · Marginal Tietê, 500",
    subevents: [],
  },
  4: {
    fields: [
      { label: "Tipo", value: "Gestor de frota" }, { label: "Usuário", value: "Felipe Ramos" },
      { label: "KM Inicial", value: "43.850 km" }, { label: "Status", value: "Ativo" },
    ],
    location: null,
    subevents: [
      { id: 1, iconType: "clock", title: "Solicitação enviada", desc: "Felipe Ramos solicitou o vínculo", date: "30 abr. 2026", time: "14:00" },
      { id: 2, iconType: "check", title: "Vínculo aprovado", desc: "Aprovado pelo sistema Mobistory", date: "30 abr. 2026", time: "14:15" },
      { id: 3, iconType: "shield", title: "Vínculo verificado", desc: "Identidade e documentos confirmados", date: "30 abr. 2026", time: "14:20" },
    ],
  },
  5: {
    fields: [
      { label: "Documento", value: "CRLV 2024" }, { label: "Validade", value: "31 dez. 2024" },
      { label: "Emitido por", value: "DETRAN-SP" }, { label: "Formato", value: "PDF · 1,2 MB" },
    ],
    location: null,
    subevents: [],
  },
  6: {
    fields: [
      { label: "Volume", value: "50L" }, { label: "Tipo", value: "Gasolina aditivada" },
      { label: "Valor", value: "R$ 368,50" }, { label: "Preço/L", value: "R$ 7,37" },
      { label: "KM", value: "44.610 km" }, { label: "Posto", value: "BR Mania" },
    ],
    location: "BR Mania · Av. Brasil, 230",
    subevents: [],
  },
  7: {
    fields: [
      { label: "Pressão", value: "34 PSI" }, { label: "Pneus", value: "4 calibrados" },
      { label: "KM", value: "44.200 km" }, { label: "Local", value: "Auto Center Sul" },
    ],
    location: "Auto Center Sul · Rua XV de Novembro, 88",
    subevents: [],
  },
  8: {
    fields: [
      { label: "Tipo", value: "Proprietário" }, { label: "Usuário", value: "Lucas Mendes" },
      { label: "KM Inicial", value: "28.450 km" }, { label: "Status", value: "Ativo" },
    ],
    location: null,
    subevents: [
      { id: 1, iconType: "clock", title: "Solicitação enviada", desc: "Lucas Mendes solicitou o vínculo", date: "10 jan. 2023", time: "08:45" },
      { id: 2, iconType: "check", title: "Vínculo aprovado", desc: "Aprovado pelo sistema Mobistory", date: "12 jan. 2023", time: "09:18" },
      { id: 3, iconType: "shield", title: "Vínculo verificado", desc: "Identidade e documentos confirmados", date: "15 jan. 2023", time: "14:32" },
    ],
  },
  9: {
    fields: [
      { label: "Volume", value: "38L" }, { label: "Tipo", value: "Etanol" },
      { label: "Valor", value: "R$ 174,80" }, { label: "Preço/L", value: "R$ 4,60" },
      { label: "KM", value: "28.320 km" }, { label: "Posto", value: "Ale Combustíveis" },
    ],
    location: "Ale Combustíveis · Rua Vergueiro, 900",
    subevents: [],
  },
};
