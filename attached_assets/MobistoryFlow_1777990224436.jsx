import { useState, useRef, useCallback } from "react";
import {
  ArrowLeft, ChevronRight, Camera, Check, X,
  ScanLine, FileText, PenLine, Upload,
  Car, CheckCircle, ShieldOff, Copy,
  KeyRound, Users, Navigation, Wrench, MoreHorizontal,
  Search, RotateCcw, AlertCircle, Sparkles, Zap, ZapOff,
} from "lucide-react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────

const C = {
  background:     "#F7F8FA",
  surface:        "#FFFFFF",
  border:         "#F0F1F3",
  textPrimary:    "#111827",
  textSecondary:  "#6B7280",
  textTertiary:   "#9CA3AF",
  textInverse:    "#FFFFFF",
  iconBg:         "#F3F4F6",
  iconColor:      "#6B7280",
  accent:         "#111827",
  accentMuted:    "#374151",
  separator:      "#D1D5DB",
  aiAccent:       "#6366F1",
  aiAccentBg:     "#EEF2FF",
  aiAccentBorder: "#C7D2FE",
  green:          "#16A34A",
  greenBg:        "#F0FDF4",
  greenBorder:    "#BBF7D0",
  greenText:      "#15803D",
};

const R = { sm: 10, md: 13, lg: 14, xl: 16, xxl: 20, pill: 99 };
const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 };
const F = {
  size:   { xxs: 10, xs: 11, sm: 12, base: 14, lg: 15, xl: 16, xxl: 17, xxxl: 22, hero: 28 },
  weight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
};
const I = { xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 22, xxxl: 24 };

// ─── NAVIGATION ───────────────────────────────────────────────────────────────

// screens: add_vehicle | doc_upload | manual_brand | manual_model | manual_version |
//          manual_year | manual_plate | manual_color | manual_fuel |
//          vehicle_confirm | bond_type | bond_doc | inspection | pending

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

function PageHeader({ title, onBack, right }) {
  return (
    <div style={{ marginBottom: S.sm }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: S.lg }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
          <ArrowLeft size={I.lg} color={C.accentMuted} strokeWidth={2} />
        </button>
        {right || <div style={{ width: I.lg }} />}
      </div>
      <h2 style={{ fontSize: F.size.hero, fontWeight: F.weight.bold, color: C.textPrimary, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
        {title}
      </h2>
    </div>
  );
}

function Footer({ children }) {
  return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: C.background, borderTop: `1px solid ${C.border}`, padding: `${S.md}px ${S.xl}px ${S.xxl}px`, zIndex: 10 }}>
      {children}
    </div>
  );
}

function PrimaryButton({ label, onPress, disabled }) {
  return (
    <button onClick={onPress} disabled={disabled}
      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: S.sm, width: "100%", background: disabled ? C.iconBg : C.accent, border: "none", borderRadius: R.xxl, padding: `${S.lg}px`, cursor: disabled ? "not-allowed" : "pointer" }}>
      <span style={{ fontSize: F.size.base, fontWeight: F.weight.bold, color: disabled ? C.textTertiary : C.textInverse }}>{label}</span>
      {!disabled && <ChevronRight size={I.lg} color={C.textInverse} strokeWidth={2.5} />}
    </button>
  );
}

function CaptureBtn({ field, onExtracted, processing, inputRef, processImage }) {
  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) processImage(f, field);
    e.target.value = "";
  };
  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: "none" }} />
      <button onClick={() => inputRef.current?.click()} disabled={processing}
        style={{ display: "flex", alignItems: "center", gap: S.xs, background: C.aiAccentBg, border: `1.5px solid ${C.aiAccentBorder}`, borderRadius: R.pill, padding: `6px ${S.md}px`, cursor: processing ? "wait" : "pointer" }}>
        {processing
          ? <Sparkles size={I.sm} color={C.aiAccent} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />
          : <Camera size={I.sm} color={C.aiAccent} strokeWidth={2} />}
        <span style={{ fontSize: F.size.xs, fontWeight: F.weight.bold, color: C.aiAccent }}>{processing ? "Analisando…" : "Capturar"}</span>
      </button>
    </>
  );
}

function useAiCapture(onExtracted) {
  const [processing, setProcessing] = useState(false);
  const [aiError, setAiError] = useState(null);
  const inputRef = useRef();
  const toBase64 = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(",")[1]); r.onerror = rej; r.readAsDataURL(file); });
  const processImage = useCallback(async (file, field) => {
    setProcessing(true); setAiError(null);
    try {
      const base64 = await toBase64(file);
      const PROMPTS = {
        brand: 'Identify vehicle brand. JSON only: {"brand":"..."}',
        model: 'Identify vehicle model. JSON only: {"model":"..."}',
        version: 'Identify vehicle version/trim. JSON only: {"version":"..."}',
        year: 'Identify vehicle year. JSON only: {"year":"..."}',
        plate: 'Identify license plate. JSON only: {"plate":"..."}',
        color: 'Identify vehicle color in Portuguese. JSON only: {"color":"..."}',
        fuel: 'Identify fuel type in Portuguese. JSON only: {"fuel":"..."}',
      };
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 200, messages: [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type: file.type || "image/jpeg", data: base64 } },
          { type: "text", text: PROMPTS[field] || PROMPTS.brand },
        ]}]}),
      });
      const data = await resp.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      onExtracted(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch { setAiError("Não consegui extrair. Preencha manualmente."); }
    finally { setProcessing(false); }
  }, [onExtracted]);
  return { processing, aiError, setAiError, inputRef, processImage };
}

function AiError({ message, onDismiss }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: S.sm, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: R.xl, padding: S.md, marginBottom: S.lg }}>
      <span style={{ flex: 1, fontSize: F.size.sm, color: "#B91C1C", lineHeight: 1.4 }}>{message}</span>
      <button onClick={onDismiss} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}><X size={I.sm} color="#EF4444" strokeWidth={2} /></button>
    </div>
  );
}

function SearchInput({ value, onChange, placeholder }) {
  return (
    <div style={{ display: "flex", alignItems: "center", background: C.surface, borderRadius: R.xl, padding: `14px ${S.lg}px`, gap: S.sm, marginBottom: S.lg }}>
      <Search size={I.lg} color={C.textTertiary} strokeWidth={2} />
      <input autoFocus value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ flex: 1, border: "none", background: "none", outline: "none", fontSize: F.size.xl, fontWeight: F.weight.semibold, color: C.textPrimary, fontFamily: "'DM Sans', system-ui, sans-serif" }} />
      {value.length > 0 && <button onClick={() => onChange("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}><X size={I.sm} color={C.textTertiary} strokeWidth={2.5} /></button>}
    </div>
  );
}

function ListRow({ label, selected, onSelect, last, icon: Icon }) {
  const isSel = selected === label;
  return (
    <button onClick={() => onSelect(label)}
      style={{ display: "flex", alignItems: "center", gap: S.md, width: "100%", padding: `${S.md}px 0`, background: "none", border: "none", borderBottom: last ? "none" : `1px solid ${C.border}`, cursor: "pointer", textAlign: "left" }}>
      {Icon && (
        <div style={{ width: 40, height: 40, borderRadius: R.md, background: isSel ? C.accent : C.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={I.lg} color={isSel ? C.textInverse : C.iconColor} strokeWidth={1.8} />
        </div>
      )}
      <span style={{ flex: 1, fontSize: F.size.base, fontWeight: isSel ? F.weight.bold : F.weight.semibold, color: C.textPrimary }}>{label}</span>
      {isSel && <Check size={I.lg} color={C.accent} strokeWidth={2.5} />}
    </button>
  );
}

function ChipList({ items, selected, onSelect }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: S.sm }}>
      {items.map(item => {
        const isSel = selected === item;
        return (
          <button key={item} onClick={() => onSelect(item)}
            style={{ padding: `${S.sm}px ${S.lg}px`, borderRadius: R.pill, border: `1.5px solid ${isSel ? C.accent : C.border}`, background: isSel ? C.accent : C.surface, color: isSel ? C.textInverse : C.textSecondary, fontSize: F.size.base, fontWeight: F.weight.semibold, cursor: "pointer" }}>
            {item}
          </button>
        );
      })}
    </div>
  );
}

function ProgressDots({ steps, current }) {
  return (
    <div style={{ display: "flex", gap: S.xs, padding: `${S.lg}px ${S.xl}px 0`, justifyContent: "center" }}>
      {steps.map((s, i) => (
        <div key={s} style={{ height: 3, flex: 1, borderRadius: R.pill, background: i <= current ? C.accent : C.border }} />
      ))}
    </div>
  );
}

// ─── DATA ─────────────────────────────────────────────────────────────────────

const BRANDS = ["Chevrolet","Fiat","Ford","Honda","Hyundai","Jeep","Nissan","Peugeot","Renault","Toyota","Volkswagen","BMW","Mercedes-Benz","Audi","Mitsubishi","Kia","Citroën","BYD","Ram"];
const MODELS = { Honda: ["HR-V","Civic","City","Fit","CR-V","WR-V"], Toyota: ["Corolla","Hilux","Yaris","RAV4","Corolla Cross"], Volkswagen: ["Gol","Polo","T-Cross","Virtus","Nivus","Amarok"], Fiat: ["Strada","Pulse","Argo","Cronos","Toro"], Chevrolet: ["Onix","Tracker","S10","Montana","Cruze"], Hyundai: ["HB20","Creta","Tucson","Santa Fe"], Jeep: ["Compass","Renegade","Commander","Wrangler"], Ford: ["Maverick","Territory","Ranger"], BMW: ["Série 3","Série 5","X1","X3"], BYD: ["Dolphin","Seal","Han","Atto 3"] };
const VERSIONS = { "Civic": ["EX CVT","EXL CVT","Touring CVT","Si 1.5 Turbo"], "Corolla": ["GLi 2.0","XEi 2.0","Altis 2.0","GR-S 2.0"], "HB20": ["Sense 1.0","Vision 1.0 Turbo","Platinum 1.0 Turbo"], "Creta": ["Action 1.0 Turbo","Limited 1.0 Turbo","Platinum 1.0 Turbo"], "Onix": ["Joy 1.0","Plus LT 1.0 Turbo","Plus LTZ 1.0 Turbo"], "Polo": ["Track 1.0","MPI 1.0","GTS 1.4 TSI"] };
const YEARS = Array.from({ length: 16 }, (_, i) => String(2025 - i));
const COLORS = ["Branco","Prata","Preto","Cinza","Vermelho","Azul","Verde","Amarelo","Laranja","Marrom","Bege","Dourado"];
const FUELS = ["Flex","Gasolina","Etanol","Diesel","GNV","Elétrico","Híbrido"];
const BOND_TYPES = [
  { id: "proprietario",   icon: KeyRound,       label: "Proprietário",         description: "O veículo está registrado em seu nome" },
  { id: "coproprietario", icon: Users,           label: "Co-proprietário",      description: "O veículo está registrado em seu nome junto a outra pessoa" },
  { id: "condutor",       icon: Navigation,      label: "Condutor habitual",    description: "Você utiliza o veículo regularmente mas não é o proprietário" },
  { id: "mecanico",       icon: Wrench,          label: "Mecânico responsável", description: "Você é responsável pela manutenção deste veículo" },
  { id: "outro",          icon: MoreHorizontal,  label: "Outro",                description: "Outro tipo de relação com o veículo" },
];
const DOCS_BY_BOND = { proprietario: "CRLV, nota fiscal, DUT ou documento de transferência", coproprietario: "CRLV com seu nome ou documento de transferência", condutor: "CNH acompanhada de declaração do proprietário", mecanico: "Contrato de prestação de serviço ou declaração", outro: "Qualquer documento que comprove sua relação com o veículo" };
const INSPECTION_STEPS = [
  { id: "frente",    label: "Frente",          instruction: "Fotografe a parte frontal do veículo inteira, de frente",    required: true  },
  { id: "traseira",  label: "Traseira",        instruction: "Fotografe a parte traseira do veículo inteira",             required: true  },
  { id: "lateral_e", label: "Lateral esquerda",instruction: "Fotografe toda a lateral esquerda",                         required: true  },
  { id: "lateral_d", label: "Lateral direita", instruction: "Fotografe toda a lateral direita",                          required: true  },
  { id: "painel",    label: "Painel",          instruction: "Fotografe o painel com o hodômetro visível",                required: true  },
  { id: "placa",     label: "Placa",           instruction: "Fotografe a placa com boa iluminação",                      required: true  },
  { id: "chassi",    label: "Chassi físico",   instruction: "Fotografe o número do chassi gravado na carroceria",        required: false },
];
const VEHICLE_FOUND = { brand: "Honda", model: "Civic", version: "Versão XLI 1.6", uvi: "MBS-··21-··847", issuedAt: "15 jan. 2023", issuedBy: "Mobistory", verified: true, plate: "ABC-··34", renavam: "123.···.···-0", chassis: "9BWZZZ···T004251", year: "2021 / 2021", fuel: "Flex", color: "Prata", power: "126 cv", engine: "1.598 cc", body: "Sedã", category: "Particular", manufacturer: "Honda do Brasil", origin: "Brasil", factory: "Sumaré - SP", group: "Honda Motor Co." };
const VEHICLE_NEW  = { brand: "Toyota", model: "Corolla", version: "Versão GLi 2.0", uvi: null, issuedAt: null, issuedBy: null, verified: false, plate: "DEF-··78", renavam: "987.···.···-0", chassis: "9BR···ZZ2T001234", year: "2022 / 2022", fuel: "Flex", color: "Branco", power: "177 cv", engine: "1.998 cc", body: "Sedã", category: "Particular", manufacturer: "Toyota do Brasil", origin: "Brasil", factory: "Indaiatuba - SP", group: "Toyota Motor Corporation" };

// ─── SCREENS ──────────────────────────────────────────────────────────────────

function ScreenAddVehicle({ navigate }) {
  const [uvi, setUvi] = useState("");
  const cameraRef = useRef();
  return (
    <div style={{ padding: `${S.xxxl}px ${S.xl}px`, paddingBottom: uvi.trim().length > 0 ? 120 : S.xxxl }}>
      <PageHeader title="Informe o veículo" onBack={() => navigate("home")} />
      <p style={{ fontSize: F.size.base, color: C.textSecondary, marginBottom: S.xxl, marginTop: S.sm, lineHeight: 1.5 }}>Informe os dados do veículo que deseja adicionar</p>

      <div style={{ display: "flex", alignItems: "center", background: C.surface, borderRadius: R.xl, padding: `14px ${S.lg}px`, gap: S.sm, marginBottom: S.xs }}>
        <ScanLine size={I.lg} color={C.textTertiary} strokeWidth={1.8} />
        <input autoFocus value={uvi} onChange={e => setUvi(e.target.value.toUpperCase())} placeholder="Digite o UVI do veículo"
          style={{ flex: 1, border: "none", background: "none", outline: "none", fontSize: F.size.xl, fontWeight: F.weight.semibold, color: C.textPrimary, fontFamily: "'DM Sans', system-ui, sans-serif", letterSpacing: uvi ? "0.06em" : "normal" }} />
        <button onClick={() => cameraRef.current?.click()}
          style={{ display: "flex", alignItems: "center", gap: S.xs, background: C.aiAccentBg, border: `1.5px solid ${C.aiAccentBorder}`, borderRadius: R.pill, padding: `6px ${S.md}px`, cursor: "pointer" }}>
          <Camera size={I.sm} color={C.aiAccent} strokeWidth={2} />
          <span style={{ fontSize: F.size.xs, fontWeight: F.weight.bold, color: C.aiAccent }}>Câmera</span>
        </button>
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} />
      </div>
      <p style={{ fontSize: F.size.xs, color: C.textTertiary, marginBottom: S.xs, paddingLeft: S.xs }}>O UVI é o identificador único permanente do veículo</p>

      <div style={{ display: "flex", alignItems: "center", gap: S.md, marginTop: S.sm, marginBottom: S.sm }}>
        <div style={{ flex: 1, height: 1, background: C.border }} />
        <span style={{ fontSize: F.size.xs, fontWeight: F.weight.semibold, color: C.textTertiary, letterSpacing: "0.08em", textTransform: "uppercase" }}>ou</span>
        <div style={{ flex: 1, height: 1, background: C.border }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: S.sm }}>
        {[
          { icon: FileText, title: "Enviar documento do veículo", desc: "Tire uma foto ou faça upload do CRLV ou outro documento", screen: "doc_upload" },
          { icon: PenLine,  title: "Informar manualmente",        desc: "Preencha os dados do veículo você mesmo",                screen: "manual_brand" },
        ].map(opt => (
          <button key={opt.screen} onClick={() => navigate(opt.screen)}
            style={{ display: "flex", alignItems: "center", gap: S.lg, width: "100%", background: C.surface, border: "none", borderRadius: R.xl, padding: S.lg, cursor: "pointer", textAlign: "left" }}>
            <div style={{ width: 44, height: 44, borderRadius: R.md, background: C.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <opt.icon size={I.xl} color={C.iconColor} strokeWidth={1.8} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: F.size.base, fontWeight: F.weight.bold, color: C.textPrimary, marginBottom: 3 }}>{opt.title}</div>
              <div style={{ fontSize: F.size.sm, color: C.textSecondary, lineHeight: 1.4 }}>{opt.desc}</div>
            </div>
            <ChevronRight size={I.lg} color={C.textTertiary} strokeWidth={2} />
          </button>
        ))}
      </div>

      {uvi.trim().length > 0 && (
        <Footer><PrimaryButton label="Continuar com UVI" onPress={() => navigate("vehicle_confirm", { source: "uvi", vehicleFound: true })} /></Footer>
      )}
    </div>
  );
}

function ScreenDocUpload({ navigate }) {
  const [file, setFile] = useState(null);
  const cameraRef = useRef(); const galleryRef = useRef();
  const handleFile = (e) => { const f = e.target.files?.[0]; if (f) setFile(f); e.target.value = ""; };
  return (
    <div style={{ padding: `${S.xxxl}px ${S.xl}px`, paddingBottom: file ? 120 : S.xxxl }}>
      <PageHeader title="Documento do veículo" onBack={() => navigate("add_vehicle")} />
      <p style={{ fontSize: F.size.base, color: C.textSecondary, marginBottom: S.xxl, marginTop: S.sm, lineHeight: 1.5 }}>Envie uma foto ou arquivo do documento do veículo.</p>
      {file ? (
        <div style={{ position: "relative", background: C.surface, borderRadius: R.xl, overflow: "hidden", border: `1.5px solid ${C.border}` }}>
          {file.type.startsWith("image/")
            ? <img src={URL.createObjectURL(file)} alt="doc" style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} />
            : <div style={{ height: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: S.md }}>
                <FileText size={I.xxl} color={C.iconColor} strokeWidth={1.8} />
                <span style={{ fontSize: F.size.sm, color: C.textSecondary }}>{file.name}</span>
              </div>
          }
          <button onClick={() => setFile(null)} style={{ position: "absolute", top: S.sm, right: S.sm, width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={I.sm} color="#fff" strokeWidth={2.5} />
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: S.sm }}>
          {[{ icon: Camera, title: "Tirar foto", desc: "Use a câmera para fotografar o documento", ref: cameraRef, capture: true },
            { icon: Upload, title: "Escolher da galeria", desc: "Selecione uma imagem ou PDF já salvo", ref: galleryRef, capture: false }].map((opt, idx) => (
            <button key={idx} onClick={() => opt.ref.current?.click()}
              style={{ display: "flex", alignItems: "center", gap: S.lg, width: "100%", background: C.surface, border: "none", borderRadius: R.xl, padding: S.lg, cursor: "pointer", textAlign: "left" }}>
              <div style={{ width: 44, height: 44, borderRadius: R.md, background: C.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <opt.icon size={I.xl} color={C.iconColor} strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: F.size.base, fontWeight: F.weight.bold, color: C.textPrimary, marginBottom: 3 }}>{opt.title}</div>
                <div style={{ fontSize: F.size.sm, color: C.textSecondary }}>{opt.desc}</div>
              </div>
              <ChevronRight size={I.lg} color={C.textTertiary} strokeWidth={2} />
            </button>
          ))}
        </div>
      )}
      <p style={{ fontSize: F.size.xs, color: C.textTertiary, marginTop: S.lg, lineHeight: 1.5, paddingLeft: S.xs }}>Documentos aceitos: CRLV, nota fiscal, DUT ou qualquer documento oficial do veículo</p>
      <input ref={cameraRef}  type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: "none" }} />
      <input ref={galleryRef} type="file" accept="image/*,application/pdf" onChange={handleFile} style={{ display: "none" }} />
      {file && <Footer><PrimaryButton label="Continuar" onPress={() => navigate("vehicle_confirm", { source: "doc", vehicleFound: Math.random() > 0.5 })} /></Footer>}
    </div>
  );
}

// Manual flow steps
const MANUAL_STEPS = ["manual_brand","manual_model","manual_version","manual_year","manual_plate","manual_color","manual_fuel"];

function ManualStepWrapper({ stepIndex, title, onBack, captureBtn, children, footer }) {
  return (
    <div>
      <ProgressDots steps={MANUAL_STEPS} current={stepIndex} />
      <div style={{ padding: `${S.xl}px ${S.xl}px`, paddingBottom: footer ? 120 : S.xxxl }}>
        <PageHeader title={title} onBack={onBack} right={captureBtn} />
        {children}
      </div>
      {footer}
    </div>
  );
}

function ScreenManualBrand({ draft, setDraft, navigate }) {
  const [query, setQuery] = useState("");
  const list = BRANDS.filter(b => b.toLowerCase().includes(query.toLowerCase()));
  const { processing, aiError, setAiError, inputRef, processImage } = useAiCapture(({ brand }) => { if (brand) { setDraft(d => ({ ...d, brand })); navigate("manual_model"); } });
  return (
    <ManualStepWrapper stepIndex={0} title="Qual a marca?" onBack={() => navigate("add_vehicle")}
      captureBtn={<CaptureBtn field="brand" onExtracted={({ brand }) => { if (brand) { setDraft(d => ({ ...d, brand })); navigate("manual_model"); } }} processing={processing} inputRef={inputRef} processImage={processImage} />}>
      {aiError && <AiError message={aiError} onDismiss={() => setAiError(null)} />}
      <p style={{ fontSize: F.size.base, color: C.textSecondary, marginBottom: S.xl, marginTop: S.sm, lineHeight: 1.5 }}>Selecione a marca do veículo.</p>
      <SearchInput value={query} onChange={setQuery} placeholder="Buscar marca..." />
      <div>
        {list.map((b, i) => (
          <ListRow key={b} label={b} selected={draft.brand} icon={Car}
            onSelect={v => { setDraft(d => ({ ...d, brand: v, model: null, version: null })); navigate("manual_model"); }}
            last={i === list.length - 1} />
        ))}
      </div>
    </ManualStepWrapper>
  );
}

function ScreenManualModel({ draft, setDraft, navigate }) {
  const [query, setQuery] = useState("");
  const all = MODELS[draft.brand] || [];
  const list = all.filter(m => m.toLowerCase().includes(query.toLowerCase()));
  const { processing, aiError, setAiError, inputRef, processImage } = useAiCapture(({ model }) => { if (model) { setDraft(d => ({ ...d, model })); navigate("manual_version"); } });
  return (
    <ManualStepWrapper stepIndex={1} title="Qual o modelo?" onBack={() => navigate("manual_brand")}
      captureBtn={<CaptureBtn field="model" onExtracted={({ model }) => { if (model) { setDraft(d => ({ ...d, model })); navigate("manual_version"); } }} processing={processing} inputRef={inputRef} processImage={processImage} />}>
      {aiError && <AiError message={aiError} onDismiss={() => setAiError(null)} />}
      <p style={{ fontSize: F.size.base, color: C.textSecondary, marginBottom: S.xl, marginTop: S.sm, lineHeight: 1.5 }}>Selecione o modelo do veículo.</p>
      <SearchInput value={query} onChange={setQuery} placeholder="Buscar modelo..." />
      <div>
        {list.length > 0 ? list.map((m, i) => (
          <ListRow key={m} label={m} selected={draft.model}
            onSelect={v => { setDraft(d => ({ ...d, model: v, version: null })); navigate("manual_version"); }}
            last={i === list.length - 1} />
        )) : <p style={{ fontSize: F.size.sm, color: C.textTertiary, textAlign: "center", padding: S.xl }}>Nenhum modelo encontrado para {draft.brand}</p>}
      </div>
    </ManualStepWrapper>
  );
}

function ScreenManualVersion({ draft, setDraft, navigate }) {
  const [query, setQuery] = useState("");
  const all = VERSIONS[draft.model] || [];
  const list = all.filter(v => v.toLowerCase().includes(query.toLowerCase()));
  const { processing, aiError, setAiError, inputRef, processImage } = useAiCapture(({ version }) => { if (version) { setDraft(d => ({ ...d, version })); navigate("manual_year"); } });
  return (
    <ManualStepWrapper stepIndex={2} title="Qual a versão?" onBack={() => navigate("manual_model")}
      captureBtn={<CaptureBtn field="version" onExtracted={({ version }) => { if (version) { setDraft(d => ({ ...d, version })); navigate("manual_year"); } }} processing={processing} inputRef={inputRef} processImage={processImage} />}>
      {aiError && <AiError message={aiError} onDismiss={() => setAiError(null)} />}
      <p style={{ fontSize: F.size.base, color: C.textSecondary, marginBottom: S.xl, marginTop: S.sm, lineHeight: 1.5 }}>Selecione a versão do veículo.</p>
      <SearchInput value={query} onChange={setQuery} placeholder="Buscar versão..." />
      {list.length > 0 ? (
        <div>
          {list.map((v, i) => (
            <ListRow key={v} label={v} selected={draft.version}
              onSelect={val => { setDraft(d => ({ ...d, version: val })); navigate("manual_year"); }}
              last={i === list.length - 1} />
          ))}
        </div>
      ) : (
        <div>
          <p style={{ fontSize: F.size.sm, color: C.textSecondary, marginBottom: S.lg, lineHeight: 1.5 }}>Não encontramos versões cadastradas. Digite manualmente.</p>
          {query.trim().length > 0 && (
            <Footer><PrimaryButton label={`Usar "${query.trim()}"`} onPress={() => { setDraft(d => ({ ...d, version: query.trim() })); navigate("manual_year"); }} /></Footer>
          )}
        </div>
      )}
    </ManualStepWrapper>
  );
}

function ScreenManualYear({ draft, setDraft, navigate }) {
  const { processing, aiError, setAiError, inputRef, processImage } = useAiCapture(({ year }) => { if (year) { setDraft(d => ({ ...d, year })); navigate("manual_plate"); } });
  return (
    <ManualStepWrapper stepIndex={3} title="Qual o ano?" onBack={() => navigate("manual_version")}
      captureBtn={<CaptureBtn field="year" onExtracted={({ year }) => { if (year) { setDraft(d => ({ ...d, year })); navigate("manual_plate"); } }} processing={processing} inputRef={inputRef} processImage={processImage} />}>
      {aiError && <AiError message={aiError} onDismiss={() => setAiError(null)} />}
      <p style={{ fontSize: F.size.base, color: C.textSecondary, marginBottom: S.xl, marginTop: S.sm, lineHeight: 1.5 }}>Selecione o ano de fabricação.</p>
      <div>
        {YEARS.map((y, i) => (
          <ListRow key={y} label={y} selected={draft.year}
            onSelect={v => { setDraft(d => ({ ...d, year: v })); navigate("manual_plate"); }}
            last={i === YEARS.length - 1} />
        ))}
      </div>
    </ManualStepWrapper>
  );
}

function ScreenManualPlate({ draft, setDraft, navigate }) {
  const [plate, setPlate] = useState(draft.plate || "");
  const formatted = plate.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
  const canContinue = formatted.length >= 4;
  const { processing, aiError, setAiError, inputRef, processImage } = useAiCapture(({ plate: p }) => { if (p) setPlate(p.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7)); });
  return (
    <ManualStepWrapper stepIndex={4} title="Qual a placa?" onBack={() => navigate("manual_year")}
      captureBtn={<CaptureBtn field="plate" onExtracted={({ plate: p }) => { if (p) setPlate(p); }} processing={processing} inputRef={inputRef} processImage={processImage} />}
      footer={canContinue ? <Footer><PrimaryButton label="Continuar" onPress={() => { setDraft(d => ({ ...d, plate: formatted })); navigate("manual_color"); }} /></Footer> : null}>
      {aiError && <AiError message={aiError} onDismiss={() => setAiError(null)} />}
      <p style={{ fontSize: F.size.base, color: C.textSecondary, marginBottom: S.xl, marginTop: S.sm, lineHeight: 1.5 }}>Informe a placa atual do veículo.</p>
      <div style={{ background: C.surface, borderRadius: R.xl, padding: `${S.xl}px ${S.lg}px`, marginBottom: S.sm }}>
        <input autoFocus value={formatted} onChange={e => setPlate(e.target.value)} placeholder="ABC1D23" maxLength={7}
          style={{ width: "100%", border: "none", background: "none", outline: "none", fontSize: 36, fontWeight: F.weight.bold, color: C.textPrimary, fontFamily: "'DM Sans', system-ui, sans-serif", letterSpacing: "0.15em", textAlign: "center" }} />
      </div>
      <p style={{ fontSize: F.size.xs, color: C.textTertiary, paddingLeft: S.xs, lineHeight: 1.5 }}>Formato antigo: ABC-1234 · Mercosul: ABC1D23</p>
    </ManualStepWrapper>
  );
}

function ScreenManualColor({ draft, setDraft, navigate }) {
  const [color, setColor] = useState(draft.color || null);
  const { processing, aiError, setAiError, inputRef, processImage } = useAiCapture(({ color: c }) => { if (c) setColor(c); });
  return (
    <ManualStepWrapper stepIndex={5} title="Qual a cor?" onBack={() => navigate("manual_plate")}
      captureBtn={<CaptureBtn field="color" onExtracted={({ color: c }) => { if (c) setColor(c); }} processing={processing} inputRef={inputRef} processImage={processImage} />}
      footer={color ? <Footer><PrimaryButton label="Continuar" onPress={() => { setDraft(d => ({ ...d, color })); navigate("manual_fuel"); }} /></Footer> : null}>
      {aiError && <AiError message={aiError} onDismiss={() => setAiError(null)} />}
      <p style={{ fontSize: F.size.base, color: C.textSecondary, marginBottom: S.xl, marginTop: S.sm, lineHeight: 1.5 }}>Selecione a cor do veículo.</p>
      <ChipList items={COLORS} selected={color} onSelect={setColor} />
    </ManualStepWrapper>
  );
}

function ScreenManualFuel({ draft, setDraft, navigate }) {
  const [fuel, setFuel] = useState(draft.fuel || null);
  const { processing, aiError, setAiError, inputRef, processImage } = useAiCapture(({ fuel: f }) => { if (f) setFuel(f); });
  return (
    <ManualStepWrapper stepIndex={6} title="Qual o combustível?" onBack={() => navigate("manual_color")}
      captureBtn={<CaptureBtn field="fuel" onExtracted={({ fuel: f }) => { if (f) setFuel(f); }} processing={processing} inputRef={inputRef} processImage={processImage} />}
      footer={fuel ? <Footer><PrimaryButton label="Continuar" onPress={() => { setDraft(d => ({ ...d, fuel })); navigate("vehicle_confirm", { source: "manual", vehicleFound: Math.random() > 0.5 }); }} /></Footer> : null}>
      {aiError && <AiError message={aiError} onDismiss={() => setAiError(null)} />}
      <p style={{ fontSize: F.size.base, color: C.textSecondary, marginBottom: S.xl, marginTop: S.sm, lineHeight: 1.5 }}>Selecione o tipo de combustível.</p>
      <ChipList items={FUELS} selected={fuel} onSelect={setFuel} />
    </ManualStepWrapper>
  );
}

function ScreenVehicleConfirm({ params, navigate }) {
  const found = params?.vehicleFound ?? true;
  const v = found ? VEHICLE_FOUND : VEHICLE_NEW;

  const SectionLabel = ({ children }) => (
    <div style={{ fontSize: F.size.xs, fontWeight: F.weight.semibold, color: C.textTertiary, letterSpacing: "0.08em", textTransform: "uppercase", padding: `${S.lg}px ${S.xl}px ${S.sm}px` }}>{children}</div>
  );
  const DataRow = ({ label, value, last }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${S.md}px ${S.xl}px`, borderBottom: last ? "none" : `1px solid ${C.border}` }}>
      <span style={{ fontSize: F.size.base, color: C.textSecondary }}>{label}</span>
      <span style={{ fontSize: F.size.base, fontWeight: F.weight.bold, color: C.textPrimary, fontFamily: "monospace", letterSpacing: "0.02em" }}>{value}</span>
    </div>
  );

  const backScreen = params?.source === "manual" ? "manual_fuel" : params?.source === "doc" ? "doc_upload" : "add_vehicle";

  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: `${S.xxxl}px ${S.xl}px ${S.sm}px` }}>
        <button onClick={() => navigate(backScreen)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", marginBottom: S.lg }}>
          <ArrowLeft size={I.lg} color={C.accentMuted} strokeWidth={2} />
        </button>
        <h2 style={{ fontSize: F.size.hero, fontWeight: F.weight.bold, color: C.textPrimary, letterSpacing: "-0.02em", lineHeight: 1.1 }}>Confirme o veículo</h2>
      </div>

      <div style={{ margin: `${S.lg}px ${S.xl}px`, background: C.surface, borderRadius: R.xxl, overflow: "hidden", marginBottom: S.sm }}>
        <div style={{ padding: S.xl }}>
          <div style={{ marginBottom: S.lg }}>
            <div style={{ width: 56, height: 56, borderRadius: R.lg, background: C.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Car size={I.xxl} color={C.iconColor} strokeWidth={1.5} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: S.sm, marginBottom: S.xs }}>
            <span style={{ fontSize: F.size.xxxl, fontWeight: F.weight.bold, color: C.textPrimary }}>{v.brand} {v.model}</span>
            {v.verified && (
              <div style={{ display: "flex", alignItems: "center", gap: 3, background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: R.pill, padding: `2px ${S.sm}px` }}>
                <CheckCircle size={I.xs} color={C.greenText} strokeWidth={2.5} />
                <span style={{ fontSize: F.size.xs, fontWeight: F.weight.semibold, color: C.greenText }}>Verificado</span>
              </div>
            )}
          </div>
          <div style={{ fontSize: F.size.sm, color: C.textSecondary, marginBottom: S.xl }}>{v.version}</div>
          {v.uvi ? (
            <div style={{ background: C.background, borderRadius: R.lg, padding: S.md, marginBottom: S.lg }}>
              <div style={{ fontSize: F.size.xs, color: C.textTertiary, marginBottom: S.xs }}>Nº de identidade</div>
              <span style={{ fontSize: F.size.xl, fontWeight: F.weight.bold, color: C.textPrimary, fontFamily: "monospace", letterSpacing: "0.04em" }}>{v.uvi}</span>
            </div>
          ) : (
            <div style={{ background: C.background, borderRadius: R.lg, padding: S.md, marginBottom: S.lg, display: "flex", alignItems: "center", gap: S.md }}>
              <div style={{ width: 36, height: 36, borderRadius: R.md, background: C.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ShieldOff size={I.md} color={C.textSecondary} strokeWidth={1.8} />
              </div>
              <div>
                <div style={{ fontSize: F.size.sm, fontWeight: F.weight.semibold, color: C.textPrimary, marginBottom: 2 }}>Identidade não encontrada</div>
                <div style={{ fontSize: F.size.xs, color: C.textSecondary, lineHeight: 1.5 }}>Ao continuar, a identidade será emitida para este veículo</div>
              </div>
            </div>
          )}
          {v.issuedAt && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div><div style={{ fontSize: F.size.xs, color: C.textTertiary, marginBottom: 2 }}>Emitida em</div><div style={{ fontSize: F.size.sm, fontWeight: F.weight.semibold, color: C.textPrimary }}>{v.issuedAt}</div></div>
              <div style={{ textAlign: "right" }}><div style={{ fontSize: F.size.xs, color: C.textTertiary, marginBottom: 2 }}>Emitida por</div><div style={{ fontSize: F.size.sm, fontWeight: F.weight.semibold, color: C.textPrimary }}>{v.issuedBy}</div></div>
            </div>
          )}
        </div>
      </div>

      <SectionLabel>Registro Oficial</SectionLabel>
      <div style={{ margin: `0 ${S.xl}px`, background: C.surface, borderRadius: R.xxl, overflow: "hidden", marginBottom: S.sm }}>
        <DataRow label="Placa" value={v.plate} /><DataRow label="RENAVAM" value={v.renavam} /><DataRow label="Chassi" value={v.chassis} /><DataRow label="Ano fab./mod." value={v.year} last />
      </div>
      <SectionLabel>Características</SectionLabel>
      <div style={{ margin: `0 ${S.xl}px`, background: C.surface, borderRadius: R.xxl, overflow: "hidden", marginBottom: S.sm }}>
        <DataRow label="Combustível" value={v.fuel} /><DataRow label="Cor" value={v.color} /><DataRow label="Potência" value={v.power} /><DataRow label="Cilindrada" value={v.engine} /><DataRow label="Carroceria" value={v.body} /><DataRow label="Categoria" value={v.category} last />
      </div>
      <SectionLabel>Fabricação</SectionLabel>
      <div style={{ margin: `0 ${S.xl}px`, background: C.surface, borderRadius: R.xxl, overflow: "hidden", marginBottom: S.sm }}>
        <DataRow label="Fabricante" value={v.manufacturer} /><DataRow label="País de origem" value={v.origin} /><DataRow label="Fábrica" value={v.factory} /><DataRow label="Grupo" value={v.group} last />
      </div>

      <Footer>
        <PrimaryButton label={found ? "Confirmar veículo" : "Emitir identidade e continuar"} onPress={() => navigate("bond_type")} />
      </Footer>
    </div>
  );
}

function ScreenBondType({ navigate }) {
  const [selected, setSelected] = useState(null);
  return (
    <div style={{ padding: `${S.xxxl}px ${S.xl}px`, paddingBottom: selected ? 120 : S.xxxl }}>
      <PageHeader title="Tipo de vínculo" onBack={() => navigate("vehicle_confirm")} />
      <p style={{ fontSize: F.size.base, color: C.textSecondary, marginBottom: S.xxl, marginTop: S.sm, lineHeight: 1.5 }}>Selecione qual é o seu vínculo com este veículo.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: S.sm }}>
        {BOND_TYPES.map(item => {
          const Icon = item.icon;
          const isSel = selected === item.id;
          return (
            <button key={item.id} onClick={() => setSelected(item.id)}
              style={{ display: "flex", alignItems: "center", gap: S.lg, width: "100%", background: C.surface, border: isSel ? `1.5px solid ${C.accent}` : "1.5px solid transparent", borderRadius: R.xl, padding: S.lg, cursor: "pointer", textAlign: "left" }}>
              <div style={{ width: 44, height: 44, borderRadius: R.md, background: isSel ? C.accent : C.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={I.xl} color={isSel ? C.textInverse : C.iconColor} strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: F.size.base, fontWeight: F.weight.bold, color: C.textPrimary, marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: F.size.sm, color: C.textSecondary, lineHeight: 1.4 }}>{item.description}</div>
              </div>
              <div style={{ width: 22, height: 22, borderRadius: "50%", border: isSel ? "none" : `1.5px solid ${C.border}`, background: isSel ? C.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {isSel && <Check size={I.xs} color={C.textInverse} strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>
      {selected && <Footer><PrimaryButton label="Continuar" onPress={() => navigate("bond_doc", { bondType: selected })} /></Footer>}
    </div>
  );
}

function ScreenBondDoc({ params, navigate }) {
  const bondType = params?.bondType || "proprietario";
  const [file, setFile] = useState(null);
  const cameraRef = useRef(); const galleryRef = useRef();
  const handleFile = (e) => { const f = e.target.files?.[0]; if (f) setFile(f); e.target.value = ""; };
  return (
    <div style={{ padding: `${S.xxxl}px ${S.xl}px`, paddingBottom: file ? 120 : S.xxxl }}>
      <PageHeader title="Comprovante de vínculo" onBack={() => navigate("bond_type")} />
      <p style={{ fontSize: F.size.base, color: C.textSecondary, marginBottom: S.xxl, marginTop: S.sm, lineHeight: 1.5 }}>Envie um documento que comprove o seu vínculo com este veículo.</p>
      {file ? (
        <div style={{ position: "relative", background: C.surface, borderRadius: R.xl, overflow: "hidden", border: `1.5px solid ${C.border}` }}>
          {file.type.startsWith("image/")
            ? <img src={URL.createObjectURL(file)} alt="doc" style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} />
            : <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}><FileText size={I.xxl} color={C.iconColor} strokeWidth={1.8} /></div>}
          <button onClick={() => setFile(null)} style={{ position: "absolute", top: S.sm, right: S.sm, width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={I.sm} color="#fff" strokeWidth={2.5} />
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: S.sm }}>
          {[{ icon: Camera, title: "Tirar foto", desc: "Use a câmera para fotografar o documento", ref: cameraRef },
            { icon: Upload, title: "Escolher da galeria", desc: "Selecione uma imagem ou PDF já salvo", ref: galleryRef }].map((opt, i) => (
            <button key={i} onClick={() => opt.ref.current?.click()}
              style={{ display: "flex", alignItems: "center", gap: S.lg, width: "100%", background: C.surface, border: "none", borderRadius: R.xl, padding: S.lg, cursor: "pointer", textAlign: "left" }}>
              <div style={{ width: 44, height: 44, borderRadius: R.md, background: C.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <opt.icon size={I.xl} color={C.iconColor} strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: F.size.base, fontWeight: F.weight.bold, color: C.textPrimary, marginBottom: 3 }}>{opt.title}</div>
                <div style={{ fontSize: F.size.sm, color: C.textSecondary }}>{opt.desc}</div>
              </div>
              <ChevronRight size={I.lg} color={C.textTertiary} strokeWidth={2} />
            </button>
          ))}
        </div>
      )}
      <p style={{ fontSize: F.size.xs, color: C.textTertiary, marginTop: S.lg, lineHeight: 1.5, paddingLeft: S.xs }}>Documentos aceitos: {DOCS_BY_BOND[bondType]}</p>
      <input ref={cameraRef}  type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: "none" }} />
      <input ref={galleryRef} type="file" accept="image/*,application/pdf" onChange={handleFile} style={{ display: "none" }} />
      {file && <Footer><PrimaryButton label="Continuar" onPress={() => navigate("inspection")} /></Footer>}
    </div>
  );
}

function ScreenInspection({ navigate }) {
  const [photos, setPhotos] = useState({});
  const inputRefs = useRef({});
  const required = INSPECTION_STEPS.filter(s => s.required);
  const doneRequired = required.filter(s => photos[s.id]).length;
  const canFinish = doneRequired === required.length;

  const handleFile = (id, e) => {
    const f = e.target.files?.[0];
    if (f) setPhotos(prev => ({ ...prev, [id]: f }));
    e.target.value = "";
  };

  return (
    <div style={{ padding: `${S.xxxl}px ${S.xl}px`, paddingBottom: 120 }}>
      <PageHeader title="Vistoria" onBack={() => navigate("bond_doc")} />
      <p style={{ fontSize: F.size.base, color: C.textSecondary, marginBottom: S.xl, marginTop: S.sm, lineHeight: 1.5 }}>Fotografe o veículo seguindo as etapas abaixo.</p>

      <div style={{ marginBottom: S.xxl }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: S.sm }}>
          <span style={{ fontSize: F.size.sm, color: C.textSecondary }}>{doneRequired} de {required.length} fotos obrigatórias</span>
          <span style={{ fontSize: F.size.sm, fontWeight: F.weight.bold, color: C.textPrimary }}>{Math.round((doneRequired / required.length) * 100)}%</span>
        </div>
        <div style={{ height: 4, background: C.border, borderRadius: R.pill, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(doneRequired / required.length) * 100}%`, background: C.accent, borderRadius: R.pill }} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: S.sm }}>
        {INSPECTION_STEPS.map(step => {
          const isDone = !!photos[step.id];
          return (
            <div key={step.id}
              style={{ background: C.surface, borderRadius: R.xl, overflow: "hidden", border: isDone ? `1.5px solid ${C.greenBorder}` : "1.5px solid transparent" }}>
              <div style={{ display: "flex", alignItems: "center", gap: S.md, padding: S.lg }}>
                <div style={{ width: 52, height: 52, borderRadius: R.md, overflow: "hidden", flexShrink: 0, background: isDone ? "transparent" : C.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isDone
                    ? <img src={URL.createObjectURL(photos[step.id])} alt={step.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <Camera size={I.xl} color={C.iconColor} strokeWidth={1.8} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: S.xs, marginBottom: 3 }}>
                    <span style={{ fontSize: F.size.base, fontWeight: F.weight.bold, color: C.textPrimary }}>{step.label}</span>
                    {!step.required && <span style={{ fontSize: F.size.xxs, fontWeight: F.weight.semibold, color: C.textTertiary, background: C.iconBg, borderRadius: R.pill, padding: `1px 6px` }}>OPCIONAL</span>}
                  </div>
                  <span style={{ fontSize: F.size.sm, color: C.textSecondary, lineHeight: 1.4 }}>{step.instruction}</span>
                </div>
                {isDone ? (
                  <div style={{ display: "flex", alignItems: "center", gap: S.sm }}>
                    <button onClick={() => { setPhotos(prev => { const n = { ...prev }; delete n[step.id]; return n; }); inputRefs.current[step.id]?.click(); }}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: S.xs }}>
                      <RotateCcw size={I.sm} color={C.textTertiary} strokeWidth={2} />
                    </button>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Check size={I.xs} color="#fff" strokeWidth={3} />
                    </div>
                  </div>
                ) : (
                  <button onClick={() => inputRefs.current[step.id]?.click()}
                    style={{ display: "flex", alignItems: "center", gap: S.xs, background: C.accent, border: "none", borderRadius: R.pill, padding: `6px ${S.md}px`, cursor: "pointer", flexShrink: 0 }}>
                    <Camera size={I.xs} color={C.textInverse} strokeWidth={2} />
                    <span style={{ fontSize: F.size.xs, fontWeight: F.weight.bold, color: C.textInverse }}>Fotografar</span>
                  </button>
                )}
                <input ref={el => inputRefs.current[step.id] = el} type="file" accept="image/*" capture="environment" onChange={e => handleFile(step.id, e)} style={{ display: "none" }} />
              </div>
            </div>
          );
        })}
      </div>

      <Footer>
        {!canFinish && (
          <div style={{ display: "flex", alignItems: "center", gap: S.sm, marginBottom: S.sm }}>
            <AlertCircle size={I.sm} color={C.textTertiary} strokeWidth={2} />
            <span style={{ fontSize: F.size.xs, color: C.textTertiary }}>{required.length - doneRequired} foto{required.length - doneRequired !== 1 ? "s" : ""} obrigatória{required.length - doneRequired !== 1 ? "s" : ""} restante{required.length - doneRequired !== 1 ? "s" : ""}</span>
          </div>
        )}
        <PrimaryButton label="Finalizar vistoria" onPress={() => navigate("pending")} disabled={!canFinish} />
      </Footer>
    </div>
  );
}

function ScreenPending({ navigate }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", textAlign: "center", padding: S.xl }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: C.greenBg, border: `1.5px solid ${C.greenBorder}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: S.xl }}>
        <Check size={32} color={C.green} strokeWidth={2.5} />
      </div>
      <h2 style={{ fontSize: F.size.xxxl, fontWeight: F.weight.bold, color: C.textPrimary, letterSpacing: "-0.02em", marginBottom: S.sm }}>Solicitação enviada!</h2>
      <p style={{ fontSize: F.size.base, color: C.textSecondary, lineHeight: 1.6, marginBottom: S.xxxl, maxWidth: 300 }}>
        Seus documentos estão em análise. Você será notificado assim que o vínculo for confirmado.
      </p>
      <button onClick={() => navigate("home")}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: C.accent, border: "none", borderRadius: R.xxl, padding: `${S.lg}px`, cursor: "pointer" }}>
        <span style={{ fontSize: F.size.base, fontWeight: F.weight.bold, color: C.textInverse }}>Concluir</span>
      </button>
    </div>
  );
}

function ScreenHome({ navigate }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", textAlign: "center", padding: S.xl }}>
      <div style={{ width: 72, height: 72, borderRadius: R.xxl, background: C.iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: S.xl }}>
        <Car size={36} color={C.iconColor} strokeWidth={1.5} />
      </div>
      <h1 style={{ fontSize: F.size.hero, fontWeight: F.weight.bold, color: C.textPrimary, letterSpacing: "-0.02em", marginBottom: S.sm }}>Meus Veículos</h1>
      <p style={{ fontSize: F.size.base, color: C.textSecondary, lineHeight: 1.6, marginBottom: S.xxxl }}>Você ainda não tem veículos adicionados.</p>
      <button onClick={() => navigate("add_vehicle")}
        style={{ display: "flex", alignItems: "center", gap: S.sm, background: C.accent, border: "none", borderRadius: R.xxl, padding: `${S.lg}px ${S.xxl}px`, cursor: "pointer" }}>
        <span style={{ fontSize: F.size.base, fontWeight: F.weight.bold, color: C.textInverse }}>+ Adicionar veículo</span>
      </button>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function MobistoryFlow() {
  const [screen, setScreen] = useState("home");
  const [params, setParams] = useState({});
  const [manualDraft, setManualDraft] = useState({});

  const navigate = (to, p = {}) => { setScreen(to); setParams(p); };

  const props = { navigate, params, draft: manualDraft, setDraft: setManualDraft };

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: C.background, minHeight: "100vh", maxWidth: 430, margin: "0 auto", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button:focus { outline: none; }
        input:focus  { outline: none; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {screen === "home"            && <ScreenHome           {...props} />}
      {screen === "add_vehicle"     && <ScreenAddVehicle     {...props} />}
      {screen === "doc_upload"      && <ScreenDocUpload      {...props} />}
      {screen === "manual_brand"    && <ScreenManualBrand    {...props} />}
      {screen === "manual_model"    && <ScreenManualModel    {...props} />}
      {screen === "manual_version"  && <ScreenManualVersion  {...props} />}
      {screen === "manual_year"     && <ScreenManualYear     {...props} />}
      {screen === "manual_plate"    && <ScreenManualPlate    {...props} />}
      {screen === "manual_color"    && <ScreenManualColor    {...props} />}
      {screen === "manual_fuel"     && <ScreenManualFuel     {...props} />}
      {screen === "vehicle_confirm" && <ScreenVehicleConfirm {...props} />}
      {screen === "bond_type"       && <ScreenBondType       {...props} />}
      {screen === "bond_doc"        && <ScreenBondDoc        {...props} />}
      {screen === "inspection"      && <ScreenInspection     {...props} />}
      {screen === "pending"         && <ScreenPending        {...props} />}
    </div>
  );
}
