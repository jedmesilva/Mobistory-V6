import { useState, useRef } from "react";
import {
  ArrowLeft, Car, MessageCircle, ChevronRight,
  Fuel, Plus, Home,
  BadgeCheck, X, Gauge, Calendar,
  Palette, User, Activity, Search, Camera, Sparkles,
  Share2, UserMinus, CheckCircle2, Clock, ShieldCheck, MoreVertical, Users,
  UserPlus, UserCheck, FileCheck, Menu, SlidersHorizontal, Check, MapPin, Copy,
} from "lucide-react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────

const colors = {
  background:    "#F7F8FA",
  surface:       "#FFFFFF",
  border:        "#F0F1F3",
  textPrimary:   "#111827",
  textSecondary: "#6B7280",
  textTertiary:  "#9CA3AF",
  textInverse:   "#FFFFFF",
  iconBg:        "#F3F4F6",
  iconColor:     "#6B7280",
  accent:        "#111827",
  accentMuted:   "#374151",
  separator:     "#D1D5DB",
};

const radii   = { sm: 10, md: 13, lg: 14, xl: 16, xxl: 18, pill: 99 };
const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 };
const font    = {
  size:   { xxs: 10, xs: 11, sm: 12, md: 13, base: 14, lg: 15, xl: 16, xxl: 17, xxxl: 22, hero: 28 },
  weight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
};
const iconSize = { xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 22, xxxl: 24, hero: 72 };

// ─── DATA ────────────────────────────────────────────────────────────────────

const VEHICLE = {
  name: "Honda Civic", version: "XLI 1.6", plate: "ABC-1234",
  year: 2021, color: "Prata", fuel: "Flex",
  verified: true,
  bond: { type: "Proprietário", since: "jan. 2023", status: "Ativo" },
};

const RECORDS = [
  { id: "fuel",  Icon: Fuel,  label: "Abastecimento", lastDate: "Hoje, 09:14", lastValue: "45L · R$ 312,30" },
  { id: "tire",  Icon: Gauge, label: "Pneus",         lastDate: "Há 3 dias",   lastValue: "32 PSI · 4 pneus" },
  { id: "bonds", Icon: User,  label: "Vínculos",      lastDate: "jan. 2023",   lastValue: "Proprietário" },
];

const MODULES = [
  { id: "fuel",  Icon: Fuel,  label: "Abastecimento", desc: "Histórico de abastecimentos" },
  { id: "tire",  Icon: Gauge, label: "Pneus",         desc: "Histórico de calibragens" },
  { id: "bonds", Icon: User,  label: "Vínculos",      desc: "Histórico de vínculos do veículo" },
];

const REGISTER_MODULES = [
  { id: "fuel",  Icon: Fuel,  label: "Abastecimento", desc: "Registrar novo abastecimento" },
  { id: "tire",  Icon: Gauge, label: "Pneus",         desc: "Registrar calibragem dos pneus" },
  { id: "bonds", Icon: User,  label: "Vínculo",       desc: "Registrar novo vínculo com o veículo" },
];

const BOND_TIMELINE = [
  { id: 1, Icon: ShieldCheck,  label: "Vínculo verificado",  desc: "Sua identidade e documentação foram confirmadas", date: "15 jan. 2023 · 14:32" },
  { id: 2, Icon: CheckCircle2, label: "Vínculo aprovado",    desc: "O vínculo foi aprovado pelo sistema Mobistory",   date: "12 jan. 2023 · 09:18" },
  { id: 3, Icon: Clock,        label: "Solicitação enviada", desc: "Você solicitou o vínculo como Proprietário",      date: "10 jan. 2023 · 17:05" },
];

const ALL_BONDS = [
  { id: 1, user: "Lucas Mendes",  type: "Proprietário",    since: "jan. 2023", until: null,        active: true  },
  { id: 2, user: "Carla Souza",   type: "Condutor",        since: "mar. 2023", until: null,        active: true  },
  { id: 3, user: "Felipe Ramos",  type: "Gestor de frota", since: "jun. 2023", until: null,        active: true  },
  { id: 4, user: "Ana Lima",      type: "Condutor",        since: "fev. 2022", until: "dez. 2022", active: false },
  { id: 5, user: "Roberto Costa", type: "Condutor",        since: "jan. 2021", until: "jan. 2022", active: false },
  { id: 6, user: "Marina Torres", type: "Gestor de frota", since: "ago. 2020", until: "dez. 2020", active: false },
];

const MY_VEHICLES = [
  { id: 1, name: "Honda Civic",    version: "XLI 1.6", plate: "ABC-1234", year: 2021, bond: "Proprietário",    verified: true  },
  { id: 2, name: "Toyota Corolla", version: "XEI 2.0", plate: "DEF-5678", year: 2019, bond: "Condutor",        verified: true  },
  { id: 3, name: "Fiat Pulse",     version: "Impetus",  plate: "GHI-9012", year: 2023, bond: "Gestor de frota", verified: false },
];

const ACTIVITY_TYPES = [
  { id: "todos",         label: "Todos"         },
  { id: "abastecimento", label: "Abastecimento" },
  { id: "pneus",         label: "Pneus"         },
  { id: "vinculo",       label: "Vínculos"      },
  { id: "documento",     label: "Documentos"    },
];

const ACTIVITIES = [
  { id: 1, type: "abastecimento", Icon: Fuel,      title: "Abastecimento registrado", desc: "45L · Gasolina comum · R$ 312,30",    time: "09:14", date: "01 mai. 2026", subcount: 0 },
  { id: 2, type: "pneus",         Icon: Gauge,     title: "Calibragem registrada",    desc: "32 PSI · 4 pneus calibrados",          time: "08:30", date: "01 mai. 2026", subcount: 0 },
  { id: 3, type: "abastecimento", Icon: Fuel,      title: "Abastecimento registrado", desc: "40L · Etanol · R$ 198,00",             time: "18:45", date: "30 abr. 2026", subcount: 0 },
  { id: 4, type: "vinculo",       Icon: User,      title: "Vínculo aprovado",         desc: "Felipe Ramos · Gestor de frota",       time: "14:20", date: "30 abr. 2026", subcount: 3 },
  { id: 5, type: "documento",     Icon: FileCheck, title: "Documento adicionado",     desc: "CRLV 2024 anexado ao veículo",         time: "11:05", date: "28 abr. 2026", subcount: 0 },
  { id: 6, type: "abastecimento", Icon: Fuel,      title: "Abastecimento registrado", desc: "50L · Gasolina aditivada · R$ 368,50", time: "07:55", date: "25 abr. 2026", subcount: 0 },
  { id: 7, type: "pneus",         Icon: Gauge,     title: "Calibragem registrada",    desc: "34 PSI · 4 pneus calibrados",          time: "16:10", date: "22 abr. 2026", subcount: 0 },
  { id: 8, type: "vinculo",       Icon: User,      title: "Vínculo verificado",       desc: "Lucas Mendes · Proprietário",          time: "09:00", date: "15 jan. 2023", subcount: 3 },
  { id: 9, type: "abastecimento", Icon: Fuel,      title: "Abastecimento registrado", desc: "38L · Etanol · R$ 174,80",             time: "20:30", date: "10 jan. 2023", subcount: 0 },
];

// ─── IDENTITY DATA ───────────────────────────────────────────────────────────

const IDENTITY = {
  id:         "MBS-2021-00847",
  status:     "Ativa",
  emittedAt:  "15 jan. 2023",
  emittedBy:  "Mobistory",
  registro: [
    { label: "Placa",        value: "ABC-1234"        },
    { label: "RENAVAM",      value: "123.456.789-0"   },
    { label: "Chassi",       value: "9BWZZZ377VT004251" },
    { label: "Ano fab./mod.", value: "2021 / 2021"    },
  ],
  caracteristicas: [
    { label: "Combustível",  value: "Flex"            },
    { label: "Cor",          value: "Prata"           },
    { label: "Potência",     value: "126 cv"          },
    { label: "Cilindrada",   value: "1.598 cc"        },
    { label: "Carroceria",   value: "Sedã"            },
    { label: "Categoria",    value: "Particular"      },
  ],
  documentacao: [
    { label: "CRLV 2024",   status: "Regular",  ok: true  },
    { label: "IPVA 2024",   status: "Pago",     ok: true  },
    { label: "Multas",      status: "Nenhuma",  ok: true  },
  ],
};

// ─── EVENT DETAILS ────────────────────────────────────────────────────────────

const EVENT_DETAILS = {
  1: {
    fields: [
      { label: "Volume",  value: "45L" },
      { label: "Tipo",    value: "Gasolina comum" },
      { label: "Valor",   value: "R$ 312,30" },
      { label: "Preço/L", value: "R$ 6,94" },
      { label: "KM",      value: "45.230 km" },
      { label: "Posto",   value: "Shell Centro" },
    ],
    location: "Shell Centro · Av. Paulista, 1000",
    subevents: [],
  },
  2: {
    fields: [
      { label: "Pressão",   value: "32 PSI" },
      { label: "Pneus",     value: "4 calibrados" },
      { label: "KM",        value: "45.180 km" },
      { label: "Local",     value: "Borracharia Rápida" },
    ],
    location: "Borracharia Rápida · Rua das Flores, 42",
    subevents: [],
  },
  3: {
    fields: [
      { label: "Volume",  value: "40L" },
      { label: "Tipo",    value: "Etanol" },
      { label: "Valor",   value: "R$ 198,00" },
      { label: "Preço/L", value: "R$ 4,95" },
      { label: "KM",      value: "44.910 km" },
      { label: "Posto",   value: "Ipiranga Marginal" },
    ],
    location: "Ipiranga Marginal · Marginal Tietê, 500",
    subevents: [],
  },
  4: {
    fields: [
      { label: "Tipo",       value: "Gestor de frota" },
      { label: "Usuário",    value: "Felipe Ramos" },
      { label: "KM Inicial", value: "43.850 km" },
      { label: "Status",     value: "Ativo" },
    ],
    location: null,
    subevents: [
      { id: 1, Icon: Clock,        title: "Solicitação enviada",  desc: "Felipe Ramos solicitou o vínculo",       date: "30 abr. 2026", time: "14:00" },
      { id: 2, Icon: CheckCircle2, title: "Vínculo aprovado",     desc: "Aprovado pelo sistema Mobistory",        date: "30 abr. 2026", time: "14:15" },
      { id: 3, Icon: ShieldCheck,  title: "Vínculo verificado",   desc: "Identidade e documentos confirmados",    date: "30 abr. 2026", time: "14:20" },
    ],
  },
  5: {
    fields: [
      { label: "Documento", value: "CRLV 2024" },
      { label: "Validade",  value: "31 dez. 2024" },
      { label: "Emitido por", value: "DETRAN-SP" },
      { label: "Formato",   value: "PDF · 1,2 MB" },
    ],
    location: null,
    subevents: [],
  },
  6: {
    fields: [
      { label: "Volume",  value: "50L" },
      { label: "Tipo",    value: "Gasolina aditivada" },
      { label: "Valor",   value: "R$ 368,50" },
      { label: "Preço/L", value: "R$ 7,37" },
      { label: "KM",      value: "44.610 km" },
      { label: "Posto",   value: "BR Mania" },
    ],
    location: "BR Mania · Av. Brasil, 230",
    subevents: [],
  },
  7: {
    fields: [
      { label: "Pressão",  value: "34 PSI" },
      { label: "Pneus",    value: "4 calibrados" },
      { label: "KM",       value: "44.200 km" },
      { label: "Local",    value: "Auto Center Sul" },
    ],
    location: "Auto Center Sul · Rua XV de Novembro, 88",
    subevents: [],
  },
  8: {
    fields: [
      { label: "Tipo",       value: "Proprietário" },
      { label: "Usuário",    value: "Lucas Mendes" },
      { label: "KM Inicial", value: "28.450 km" },
      { label: "Status",     value: "Ativo" },
    ],
    location: null,
    subevents: [
      { id: 1, Icon: Clock,        title: "Solicitação enviada",  desc: "Lucas Mendes solicitou o vínculo",       date: "10 jan. 2023", time: "08:45" },
      { id: 2, Icon: CheckCircle2, title: "Vínculo aprovado",     desc: "Aprovado pelo sistema Mobistory",        date: "12 jan. 2023", time: "09:18" },
      { id: 3, Icon: ShieldCheck,  title: "Vínculo verificado",   desc: "Identidade e documentos confirmados",    date: "15 jan. 2023", time: "14:32" },
    ],
  },
  9: {
    fields: [
      { label: "Volume",  value: "38L" },
      { label: "Tipo",    value: "Etanol" },
      { label: "Valor",   value: "R$ 174,80" },
      { label: "Preço/L", value: "R$ 4,60" },
      { label: "KM",      value: "28.320 km" },
      { label: "Posto",   value: "Ale Combustíveis" },
    ],
    location: "Ale Combustíveis · Rua Vergueiro, 900",
    subevents: [],
  },
};

// ─── SUBCOMPONENTS ───────────────────────────────────────────────────────────

function HandleBar() {
  return <div style={{ width: 40, height: 4, background: colors.separator, borderRadius: radii.pill, margin: "0 auto" }} />;
}

function IconBox({ Icon, size = iconSize.xl, boxSize = 44, radius = radii.md }) {
  return (
    <div style={{ width: boxSize, height: boxSize, borderRadius: radius, background: colors.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon size={size} color={colors.iconColor} strokeWidth={1.8} />
    </div>
  );
}

function ActionButton({ Icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: spacing.sm, background: colors.surface, border: "none", borderRadius: radii.xl, padding: `${spacing.lg}px ${spacing.sm}px`, cursor: "pointer", aspectRatio: "1" }}>
      <div style={{ width: 40, height: 40, borderRadius: radii.md, background: colors.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={iconSize.xl} color={colors.iconColor} strokeWidth={1.8} />
      </div>
      <span style={{ fontSize: font.size.xs, fontWeight: font.weight.semibold, color: colors.textSecondary }}>{label}</span>
    </button>
  );
}

function SectionLabel({ title, actionLabel, onAction }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md }}>
      <span style={{ fontSize: font.size.xs, fontWeight: font.weight.semibold, color: colors.textTertiary, letterSpacing: "0.08em", textTransform: "uppercase" }}>{title}</span>
      {actionLabel && (
        <button onClick={onAction} style={{ fontSize: font.size.sm, fontWeight: font.weight.medium, color: colors.accentMuted, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function Sheet({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", zIndex: 50, animation: "fadeIn .2s" }} />
      <div style={{ position: "fixed", left: "50%", bottom: 0, transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: colors.surface, borderRadius: `${radii.xxl}px ${radii.xxl}px 0 0`, zIndex: 51, animation: "slideUp .3s cubic-bezier(.4,0,.2,1)", maxHeight: "70vh", overflowY: "auto" }}>
        <div style={{ padding: `${spacing.md}px ${spacing.xl}px 0`, position: "sticky", top: 0, background: colors.surface, zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: spacing.lg, paddingBottom: spacing.md }}>
            <h2 style={{ fontSize: font.size.xxl, fontWeight: font.weight.bold, color: colors.textPrimary }}>{title}</h2>
            <button onClick={onClose} style={{ background: "none", border: "none", display: "flex", alignItems: "center", cursor: "pointer", padding: spacing.xs }}>
              <X size={iconSize.md} color={colors.textTertiary} strokeWidth={2} />
            </button>
          </div>
        </div>
        {children}
        <div style={{ height: spacing.xxxl }} />
      </div>
    </>
  );
}

// ─── BOND ITEM ────────────────────────────────────────────────────────────────

function BondItem({ b }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: spacing.md, background: colors.surface, borderRadius: radii.xl, padding: spacing.lg, marginBottom: spacing.sm }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", background: colors.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <User size={iconSize.lg} color={colors.iconColor} strokeWidth={1.8} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: font.size.base, fontWeight: font.weight.semibold, color: colors.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.user}</div>
        <div style={{ fontSize: font.size.sm, color: colors.textSecondary, marginTop: 1 }}>{b.type}</div>
        <div style={{ fontSize: font.size.xs, color: colors.textTertiary, marginTop: 2 }}>{b.since}{b.until ? ` – ${b.until}` : ""}</div>
      </div>
      {b.active
        ? <span style={{ flexShrink: 0, fontSize: font.size.xs, fontWeight: font.weight.semibold, color: "#16A34A", background: "#DCFCE7", borderRadius: radii.pill, padding: `3px ${spacing.sm}px` }}>Ativo</span>
        : <span style={{ flexShrink: 0, fontSize: font.size.xs, fontWeight: font.weight.semibold, color: colors.textTertiary, background: colors.iconBg, borderRadius: radii.pill, padding: `3px ${spacing.sm}px` }}>Encerrado</span>
      }
    </div>
  );
}

// ─── ALL BONDS SCREEN ─────────────────────────────────────────────────────────

function AllBondsScreen({ open, onClose }) {
  const [query,  setQuery]  = useState("");
  const [filter, setFilter] = useState("todos");
  const FILTERS = [
    { id: "todos",      label: "Todos" },
    { id: "ativos",     label: "Ativos" },
    { id: "encerrados", label: "Encerrados" },
    { id: "tipo",       label: "Por tipo" },
    { id: "usuario",    label: "Por usuário" },
    { id: "data",       label: "Por data" },
  ];
  const activeCount = ALL_BONDS.filter(b => b.active).length;
  const filtered = ALL_BONDS.filter(b => {
    const matchQuery = query === "" || b.user.toLowerCase().includes(query.toLowerCase()) || b.type.toLowerCase().includes(query.toLowerCase());
    const matchFilter = filter === "ativos" ? b.active : filter === "encerrados" ? !b.active : true;
    return matchQuery && matchFilter;
  });
  const sorted = filter === "data" ? [...filtered].sort((a, b) => (a.since < b.since ? 1 : -1)) : filter === "usuario" ? [...filtered].sort((a, b) => a.user.localeCompare(b.user)) : filtered;
  const groupedByType = sorted.reduce((acc, b) => { if (!acc[b.type]) acc[b.type] = []; acc[b.type].push(b); return acc; }, {});
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: colors.background, zIndex: 80, overflowY: "auto", animation: "fadeIn .2s" }}>
      <div style={{ padding: `${spacing.xxxl}px 0 ${spacing.xxxl}px` }}>
        <div style={{ padding: `0 ${spacing.xl}px` }}>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: spacing.xl, display: "flex" }}>
            <ArrowLeft size={iconSize.lg} color={colors.accentMuted} strokeWidth={2} />
          </button>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: spacing.xxl }}>
            <h2 style={{ fontSize: font.size.hero, fontWeight: font.weight.bold, color: colors.textPrimary, letterSpacing: "-0.02em" }}>Vínculos</h2>
            <span style={{ display: "inline-flex", alignItems: "center", gap: spacing.xs, background: "#DCFCE7", borderRadius: radii.pill, padding: `5px ${spacing.md}px`, marginBottom: 4 }}>
              <BadgeCheck size={iconSize.xs} color="#16A34A" strokeWidth={2.5} />
              <span style={{ fontSize: font.size.xs, fontWeight: font.weight.semibold, color: "#16A34A" }}>{activeCount} ativos</span>
            </span>
          </div>
          <div style={{ display: "flex", gap: spacing.sm, marginBottom: spacing.xxl }}>
            <ActionButton Icon={UserPlus}  label="Solicitar"   />
            <ActionButton Icon={UserCheck} label="Conceder"    />
            <ActionButton Icon={FileCheck} label="Reivindicar" />
          </div>
          <span style={{ fontSize: font.size.xs, fontWeight: font.weight.semibold, color: colors.textTertiary, letterSpacing: "0.08em", textTransform: "uppercase" }}>Histórico de vínculos</span>
          <div style={{ display: "flex", alignItems: "center", gap: spacing.md, background: colors.surface, borderRadius: radii.xl, padding: `14px ${spacing.lg}px`, marginTop: spacing.md }}>
            <Search size={iconSize.lg} color={colors.textTertiary} strokeWidth={2} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por nome ou tipo..." style={{ flex: 1, border: "none", background: "none", outline: "none", fontSize: font.size.base, color: colors.textPrimary, fontFamily: "'DM Sans', system-ui, sans-serif" }} />
            {query.length > 0 && <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}><X size={iconSize.sm} color={colors.textTertiary} strokeWidth={2.5} /></button>}
          </div>
        </div>
        <div style={{ display: "flex", gap: spacing.sm, overflowX: "auto", padding: `${spacing.md}px ${spacing.xl}px`, scrollbarWidth: "none" }}>
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{ flexShrink: 0, padding: `6px ${spacing.lg}px`, borderRadius: radii.pill, border: "none", cursor: "pointer", fontSize: font.size.sm, fontWeight: font.weight.semibold, background: filter === f.id ? colors.accent : colors.surface, color: filter === f.id ? colors.textInverse : colors.textSecondary }}>
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ padding: `0 ${spacing.xl}px` }}>
          {sorted.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: `${spacing.xxxl}px 0`, gap: spacing.sm }}>
              <Users size={iconSize.xxxl} color={colors.textTertiary} strokeWidth={1.5} />
              <span style={{ fontSize: font.size.base, color: colors.textTertiary, fontWeight: font.weight.medium }}>Nenhum vínculo encontrado</span>
            </div>
          ) : filter === "tipo" ? (
            Object.entries(groupedByType).map(([type, bonds]) => (
              <div key={type} style={{ marginBottom: spacing.xl }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.sm }}>
                  <span style={{ fontSize: font.size.xs, fontWeight: font.weight.semibold, color: colors.textTertiary, letterSpacing: "0.08em", textTransform: "uppercase" }}>{type}</span>
                  <span style={{ fontSize: font.size.xs, color: colors.textTertiary }}>{bonds.length} {bonds.length === 1 ? "vínculo" : "vínculos"}</span>
                </div>
                {bonds.map(b => <BondItem key={b.id} b={b} />)}
              </div>
            ))
          ) : sorted.map(b => <BondItem key={b.id} b={b} />)}
        </div>
      </div>
    </div>
  );
}

// ─── BOND SCREEN ──────────────────────────────────────────────────────────────

function BondScreen({ open, onClose, onOpenAllBonds }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const btnRef = useRef(null);
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: colors.background, zIndex: 60, overflowY: "auto", animation: "fadeIn .2s" }}>
      <div style={{ padding: `${spacing.xxxl}px ${spacing.xl}px ${spacing.xxxl}px` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.xl, position: "relative" }}>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
            <ArrowLeft size={iconSize.lg} color={colors.accentMuted} strokeWidth={2} />
          </button>
          <button ref={btnRef} onClick={() => setMenuOpen(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", padding: spacing.xs, display: "flex" }}>
            <MoreVertical size={iconSize.xxl} color={colors.accentMuted} strokeWidth={2} />
          </button>
          {menuOpen && (
            <>
              <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 70 }} />
              <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: colors.surface, borderRadius: radii.xl, boxShadow: "0 8px 24px rgba(0,0,0,0.10)", zIndex: 71, minWidth: 220, overflow: "hidden", animation: "fadeIn .15s" }}>
                <button onClick={() => { setMenuOpen(false); onOpenAllBonds(); }} style={{ display: "flex", alignItems: "center", gap: spacing.md, width: "100%", padding: `${spacing.md}px ${spacing.lg}px`, background: "none", border: "none", cursor: "pointer" }}>
                  <Users size={iconSize.lg} color={colors.accentMuted} strokeWidth={1.8} />
                  <span style={{ fontSize: font.size.base, fontWeight: font.weight.medium, color: colors.textPrimary }}>Todos os vínculos</span>
                </button>
              </div>
            </>
          )}
        </div>
        <h2 style={{ fontSize: font.size.hero, fontWeight: font.weight.bold, color: colors.textPrimary, letterSpacing: "-0.02em", marginBottom: spacing.xxl }}>Meu vínculo</h2>
        <div style={{ background: colors.surface, borderRadius: radii.xxl, padding: spacing.xl, marginBottom: spacing.md }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.lg }}>
            <div style={{ width: 48, height: 48, borderRadius: radii.md, background: colors.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={iconSize.xxl} color={colors.iconColor} strokeWidth={1.8} />
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: spacing.xs, background: "#DCFCE7", borderRadius: radii.pill, padding: `4px ${spacing.md}px` }}>
              <BadgeCheck size={iconSize.xs} color="#16A34A" strokeWidth={2.5} />
              <span style={{ fontSize: font.size.xs, fontWeight: font.weight.semibold, color: "#16A34A" }}>Ativo</span>
            </span>
          </div>
          <div style={{ fontSize: font.size.xxxl, fontWeight: font.weight.bold, color: colors.textPrimary }}>{VEHICLE.bond.type}</div>
          <div style={{ fontSize: font.size.sm, color: colors.textSecondary, marginTop: spacing.xs }}>{VEHICLE.name} · {VEHICLE.plate}</div>
          <div style={{ height: 1, background: colors.border, margin: `${spacing.lg}px 0` }} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: font.size.xs, color: colors.textTertiary, fontWeight: font.weight.medium, marginBottom: spacing.xs }}>Desde</div>
              <div style={{ fontSize: font.size.base, fontWeight: font.weight.semibold, color: colors.textPrimary }}>jan. 2023</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: font.size.xs, color: colors.textTertiary, fontWeight: font.weight.medium, marginBottom: spacing.xs }}>Verificado em</div>
              <div style={{ fontSize: font.size.base, fontWeight: font.weight.semibold, color: colors.textPrimary }}>15 jan. 2023</div>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.sm, marginBottom: spacing.xxl }}>
          <button style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: spacing.sm, background: colors.surface, border: "none", borderRadius: radii.xl, padding: `${spacing.md}px`, cursor: "pointer" }}>
            <Share2 size={iconSize.lg} color={colors.accentMuted} strokeWidth={2} />
            <span style={{ fontSize: font.size.sm, fontWeight: font.weight.semibold, color: colors.accentMuted }}>Exportar vínculo</span>
          </button>
          <button style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: spacing.sm, background: "#FEF2F2", border: "none", borderRadius: radii.xl, padding: `${spacing.md}px`, cursor: "pointer" }}>
            <UserMinus size={iconSize.lg} color="#DC2626" strokeWidth={2} />
            <span style={{ fontSize: font.size.sm, fontWeight: font.weight.semibold, color: "#DC2626" }}>Desvincular</span>
          </button>
        </div>
        <div style={{ fontSize: font.size.xs, fontWeight: font.weight.semibold, color: colors.textTertiary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: spacing.lg }}>Histórico do vínculo</div>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 19, top: 24, bottom: 24, width: 1, background: colors.border }} />
          {BOND_TIMELINE.map(({ id, Icon, label, desc, date }) => (
            <div key={id} style={{ display: "flex", gap: spacing.lg, marginBottom: spacing.xl, position: "relative" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: colors.surface, border: `1px solid ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1 }}>
                <Icon size={iconSize.md} color="#16A34A" strokeWidth={2} />
              </div>
              <div style={{ flex: 1, paddingTop: spacing.xs }}>
                <div style={{ fontSize: font.size.base, fontWeight: font.weight.semibold, color: colors.textPrimary }}>{label}</div>
                <div style={{ fontSize: font.size.sm, color: colors.textSecondary, marginTop: 2 }}>{desc}</div>
                <div style={{ fontSize: font.size.xs, color: colors.textTertiary, marginTop: spacing.xs }}>{date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── REGISTER SCREEN ──────────────────────────────────────────────────────────

function RegisterScreen({ open, onClose }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: colors.surface, zIndex: 60, overflowY: "auto", animation: "fadeIn .2s" }}>
      <div style={{ padding: `${spacing.xxxl}px ${spacing.xl}px ${spacing.xxxl}px` }}>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: spacing.xl, display: "flex" }}>
          <ArrowLeft size={iconSize.lg} color={colors.accentMuted} strokeWidth={2} />
        </button>
        <h2 style={{ fontSize: font.size.hero, fontWeight: font.weight.bold, color: colors.textPrimary, letterSpacing: "-0.02em", marginBottom: spacing.xxl }}>Registrar evento</h2>
        <div onClick={onClose} style={{ background: "#111827", borderRadius: radii.xxl, padding: spacing.xl, marginBottom: spacing.xxl, cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: spacing.sm, marginBottom: spacing.md }}>
            <div style={{ width: 40, height: 40, borderRadius: radii.md, background: "rgba(255,255,255,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Camera size={iconSize.xl} color="#FFFFFF" strokeWidth={1.8} />
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: spacing.xs, background: "rgba(255,255,255,0.12)", borderRadius: radii.pill, padding: `3px ${spacing.sm}px` }}>
              <Sparkles size={iconSize.xs} color="#E5E7EB" strokeWidth={2} />
              <span style={{ fontSize: font.size.xs, fontWeight: font.weight.semibold, color: "#E5E7EB", letterSpacing: "0.04em" }}>Assistido por IA</span>
            </span>
          </div>
          <div style={{ fontSize: font.size.xl, fontWeight: font.weight.bold, color: "#FFFFFF", marginBottom: spacing.xs }}>Captura inteligente</div>
          <div style={{ fontSize: font.size.sm, color: "#9CA3AF", lineHeight: 1.5 }}>Tire uma foto e a IA identifica o evento e preenche tudo por você</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: spacing.xs, marginTop: spacing.lg, border: "1px solid rgba(255,255,255,0.15)", borderRadius: radii.xl, padding: `${spacing.md}px ${spacing.lg}px` }}>
            <Camera size={iconSize.md} color="#FFFFFF" strokeWidth={2} />
            <span style={{ fontSize: font.size.sm, fontWeight: font.weight.semibold, color: "#FFFFFF" }}>Abrir câmera</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
          <div style={{ flex: 1, height: 1, background: colors.border }} />
          <span style={{ fontSize: font.size.xs, color: colors.textTertiary, fontWeight: font.weight.medium }}>ou registre manualmente</span>
          <div style={{ flex: 1, height: 1, background: colors.border }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {REGISTER_MODULES.map(({ id, Icon, label, desc }) => (
            <div key={id} className="erow" onClick={onClose}>
              <IconBox Icon={Icon} size={iconSize.xl} boxSize={44} radius={radii.md} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: font.size.xl, fontWeight: font.weight.semibold, color: colors.textPrimary }}>{label}</div>
                <div style={{ fontSize: font.size.sm, color: colors.textTertiary, marginTop: 2 }}>{desc}</div>
              </div>
              <ChevronRight size={iconSize.lg} color={colors.separator} strokeWidth={2} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ACTIONS SCREEN ───────────────────────────────────────────────────────────

function ActionsScreen({ open, onClose, onOpenAllBonds }) {
  const [query, setQuery] = useState("");
  if (!open) return null;
  const filtered = MODULES.filter(m => m.label.toLowerCase().includes(query.toLowerCase()) || m.desc.toLowerCase().includes(query.toLowerCase()));
  const handleClose = () => { setQuery(""); onClose(); };
  const handleSelect = (id) => { if (id === "bonds") { handleClose(); onOpenAllBonds(); } else { handleClose(); } };
  return (
    <div style={{ position: "fixed", inset: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: colors.surface, zIndex: 60, overflowY: "auto", animation: "fadeIn .2s" }}>
      <div style={{ padding: `${spacing.xxxl}px ${spacing.xl}px ${spacing.xxxl}px` }}>
        <button onClick={handleClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: spacing.xl, display: "flex" }}>
          <ArrowLeft size={iconSize.lg} color={colors.accentMuted} strokeWidth={2} />
        </button>
        <h2 style={{ fontSize: font.size.hero, fontWeight: font.weight.bold, color: colors.textPrimary, letterSpacing: "-0.02em", marginBottom: spacing.xxl }}>Registros</h2>
        <div style={{ display: "flex", alignItems: "center", gap: spacing.md, background: colors.background, borderRadius: radii.xl, padding: `18px ${spacing.lg}px`, marginBottom: spacing.xxl }}>
          <Search size={iconSize.lg} color={colors.textTertiary} strokeWidth={2} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar registros..." style={{ flex: 1, border: "none", background: "none", outline: "none", fontSize: font.size.base, color: colors.textPrimary, fontFamily: "'DM Sans', system-ui, sans-serif" }} />
          {query.length > 0 && <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}><X size={iconSize.sm} color={colors.textTertiary} strokeWidth={2.5} /></button>}
        </div>
        {filtered.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.md }}>
            {filtered.map(({ id, Icon, label, desc }) => (
              <div key={id} className="gaction" onClick={() => handleSelect(id)}>
                <div style={{ marginBottom: spacing.sm + 2 }}><IconBox Icon={Icon} size={iconSize.xxl} boxSize={42} radius={radii.md} /></div>
                <div style={{ fontSize: font.size.base, fontWeight: font.weight.semibold, color: colors.textPrimary }}>{label}</div>
                <div style={{ fontSize: font.size.xs, color: colors.textTertiary, marginTop: spacing.xs }}>{desc}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: `${spacing.xxxl}px 0`, gap: spacing.sm }}>
            <Search size={iconSize.xxxl} color={colors.textTertiary} strokeWidth={1.5} />
            <span style={{ fontSize: font.size.base, color: colors.textTertiary, fontWeight: font.weight.medium }}>Nenhum resultado para "{query}"</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── VEHICLES SCREEN ──────────────────────────────────────────────────────────

function VehicleCard({ v, onPress }) {
  return (
    <div onClick={onPress} style={{ display: "flex", alignItems: "center", gap: spacing.md, background: colors.surface, borderRadius: radii.xxl, padding: spacing.lg, marginBottom: spacing.sm, cursor: "pointer" }}>
      <div style={{ width: 72, height: 72, borderRadius: radii.xl, background: "linear-gradient(145deg, #EEF0F4, #E4E7ED)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Car size={iconSize.xxxl} color={colors.textTertiary} strokeWidth={1.4} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: spacing.xs, marginBottom: 3 }}>
          <span style={{ fontSize: font.size.base, fontWeight: font.weight.bold, color: colors.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.name}</span>
          {v.verified && <BadgeCheck size={iconSize.xs} color="#16A34A" strokeWidth={2.5} style={{ flexShrink: 0 }} />}
        </div>
        <div style={{ fontSize: font.size.sm, color: colors.textSecondary, marginBottom: 4 }}>Versão {v.version}</div>
        <div style={{ fontSize: font.size.xs, color: colors.textTertiary }}>{v.plate} · {v.year} · {v.bond}</div>
      </div>
      <ChevronRight size={iconSize.md} color={colors.textTertiary} strokeWidth={2} />
    </div>
  );
}

function VehiclesScreen({ open, onClose }) {
  const [query, setQuery] = useState("");
  if (!open) return null;
  const filtered = MY_VEHICLES.filter(v => v.name.toLowerCase().includes(query.toLowerCase()) || v.plate.toLowerCase().includes(query.toLowerCase()) || v.bond.toLowerCase().includes(query.toLowerCase()));
  const isEmpty = filtered.length === 0;
  return (
    <div style={{ position: "fixed", inset: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: colors.background, zIndex: 60, overflowY: "auto", animation: "fadeIn .2s" }}>
      <div style={{ padding: `${spacing.xxxl}px ${spacing.xl}px ${spacing.xxxl}px` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.xl }}>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
            <Menu size={iconSize.xxl} color={colors.accentMuted} strokeWidth={2} />
          </button>
          <button style={{ background: "none", border: "none", cursor: "pointer", padding: spacing.xs, display: "flex" }}>
            <Plus size={iconSize.xxl} color={colors.accentMuted} strokeWidth={2} />
          </button>
        </div>
        <h2 style={{ fontSize: font.size.hero, fontWeight: font.weight.bold, color: colors.textPrimary, letterSpacing: "-0.02em", marginBottom: spacing.xxl }}>Veículos</h2>
        <div style={{ display: "flex", alignItems: "center", gap: spacing.md, background: colors.surface, borderRadius: radii.xl, padding: `14px ${spacing.lg}px`, marginBottom: spacing.lg }}>
          <Search size={iconSize.lg} color={colors.textTertiary} strokeWidth={2} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar veículo..." style={{ flex: 1, border: "none", background: "none", outline: "none", fontSize: font.size.base, color: colors.textPrimary, fontFamily: "'DM Sans', system-ui, sans-serif" }} />
          {query.length > 0 && <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}><X size={iconSize.sm} color={colors.textTertiary} strokeWidth={2.5} /></button>}
        </div>
        {!isEmpty && filtered.map(v => <VehicleCard key={v.id} v={v} onPress={onClose} />)}
        {isEmpty && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: `${spacing.xxxl}px 0 ${spacing.xxl}px`, gap: spacing.sm }}>
            <Car size={iconSize.hero} color={colors.textTertiary} strokeWidth={1.2} />
            <span style={{ fontSize: font.size.base, fontWeight: font.weight.semibold, color: colors.textSecondary }}>
              {query ? `Nenhum veículo encontrado para "${query}"` : "Você ainda não tem veículos"}
            </span>
            <span style={{ fontSize: font.size.sm, color: colors.textTertiary, textAlign: "center", maxWidth: 240 }}>
              {query ? "Tente buscar por nome, placa ou tipo de vínculo" : "Adicione um veículo para começar a registrar eventos"}
            </span>
          </div>
        )}
        <button style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: spacing.sm, width: "100%", background: colors.accent, border: "none", borderRadius: radii.xxl, padding: `${spacing.lg}px`, marginTop: isEmpty ? 0 : spacing.xl, cursor: "pointer" }}>
          <Plus size={iconSize.lg} color={colors.textInverse} strokeWidth={2.5} />
          <span style={{ fontSize: font.size.base, fontWeight: font.weight.bold, color: colors.textInverse }}>Adicionar veículo</span>
        </button>
      </div>
    </div>
  );
}

// ─── EVENT SCREEN ─────────────────────────────────────────────────────────────

function EventScreen({ event, onClose }) {
  const [menuOpen, setMenuOpen] = useState(false);
  if (!event) return null;

  const details = EVENT_DETAILS[event.id] || { fields: [], location: null, subevents: [] };

  return (
    <div style={{ position: "fixed", inset: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: colors.background, zIndex: 90, overflowY: "auto", animation: "fadeIn .2s" }}>
      <div style={{ padding: `${spacing.xxxl}px ${spacing.xl}px ${spacing.xxxl}px` }}>

        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.xxl, position: "relative" }}>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", flexShrink: 0 }}>
            <ArrowLeft size={iconSize.lg} color={colors.accentMuted} strokeWidth={2} />
          </button>
          <h2 style={{ flex: 1, fontSize: font.size.xxl, fontWeight: font.weight.bold, color: colors.textPrimary, marginLeft: spacing.md, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {event.title}
          </h2>
          <button onClick={() => setMenuOpen(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", padding: spacing.xs, display: "flex", flexShrink: 0 }}>
            <MoreVertical size={iconSize.xxl} color={colors.accentMuted} strokeWidth={2} />
          </button>
          {menuOpen && (
            <>
              <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 70 }} />
              <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: colors.surface, borderRadius: radii.xl, boxShadow: "0 8px 24px rgba(0,0,0,0.10)", zIndex: 71, minWidth: 180, overflow: "hidden", animation: "fadeIn .15s" }}>
                {[
                  { label: "Editar evento",  color: colors.textPrimary },
                  { label: "Compartilhar",   color: colors.textPrimary },
                  { label: "Excluir evento", color: "#DC2626"          },
                ].map(({ label, color }) => (
                  <button key={label} onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", width: "100%", padding: `${spacing.md}px ${spacing.lg}px`, background: "none", border: "none", cursor: "pointer", fontSize: font.size.base, fontWeight: font.weight.medium, color }}>
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* HERO — ícone grande + data/hora */}
        <div style={{ background: colors.surface, borderRadius: radii.xxl, padding: spacing.xl, marginBottom: spacing.md, display: "flex", alignItems: "center", gap: spacing.lg }}>
          <div style={{ width: 56, height: 56, borderRadius: radii.xl, background: colors.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <event.Icon size={iconSize.xxl} color={colors.iconColor} strokeWidth={1.8} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: font.size.xs, fontWeight: font.weight.semibold, color: colors.textTertiary, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: spacing.xs }}>
              {event.type}
            </div>
            <div style={{ fontSize: font.size.base, fontWeight: font.weight.semibold, color: colors.textPrimary }}>
              {event.date}
            </div>
            <div style={{ fontSize: font.size.sm, color: colors.textSecondary, marginTop: 2 }}>
              {event.time}
            </div>
          </div>
          {event.subcount > 0 && (
            <span style={{ flexShrink: 0, fontSize: font.size.xs, fontWeight: font.weight.bold, color: colors.textTertiary, background: colors.iconBg, borderRadius: radii.pill, padding: `4px ${spacing.md}px` }}>
              +{event.subcount} eventos
            </span>
          )}
        </div>

        {/* DETAILS */}
        {details.fields.length > 0 && (
          <>
            <div style={{ fontSize: font.size.xs, fontWeight: font.weight.semibold, color: colors.textTertiary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: spacing.md, marginTop: spacing.xl }}>
              Detalhes
            </div>
            <div style={{ background: colors.surface, borderRadius: radii.xxl, overflow: "hidden", marginBottom: spacing.md }}>
              {details.fields.map(({ label, value }, i) => (
                <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${spacing.md}px ${spacing.xl}px`, borderBottom: i < details.fields.length - 1 ? `1px solid ${colors.border}` : "none" }}>
                  <span style={{ fontSize: font.size.sm, color: colors.textSecondary, fontWeight: font.weight.medium }}>{label}</span>
                  <span style={{ fontSize: font.size.sm, fontWeight: font.weight.semibold, color: colors.textPrimary }}>{value}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* LOCATION */}
        {details.location && (
          <>
            <div style={{ fontSize: font.size.xs, fontWeight: font.weight.semibold, color: colors.textTertiary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: spacing.md, marginTop: spacing.xl }}>
              Local
            </div>
            <div style={{ background: colors.surface, borderRadius: radii.xxl, padding: spacing.lg, display: "flex", alignItems: "center", gap: spacing.md, marginBottom: spacing.md }}>
              <div style={{ width: 40, height: 40, borderRadius: radii.md, background: colors.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <MapPin size={iconSize.lg} color={colors.iconColor} strokeWidth={1.8} />
              </div>
              <span style={{ fontSize: font.size.sm, fontWeight: font.weight.medium, color: colors.textPrimary, lineHeight: 1.4 }}>{details.location}</span>
            </div>
          </>
        )}

        {/* SUBEVENTS — timeline */}
        {details.subevents.length > 0 && (
          <>
            <div style={{ fontSize: font.size.xs, fontWeight: font.weight.semibold, color: colors.textTertiary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: spacing.lg, marginTop: spacing.xl }}>
              Histórico do evento
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 19, top: 20, bottom: 20, width: 1, background: colors.border }} />
              {details.subevents.map(({ id, Icon, title, desc, date, time }) => (
                <div key={id} style={{ display: "flex", gap: spacing.lg, marginBottom: spacing.xl, position: "relative" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: colors.surface, border: `1px solid ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1 }}>
                    <Icon size={iconSize.md} color="#16A34A" strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1, paddingTop: spacing.xs }}>
                    <div style={{ fontSize: font.size.base, fontWeight: font.weight.semibold, color: colors.textPrimary }}>{title}</div>
                    <div style={{ fontSize: font.size.sm, color: colors.textSecondary, marginTop: 2 }}>{desc}</div>
                    <div style={{ fontSize: font.size.xs, color: colors.textTertiary, marginTop: spacing.xs }}>{date} · {time}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ACTIONS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.sm, marginTop: spacing.xl }}>
          <button style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: spacing.sm, background: colors.surface, border: "none", borderRadius: radii.xl, padding: `${spacing.md}px`, cursor: "pointer" }}>
            <Share2 size={iconSize.lg} color={colors.accentMuted} strokeWidth={2} />
            <span style={{ fontSize: font.size.sm, fontWeight: font.weight.semibold, color: colors.accentMuted }}>Compartilhar</span>
          </button>
          <button style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: spacing.sm, background: "#FEF2F2", border: "none", borderRadius: radii.xl, padding: `${spacing.md}px`, cursor: "pointer" }}>
            <X size={iconSize.lg} color="#DC2626" strokeWidth={2} />
            <span style={{ fontSize: font.size.sm, fontWeight: font.weight.semibold, color: "#DC2626" }}>Excluir</span>
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── IDENTITY SHARE SHEET ────────────────────────────────────────────────────

function IdentityShareSheet({ open, onClose }) {
  const [copied, setCopied] = useState(false);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&color=111827&bgcolor=F7F8FA&data=${IDENTITY.id}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(IDENTITY.id).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 100, animation: "fadeIn .2s" }} />
      <div style={{ position: "fixed", left: "50%", bottom: 0, transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: colors.surface, borderRadius: `${radii.xxl}px ${radii.xxl}px 0 0`, zIndex: 101, animation: "slideUp .3s cubic-bezier(.4,0,.2,1)", paddingBottom: spacing.xxxl }}>

        {/* handle + título */}
        <div style={{ padding: `${spacing.lg}px ${spacing.xl}px ${spacing.md}px` }}>
          <HandleBar />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: spacing.lg }}>
            <h2 style={{ fontSize: font.size.xxl, fontWeight: font.weight.bold, color: colors.textPrimary }}>Identidade do veículo</h2>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: spacing.xs, display: "flex" }}>
              <X size={iconSize.md} color={colors.textTertiary} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* QR code */}
        <div style={{ display: "flex", justifyContent: "center", padding: `${spacing.md}px ${spacing.xl}px` }}>
          <div style={{ background: colors.background, borderRadius: radii.xxl, padding: spacing.xl, display: "inline-flex" }}>
            <img src={qrUrl} alt="QR Code" width={180} height={180} style={{ display: "block", borderRadius: radii.md }} />
          </div>
        </div>

        {/* número + copiar */}
        <div style={{ margin: `${spacing.md}px ${spacing.xl}px 0`, background: colors.background, borderRadius: radii.xl, padding: `${spacing.md}px ${spacing.lg}px`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: font.size.xs, color: colors.textTertiary, fontWeight: font.weight.medium, marginBottom: spacing.xs }}>Nº de identidade</div>
            <div style={{ fontSize: font.size.xl, fontWeight: font.weight.bold, color: colors.textPrimary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em" }}>{IDENTITY.id}</div>
          </div>
          <button onClick={handleCopy} style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: spacing.xs, background: copied ? "#DCFCE7" : colors.surface, border: "none", borderRadius: radii.lg, padding: `${spacing.sm}px ${spacing.md}px`, cursor: "pointer", transition: "background .2s" }}>
            {copied
              ? <><CheckCircle2 size={iconSize.md} color="#16A34A" strokeWidth={2} /><span style={{ fontSize: font.size.sm, fontWeight: font.weight.semibold, color: "#16A34A" }}>Copiado</span></>
              : <><Copy size={iconSize.md} color={colors.accentMuted} strokeWidth={2} /><span style={{ fontSize: font.size.sm, fontWeight: font.weight.semibold, color: colors.accentMuted }}>Copiar</span></>
            }
          </button>
        </div>

        {/* contexto */}
        <div style={{ margin: `${spacing.sm}px ${spacing.xl}px 0`, padding: `0 ${spacing.xs}px` }}>
          <span style={{ fontSize: font.size.xs, color: colors.textTertiary }}>{VEHICLE.name} · {VEHICLE.plate} · Emitida em {IDENTITY.emittedAt}</span>
        </div>

        {/* compartilhar link */}
        <div style={{ margin: `${spacing.xl}px ${spacing.xl}px 0` }}>
          <button style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: spacing.sm, background: colors.accent, border: "none", borderRadius: radii.xxl, padding: `${spacing.lg}px`, cursor: "pointer" }}>
            <Share2 size={iconSize.lg} color={colors.textInverse} strokeWidth={2} />
            <span style={{ fontSize: font.size.base, fontWeight: font.weight.bold, color: colors.textInverse }}>Compartilhar link</span>
          </button>
        </div>

      </div>
    </>
  );
}

// ─── IDENTITY SCREEN ─────────────────────────────────────────────────────────

function IdentityScreen({ open, onClose, onOpenBond, onOpenAllBonds }) {
  const [shareOpen, setShareOpen] = useState(false);
  const [copiedId,  setCopiedId]  = useState(false);
  const handleCopyId = () => {
    navigator.clipboard?.writeText(IDENTITY.id).catch(() => {});
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: colors.background, zIndex: 60, overflowY: "auto", animation: "fadeIn .2s" }}>
      <div style={{ padding: `${spacing.xxxl}px ${spacing.xl}px ${spacing.xxxl}px` }}>

        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.xl }}>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
            <ArrowLeft size={iconSize.lg} color={colors.accentMuted} strokeWidth={2} />
          </button>
          <button onClick={() => setShareOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: spacing.xs, display: "flex" }}>
            <Share2 size={iconSize.xxl} color={colors.accentMuted} strokeWidth={2} />
          </button>
        </div>

        {/* HERO */}
        <div style={{ background: colors.surface, borderRadius: radii.xxl, padding: spacing.xl, marginBottom: spacing.md }}>
          {/* ícone + status */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: spacing.lg }}>
            <div style={{ width: 56, height: 56, borderRadius: radii.xl, background: "linear-gradient(145deg, #EEF0F4, #E4E7ED)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Car size={iconSize.xxl} color={colors.textTertiary} strokeWidth={1.4} />
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: spacing.xs, background: "#DCFCE7", borderRadius: radii.pill, padding: `4px ${spacing.md}px` }}>
              <BadgeCheck size={iconSize.xs} color="#16A34A" strokeWidth={2.5} />
              <span style={{ fontSize: font.size.xs, fontWeight: font.weight.semibold, color: "#16A34A" }}>{IDENTITY.status}</span>
            </span>
          </div>

          {/* nome + badge */}
          <div style={{ display: "flex", alignItems: "center", gap: spacing.xs, flexWrap: "wrap", marginBottom: 3 }}>
            <span style={{ fontSize: font.size.xxxl, fontWeight: font.weight.bold, color: colors.textPrimary, letterSpacing: "-0.02em" }}>{VEHICLE.name}</span>
            {VEHICLE.verified && <BadgeCheck size={iconSize.sm} color="#16A34A" strokeWidth={2.5} />}
          </div>
          <div style={{ fontSize: font.size.base, color: colors.textSecondary, marginBottom: spacing.xl }}>
            Versão {VEHICLE.version}
          </div>

          {/* número de identidade — destaque */}
          <div style={{ background: colors.background, borderRadius: radii.xl, padding: `${spacing.md}px ${spacing.lg}px`, marginBottom: spacing.lg, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: font.size.xs, color: colors.textTertiary, fontWeight: font.weight.medium, marginBottom: spacing.xs }}>Nº de identidade</div>
              <div style={{ fontSize: font.size.xl, fontWeight: font.weight.bold, color: colors.textPrimary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em" }}>{IDENTITY.id}</div>
            </div>
            <button onClick={handleCopyId} style={{ flexShrink: 0, background: copiedId ? "#DCFCE7" : colors.surface, border: "none", borderRadius: radii.md, padding: spacing.sm, cursor: "pointer", display: "flex", alignItems: "center", transition: "background .2s" }}>
              {copiedId
                ? <CheckCircle2 size={iconSize.lg} color="#16A34A" strokeWidth={2} />
                : <Copy size={iconSize.lg} color={colors.iconColor} strokeWidth={1.8} />
              }
            </button>
          </div>

          {/* divider */}
          <div style={{ height: 1, background: colors.border, marginBottom: spacing.lg }} />

          {/* emissão */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: font.size.xs, color: colors.textTertiary, fontWeight: font.weight.medium, marginBottom: spacing.xs }}>Emitida em</div>
              <div style={{ fontSize: font.size.sm, fontWeight: font.weight.semibold, color: colors.textPrimary }}>{IDENTITY.emittedAt}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: font.size.xs, color: colors.textTertiary, fontWeight: font.weight.medium, marginBottom: spacing.xs }}>Emitida por</div>
              <div style={{ fontSize: font.size.sm, fontWeight: font.weight.semibold, color: colors.textPrimary }}>{IDENTITY.emittedBy}</div>
            </div>
          </div>
        </div>

        {/* REGISTRO OFICIAL */}
        <div style={{ fontSize: font.size.xs, fontWeight: font.weight.semibold, color: colors.textTertiary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: spacing.md, marginTop: spacing.xl }}>
          Registro oficial
        </div>
        <div style={{ background: colors.surface, borderRadius: radii.xxl, overflow: "hidden", marginBottom: spacing.md }}>
          {IDENTITY.registro.map(({ label, value }, i) => (
            <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${spacing.md}px ${spacing.xl}px`, borderBottom: i < IDENTITY.registro.length - 1 ? `1px solid ${colors.border}` : "none" }}>
              <span style={{ fontSize: font.size.sm, color: colors.textSecondary, fontWeight: font.weight.medium }}>{label}</span>
              <span style={{ fontSize: font.size.sm, fontWeight: font.weight.semibold, color: colors.textPrimary, fontFamily: label === "Chassi" || label === "RENAVAM" ? "'DM Mono', monospace" : "inherit" }}>{value}</span>
            </div>
          ))}
        </div>

        {/* CARACTERÍSTICAS */}
        <div style={{ fontSize: font.size.xs, fontWeight: font.weight.semibold, color: colors.textTertiary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: spacing.md, marginTop: spacing.xl }}>
          Características
        </div>
        <div style={{ background: colors.surface, borderRadius: radii.xxl, overflow: "hidden", marginBottom: spacing.md }}>
          {IDENTITY.caracteristicas.map(({ label, value }, i) => (
            <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${spacing.md}px ${spacing.xl}px`, borderBottom: i < IDENTITY.caracteristicas.length - 1 ? `1px solid ${colors.border}` : "none" }}>
              <span style={{ fontSize: font.size.sm, color: colors.textSecondary, fontWeight: font.weight.medium }}>{label}</span>
              <span style={{ fontSize: font.size.sm, fontWeight: font.weight.semibold, color: colors.textPrimary }}>{value}</span>
            </div>
          ))}
        </div>

        {/* DOCUMENTAÇÃO */}
        <div style={{ fontSize: font.size.xs, fontWeight: font.weight.semibold, color: colors.textTertiary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: spacing.md, marginTop: spacing.xl }}>
          Documentação
        </div>
        <div style={{ background: colors.surface, borderRadius: radii.xxl, overflow: "hidden", marginBottom: spacing.md }}>
          {IDENTITY.documentacao.map(({ label, status, ok }, i) => (
            <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${spacing.md}px ${spacing.xl}px`, borderBottom: i < IDENTITY.documentacao.length - 1 ? `1px solid ${colors.border}` : "none", cursor: "pointer" }}>
              <span style={{ fontSize: font.size.sm, color: colors.textSecondary, fontWeight: font.weight.medium }}>{label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
                <span style={{ fontSize: font.size.xs, fontWeight: font.weight.semibold, color: ok ? "#16A34A" : "#DC2626", background: ok ? "#DCFCE7" : "#FEF2F2", borderRadius: radii.pill, padding: `2px ${spacing.sm}px` }}>{status}</span>
                <ChevronRight size={iconSize.sm} color={colors.textTertiary} strokeWidth={2} />
              </div>
            </div>
          ))}
        </div>

        {/* VÍNCULOS */}
        <div style={{ fontSize: font.size.xs, fontWeight: font.weight.semibold, color: colors.textTertiary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: spacing.md, marginTop: spacing.xl }}>
          Vínculos
        </div>

        {/* card do vínculo do usuário */}
        <div onClick={onOpenBond} style={{ background: colors.surface, borderRadius: radii.xl, padding: spacing.lg, marginBottom: spacing.sm, display: "flex", alignItems: "center", gap: spacing.md, cursor: "pointer" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: colors.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <User size={iconSize.lg} color={colors.iconColor} strokeWidth={1.8} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: font.size.sm, color: colors.textTertiary, marginBottom: 2 }}>Seu vínculo</div>
            <div style={{ fontSize: font.size.base, fontWeight: font.weight.semibold, color: colors.textPrimary }}>{VEHICLE.bond.type}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
            <span style={{ fontSize: font.size.xs, fontWeight: font.weight.semibold, color: "#16A34A", background: "#DCFCE7", borderRadius: radii.pill, padding: `3px ${spacing.sm}px` }}>Ativo</span>
            <ChevronRight size={iconSize.md} color={colors.textTertiary} strokeWidth={2} />
          </div>
        </div>

        {/* contagem total */}
        <div onClick={onOpenAllBonds} style={{ background: colors.surface, borderRadius: radii.xl, padding: spacing.lg, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: spacing.md }}>
            <div style={{ width: 40, height: 40, borderRadius: radii.md, background: colors.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={iconSize.lg} color={colors.iconColor} strokeWidth={1.8} />
            </div>
            <div>
              <div style={{ fontSize: font.size.base, fontWeight: font.weight.semibold, color: colors.textPrimary }}>Vínculos ativos</div>
              <div style={{ fontSize: font.size.sm, color: colors.textSecondary, marginTop: 2 }}>{ALL_BONDS.filter(b => b.active).length} pessoas vinculadas</div>
            </div>
          </div>
          <ChevronRight size={iconSize.md} color={colors.textTertiary} strokeWidth={2} />
        </div>

      </div>

      <IdentityShareSheet open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
}

// ─── ACTIVITIES SCREEN ───────────────────────────────────────────────────────

function ActivitiesScreen({ open, onClose }) {
  const [scrollY,       setScrollY]       = useState(0);
  const [filterSheet,   setFilterSheet]   = useState(false);
  const [activeType,    setActiveType]    = useState("todos");
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [query,         setQuery]         = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const scrollRef = useRef(null);

  const activeFilters = activeType !== "todos" ? 1 : 0;
  const filtered = ACTIVITIES.filter(a => {
    const matchType  = activeType === "todos" || a.type === activeType;
    const matchQuery = query === "" || a.title.toLowerCase().includes(query.toLowerCase()) || a.desc.toLowerCase().includes(query.toLowerCase());
    return matchType && matchQuery;
  });

  const THRESHOLD = 80;
  const p = Math.min(1, scrollY / THRESHOLD);
  const lerp = (a, b, t) => a + (b - a) * t;
  const largeTitleOpacity = 1 - p;
  const largeTitleHeight  = lerp(44, 0, p);
  const smallTitleOpacity = p;

  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: colors.background, zIndex: 60, display: "flex", flexDirection: "column", animation: "fadeIn .2s" }}>

      {/* STICKY HEADER */}
      <div style={{ flexShrink: 0, background: colors.background, padding: `${spacing.xxxl}px ${spacing.xl}px 0` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.sm }}>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: spacing.sm }}>
            <ArrowLeft size={iconSize.lg} color={colors.accentMuted} strokeWidth={2} />
            <span style={{ fontSize: font.size.base, fontWeight: font.weight.semibold, color: colors.textPrimary, opacity: smallTitleOpacity, transition: "opacity .1s" }}>
              Atividades
            </span>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: spacing.sm, opacity: smallTitleOpacity, pointerEvents: p > 0.5 ? "auto" : "none", transition: "opacity .1s" }}>
            <button onClick={() => setSearchOpen(true)} style={{ width: 44, height: 44, background: colors.surface, border: "none", borderRadius: radii.xl, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Search size={iconSize.lg} color={colors.iconColor} strokeWidth={2} />
            </button>
            <button onClick={() => setFilterSheet(true)} style={{ position: "relative", width: 44, height: 44, background: colors.surface, border: "none", borderRadius: radii.xl, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <SlidersHorizontal size={iconSize.lg} color={activeFilters > 0 ? colors.accent : colors.iconColor} strokeWidth={2} />
              {activeFilters > 0 && <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, background: colors.accent, borderRadius: "50%", border: `2px solid ${colors.background}` }} />}
            </button>
          </div>
        </div>
        <div style={{ overflow: "hidden", height: largeTitleHeight, opacity: largeTitleOpacity }}>
          <h2 style={{ fontSize: font.size.hero, fontWeight: font.weight.bold, color: colors.textPrimary, letterSpacing: "-0.02em", lineHeight: `${largeTitleHeight}px` }}>
            Atividades
          </h2>
        </div>
        <div style={{ overflow: "hidden", height: lerp(60, 0, p), opacity: largeTitleOpacity, pointerEvents: p >= 1 ? "none" : "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: spacing.sm, marginTop: spacing.md, marginBottom: spacing.md }}>
            <div onClick={() => setSearchOpen(true)} style={{ flex: 1, display: "flex", alignItems: "center", gap: spacing.sm, background: colors.surface, borderRadius: radii.xl, padding: `12px ${spacing.lg}px`, cursor: "pointer" }}>
              <Search size={iconSize.lg} color={colors.textTertiary} strokeWidth={2} />
              <span style={{ fontSize: font.size.base, color: colors.textTertiary }}>{query ? query : "Buscar atividades..."}</span>
            </div>
            <button onClick={() => setFilterSheet(true)} style={{ position: "relative", flexShrink: 0, width: 44, height: 44, background: colors.surface, border: "none", borderRadius: radii.xl, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <SlidersHorizontal size={iconSize.lg} color={activeFilters > 0 ? colors.accent : colors.iconColor} strokeWidth={2} />
              {activeFilters > 0 && <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, background: colors.accent, borderRadius: "50%", border: `2px solid ${colors.background}` }} />}
            </button>
          </div>
        </div>
      </div>

      {/* FEED */}
      <div ref={scrollRef} onScroll={e => setScrollY(e.target.scrollTop)} style={{ flex: 1, overflowY: "auto", padding: `0 ${spacing.xl}px ${spacing.xxxl}px` }}>
        {filtered.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: `${spacing.xxxl}px 0`, gap: spacing.sm }}>
            <Activity size={iconSize.hero} color={colors.textTertiary} strokeWidth={1.2} />
            <span style={{ fontSize: font.size.base, fontWeight: font.weight.semibold, color: colors.textSecondary }}>Nenhuma atividade encontrada</span>
          </div>
        ) : filtered.map(a => (
          <div key={a.id} onClick={() => setSelectedEvent(a)} style={{ display: "flex", alignItems: "flex-start", gap: spacing.md, padding: `${spacing.md}px 0`, borderBottom: `1px solid ${colors.border}`, cursor: "pointer" }}>
            <div style={{ width: 36, height: 36, borderRadius: radii.md, background: colors.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
              <a.Icon size={16} color={colors.iconColor} strokeWidth={1.8} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing.sm }}>
                <span style={{ fontSize: font.size.base, fontWeight: font.weight.semibold, color: colors.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</span>
                {a.subcount > 0 && (
                  <span style={{ flexShrink: 0, fontSize: font.size.xxs, fontWeight: font.weight.bold, color: colors.textTertiary, background: colors.iconBg, borderRadius: radii.pill, padding: `2px 6px` }}>+{a.subcount}</span>
                )}
              </div>
              <div style={{ fontSize: font.size.sm, color: colors.textSecondary, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.desc}</div>
              <div style={{ marginTop: spacing.sm }}>
                <span style={{ fontSize: font.size.xs, color: colors.textTertiary }}>{a.date} · {a.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SEARCH FULLSCREEN */}
      {searchOpen && (
        <div style={{ position: "absolute", inset: 0, background: colors.background, zIndex: 10, animation: "fadeIn .2s" }}>
          <div style={{ padding: `${spacing.xxxl}px ${spacing.xl}px ${spacing.md}px` }}>
            <div style={{ display: "flex", alignItems: "center", gap: spacing.md, background: colors.surface, borderRadius: radii.xl, padding: `14px ${spacing.lg}px` }}>
              <Search size={iconSize.lg} color={colors.textTertiary} strokeWidth={2} />
              <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar atividades..." style={{ flex: 1, border: "none", background: "none", outline: "none", fontSize: font.size.base, color: colors.textPrimary, fontFamily: "'DM Sans', system-ui, sans-serif" }} />
              <button onClick={() => { setQuery(""); setSearchOpen(false); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: font.size.sm, fontWeight: font.weight.semibold, color: colors.accentMuted }}>Cancelar</button>
            </div>
          </div>
          {query.length > 0 ? (
            <div style={{ padding: `0 ${spacing.xl}px` }}>
              {ACTIVITIES.filter(a => a.title.toLowerCase().includes(query.toLowerCase()) || a.desc.toLowerCase().includes(query.toLowerCase())).map(a => (
                <div key={a.id} onClick={() => { setSelectedEvent(a); setSearchOpen(false); }} style={{ display: "flex", alignItems: "flex-start", gap: spacing.md, padding: `${spacing.md}px 0`, borderBottom: `1px solid ${colors.border}`, cursor: "pointer" }}>
                  <div style={{ width: 36, height: 36, borderRadius: radii.md, background: colors.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    <a.Icon size={16} color={colors.iconColor} strokeWidth={1.8} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing.sm }}>
                      <span style={{ fontSize: font.size.base, fontWeight: font.weight.semibold, color: colors.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</span>
                      {a.subcount > 0 && (
                        <span style={{ flexShrink: 0, fontSize: font.size.xxs, fontWeight: font.weight.bold, color: colors.textTertiary, background: colors.iconBg, borderRadius: radii.pill, padding: `2px 6px` }}>+{a.subcount}</span>
                      )}
                    </div>
                    <div style={{ fontSize: font.size.sm, color: colors.textSecondary, marginTop: 2 }}>{a.desc}</div>
                    <div style={{ marginTop: spacing.sm }}>
                      <span style={{ fontSize: font.size.xs, color: colors.textTertiary }}>{a.date} · {a.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: `${spacing.xl}px ${spacing.xl}px 0` }}>
              <span style={{ fontSize: font.size.xs, fontWeight: font.weight.semibold, color: colors.textTertiary, letterSpacing: "0.08em", textTransform: "uppercase" }}>Recentes</span>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: `${spacing.xxxl}px 0`, gap: spacing.sm }}>
                <Search size={iconSize.xxxl} color={colors.textTertiary} strokeWidth={1.5} />
                <span style={{ fontSize: font.size.sm, color: colors.textTertiary }}>Nenhuma busca recente</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* EVENT DETAIL */}
      <EventScreen event={selectedEvent} onClose={() => setSelectedEvent(null)} />

      {/* FILTER SHEET */}
      <Sheet open={filterSheet} onClose={() => setFilterSheet(false)} title="Filtros">
        <div style={{ padding: `0 ${spacing.xl}px` }}>
          <div style={{ fontSize: font.size.xs, fontWeight: font.weight.semibold, color: colors.textTertiary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: spacing.md }}>Tipo de atividade</div>
          {ACTIVITY_TYPES.map(f => (
            <button key={f.id} onClick={() => { setActiveType(f.id); setFilterSheet(false); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: `${spacing.md}px 0`, background: "none", border: "none", borderBottom: `1px solid ${colors.border}`, cursor: "pointer" }}>
              <span style={{ fontSize: font.size.base, fontWeight: font.weight.medium, color: activeType === f.id ? colors.textPrimary : colors.textSecondary }}>{f.label}</span>
              {activeType === f.id && <Check size={iconSize.lg} color="#16A34A" strokeWidth={2.5} />}
            </button>
          ))}
          {activeFilters > 0 && (
            <button onClick={() => { setActiveType("todos"); setFilterSheet(false); }} style={{ width: "100%", marginTop: spacing.lg, padding: `${spacing.md}px`, background: "#FEF2F2", border: "none", borderRadius: radii.xl, fontSize: font.size.sm, fontWeight: font.weight.semibold, color: "#DC2626", cursor: "pointer" }}>
              Limpar filtros
            </button>
          )}
        </div>
      </Sheet>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function MobistoryApp() {
  const [viewerExpanded, setViewerExpanded] = useState(false);
  const [fabOpen,        setFabOpen]        = useState(false);
  const [bondSheet,      setBondSheet]      = useState(false);
  const [actionsOpen,    setActionsOpen]    = useState(false);
  const [allBondsOpen,   setAllBondsOpen]   = useState(false);
  const [vehiclesOpen,   setVehiclesOpen]   = useState(false);
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const [identityOpen,   setIdentityOpen]   = useState(false);

  const dragStart = useRef(null);
  const dragCur   = useRef(null);
  const dragging  = useRef(false);

  const onDragStart = y => { dragStart.current = y; dragCur.current = y; dragging.current = true; };
  const onDragMove  = y => { if (dragging.current) dragCur.current = y; };
  const onDragEnd   = () => {
    if (!dragging.current) return;
    const d = (dragStart.current || 0) - (dragCur.current || 0);
    if (d > 40) setViewerExpanded(true);
    if (d < -40) setViewerExpanded(false);
    dragging.current = false;
  };

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: colors.background, minHeight: "100vh", maxWidth: 430, margin: "0 auto", position: "relative", overflow: "hidden", paddingBottom: 120 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateX(-50%) translateY(100%) } to { transform: translateX(-50%) translateY(0) } }
        .viewer { transition: height .45s cubic-bezier(.4,0,.2,1); }
        .fab { width: 46px; height: 46px; border-radius: 14px; background: #111827; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform .15s; }
        .fab:active { transform: scale(.92); }
        .ntab { display: flex; flex-direction: column; align-items: center; gap: 3px; flex: 1; cursor: pointer; padding: 8px 0; background: none; border: none; }
        .erow { display: flex; align-items: center; gap: 16px; padding: 16px 0; cursor: pointer; }
        .erow:active { opacity: .7; }
        .last-card { background: #FFF; border-radius: 16px; padding: 20px; cursor: pointer; }
        .last-card:active { background: #F7F8FA; }
        .gaction { background: #FFF; border-radius: 16px; padding: 16px 12px; border: 1px solid #F0F1F3; cursor: pointer; }
        .gaction:active { background: #F7F8FA; }
        .meta-chip { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 99px; background: #F3F4F6; font-size: 11px; font-weight: 500; color: #6B7280; }
        .action-btn { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #FFF; border: none; border-radius: 16px; cursor: pointer; width: 100%; }
        .action-btn:active { background: #F7F8FA; }
      `}</style>

      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `52px ${spacing.md}px ${spacing.md}px` }}>
        <button onClick={() => setVehiclesOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: spacing.xs, display: "flex" }}>
          <ArrowLeft size={iconSize.xxl} color={colors.accentMuted} strokeWidth={2} />
        </button>
        <button style={{ background: "none", border: "none", cursor: "pointer", padding: spacing.xs, display: "flex" }}>
          <MessageCircle size={iconSize.xxl} color={colors.accentMuted} strokeWidth={2} />
        </button>
      </div>

      {/* VIEWER */}
      <div className="viewer" style={{ height: viewerExpanded ? "100vh" : 200, margin: `0 ${spacing.lg}px`, borderRadius: spacing.xl, background: "linear-gradient(145deg, #EEF0F4, #E4E7ED)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        <Car size={iconSize.hero} color={colors.textTertiary} strokeWidth={1.2} />
        <span style={{ fontSize: font.size.xxs, color: "#B0B7C3", fontWeight: font.weight.semibold, letterSpacing: 1.5, marginTop: spacing.sm, textTransform: "uppercase" }}>Visualização 3D em breve</span>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: `${spacing.sm}px 0 ${spacing.md}px`, cursor: "ns-resize" }}
          onMouseDown={e => onDragStart(e.clientY)} onMouseMove={e => onDragMove(e.clientY)} onMouseUp={onDragEnd}
          onTouchStart={e => onDragStart(e.touches[0].clientY)} onTouchMove={e => onDragMove(e.touches[0].clientY)} onTouchEnd={onDragEnd}
        >
          <HandleBar />
        </div>
        {viewerExpanded && (
          <button onClick={() => setViewerExpanded(false)} style={{ position: "absolute", bottom: 28, background: "rgba(0,0,0,.10)", border: "none", borderRadius: radii.pill, padding: `${spacing.xs}px ${spacing.xl}px`, fontSize: font.size.sm, color: colors.accentMuted, cursor: "pointer", fontWeight: font.weight.semibold }}>Recolher</button>
        )}
      </div>

      {/* IDENTITY */}
      <div style={{ padding: `${spacing.xl}px ${spacing.xl}px 0` }}>
        <span style={{ fontSize: font.size.xs, fontWeight: font.weight.semibold, color: colors.textTertiary, letterSpacing: "0.08em", textTransform: "uppercase" }}>Identidade</span>
        <div style={{ display: "flex", alignItems: "center", gap: spacing.sm, flexWrap: "wrap", marginTop: spacing.sm }}>
          <h1 style={{ fontSize: font.size.hero, fontWeight: font.weight.bold, color: colors.textPrimary, lineHeight: 1.15, letterSpacing: "-0.02em" }}>{VEHICLE.name}</h1>
          {VEHICLE.verified && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: spacing.xs, background: "#DCFCE7", borderRadius: radii.pill, padding: `3px ${spacing.sm}px`, fontSize: font.size.xs, fontWeight: font.weight.semibold, color: "#16A34A", flexShrink: 0, marginTop: 4 }}>
              <BadgeCheck size={iconSize.xs} color="#16A34A" strokeWidth={2.5} />Verificado
            </span>
          )}
        </div>
        <p style={{ fontSize: font.size.base, color: colors.textSecondary, marginTop: 3 }}>Versão {VEHICLE.version}</p>
        <div style={{ display: "flex", alignItems: "center", gap: spacing.xs, flexWrap: "wrap", marginTop: spacing.md }}>
          {[{ Icon: Car, value: VEHICLE.plate }, { Icon: Calendar, value: VEHICLE.year }, { Icon: Palette, value: VEHICLE.color }, { Icon: Fuel, value: VEHICLE.fuel }].map(({ Icon, value }, i) => (
            <span key={i} className="meta-chip"><Icon size={iconSize.xs} color={colors.textTertiary} strokeWidth={1.8} />{value}</span>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.sm, marginTop: spacing.md }}>
          <button className="action-btn" onClick={() => setIdentityOpen(true)}>
            <div style={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
              <IconBox Icon={Car} size={iconSize.lg} boxSize={36} radius={radii.md} />
              <span style={{ fontSize: font.size.sm, fontWeight: font.weight.semibold, color: colors.textPrimary }}>Identidade</span>
            </div>
            <ChevronRight size={iconSize.md} color={colors.textTertiary} strokeWidth={2} />
          </button>
          <button className="action-btn" onClick={() => setBondSheet(true)}>
            <div style={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
              <IconBox Icon={User} size={iconSize.lg} boxSize={36} radius={radii.md} />
              <span style={{ fontSize: font.size.sm, fontWeight: font.weight.semibold, color: colors.textPrimary }}>Meu vínculo</span>
            </div>
            <ChevronRight size={iconSize.md} color={colors.textTertiary} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* REGISTROS */}
      <div style={{ padding: `${spacing.xxl}px ${spacing.xl}px 0` }}>
        <SectionLabel title="Registros" actionLabel="Ver tudo" onAction={() => setActionsOpen(true)} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.sm }}>
          {RECORDS.map(({ id, Icon, label, lastDate, lastValue }) => (
            <div key={id} className="last-card" style={{ borderRadius: radii.xl }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md }}>
                <IconBox Icon={Icon} size={iconSize.xl} boxSize={40} radius={radii.md} />
                <span style={{ fontSize: font.size.xs, color: colors.textTertiary }}>{lastDate}</span>
              </div>
              <div style={{ fontSize: font.size.base, fontWeight: font.weight.bold, color: colors.textPrimary }}>{label}</div>
              <div style={{ fontSize: font.size.sm, color: colors.textSecondary, marginTop: 2 }}>{lastValue}</div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: colors.surface, display: "flex", alignItems: "center", justifyContent: "space-around", padding: `${spacing.sm}px ${spacing.xxxl}px ${spacing.md}px`, zIndex: 20 }}>
        <button className="ntab">
          <Home size={iconSize.xxl} color={colors.accent} strokeWidth={2} />
          <span style={{ fontSize: font.size.xxs, fontWeight: font.weight.semibold, color: colors.accent }}>Início</span>
        </button>
        <button className="fab" onClick={() => setFabOpen(true)}>
          <Plus size={iconSize.xxxl} color={colors.textInverse} strokeWidth={2.5} />
        </button>
        <button className="ntab" onClick={() => setActivitiesOpen(true)}>
          <Activity size={iconSize.xxl} color={colors.textTertiary} strokeWidth={2} />
          <span style={{ fontSize: font.size.xxs, fontWeight: font.weight.medium, color: colors.textTertiary }}>Atividades</span>
        </button>
      </div>

      {/* TELAS */}
      <IdentityScreen   open={identityOpen}   onClose={() => setIdentityOpen(false)} onOpenBond={() => { setIdentityOpen(false); setBondSheet(true); }} onOpenAllBonds={() => { setIdentityOpen(false); setAllBondsOpen(true); }} />
      <ActivitiesScreen open={activitiesOpen} onClose={() => setActivitiesOpen(false)} />
      <VehiclesScreen   open={vehiclesOpen}   onClose={() => setVehiclesOpen(false)} />
      <RegisterScreen   open={fabOpen}        onClose={() => setFabOpen(false)} />
      <BondScreen       open={bondSheet}      onClose={() => setBondSheet(false)} onOpenAllBonds={() => setAllBondsOpen(true)} />
      <AllBondsScreen   open={allBondsOpen}   onClose={() => setAllBondsOpen(false)} />
      <ActionsScreen    open={actionsOpen}    onClose={() => setActionsOpen(false)} onOpenAllBonds={() => { setActionsOpen(false); setAllBondsOpen(true); }} />
    </div>
  );
}
