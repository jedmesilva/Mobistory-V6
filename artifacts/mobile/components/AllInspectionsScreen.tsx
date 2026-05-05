import React, { useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Platform, Share, Alert, TextInput,
} from "react-native";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { INSPECTION_STEPS, INSPECTION_MOTIVOS, CURRENT_USER } from "@/constants/data";
import { useInspections, type Inspection } from "@/contexts/InspectionsContext";
import { R, S, F, I, ActionButtonSquare, BackButton, SearchBar } from "@/components/shared";

const C = colors.light;

const FILTERS = [
  { id: "todas",                label: "Todas" },
  { id: "pendentes",            label: "Pendentes" },
  { id: "Rotina",               label: "Rotina" },
  { id: "Transferência",        label: "Transferência" },
  { id: "Abertura de sinistro", label: "Sinistro" },
  { id: "Manutenção",           label: "Manutenção" },
  { id: "Acidente",             label: "Acidente" },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Aprovada:  { bg: "#DCFCE7", text: "#16A34A" },
  Pendente:  { bg: "#FEF9C3", text: "#CA8A04" },
  Reprovada: { bg: "#FEF2F2", text: "#DC2626" },
};

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  Rotina:                 { bg: C.iconBg,   text: C.iconColor },
  "Transferência":        { bg: "#EFF6FF",  text: "#2563EB"   },
  "Abertura de sinistro": { bg: "#FFF7ED",  text: "#C2410C"   },
  "Manutenção":           { bg: "#F0FDF4",  text: "#16A34A"   },
  "Acidente":             { bg: "#FEF2F2",  text: "#DC2626"   },
  "Auditoria":            { bg: "#FDF4FF",  text: "#9333EA"   },
  "Outro":                { bg: C.iconBg,   text: C.iconColor },
};

const PART_LABELS: Record<string, string> = {
  frente:    "Frente",
  traseira:  "Traseira",
  lateral_e: "Lateral esquerda",
  lateral_d: "Lateral direita",
  painel:    "Painel",
  placa:     "Placa",
  chassi:    "Chassi físico",
};

function typeColor(type: string) {
  return TYPE_COLORS[type] ?? { bg: C.iconBg, text: C.iconColor };
}

function InspectionCard({ item, onPress }: { item: Inspection; onPress: () => void }) {
  const status = STATUS_COLORS[item.status] ?? STATUS_COLORS.Pendente;
  const typeCl = typeColor(item.type);
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{ backgroundColor: C.surface, borderRadius: R.xxl, padding: S.xl, marginBottom: S.md }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.md }}>
        <View style={{ backgroundColor: typeCl.bg, borderRadius: R.pill, paddingVertical: 3, paddingHorizontal: S.sm }}>
          <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: typeCl.text }}>{item.type}</Text>
        </View>
        <View style={{ backgroundColor: status.bg, borderRadius: R.pill, paddingVertical: 3, paddingHorizontal: S.sm }}>
          <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: status.text }}>{item.status}</Text>
        </View>
      </View>

      <Text style={{ fontSize: F.xl, fontWeight: "700" as const, color: C.textPrimary, marginBottom: S.xs }}>
        {item.completedAt ?? item.requestedAt}
      </Text>
      <Text style={{ fontSize: F.sm, color: C.textSecondary, marginBottom: S.lg }}>
        {item.completedTime ? `${item.completedTime} · ` : ""}{item.requester}
      </Text>

      <View style={{ height: 1, backgroundColor: C.border, marginBottom: S.md }} />

      <View style={{ flexDirection: "row", alignItems: "center", gap: S.sm }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: S.xs, flex: 1, minWidth: 0 }}>
          <Feather name="camera" size={I.sm} color={C.textTertiary} style={{ flexShrink: 0 }} />
          <Text numberOfLines={1} style={{ fontSize: F.sm, color: C.textSecondary, flexShrink: 1 }}>
            {item.parts.length}/{item.totalParts} {item.totalParts === 1 ? "parte" : "partes"} registradas
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: S.xs, flexShrink: 0 }}>
          {item.parts.slice(0, 2).map(p => (
            <View key={p} style={{ backgroundColor: C.background, borderRadius: R.sm, paddingVertical: 2, paddingHorizontal: S.xs }}>
              <Text style={{ fontSize: F.xxs, color: C.textTertiary, fontWeight: "500" as const }}>{PART_LABELS[p] ?? p}</Text>
            </View>
          ))}
          {item.parts.length > 2 && (
            <View style={{ backgroundColor: C.background, borderRadius: R.sm, paddingVertical: 2, paddingHorizontal: S.xs }}>
              <Text style={{ fontSize: F.xxs, color: C.textTertiary, fontWeight: "500" as const }}>+{item.parts.length - 2}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function PendingInspectionCard({ item, onPress, onStart }: { item: Inspection; onPress: () => void; onStart: (id: number) => void }) {
  const typeCl   = typeColor(item.type);
  const statusCl = STATUS_COLORS[item.status] ?? STATUS_COLORS.Pendente;
  const progress = item.totalParts > 0 ? item.parts.length / item.totalParts : 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{ backgroundColor: C.surface, borderRadius: R.xxl, padding: S.xl, marginBottom: S.md }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.md }}>
        <View style={{ backgroundColor: typeCl.bg, borderRadius: R.pill, paddingVertical: 3, paddingHorizontal: S.sm }}>
          <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: typeCl.text }}>{item.type}</Text>
        </View>
        <View style={{ backgroundColor: statusCl.bg, borderRadius: R.pill, paddingVertical: 3, paddingHorizontal: S.sm }}>
          <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: statusCl.text }}>{item.status}</Text>
        </View>
      </View>

      <Text style={{ fontSize: F.xl, fontWeight: "700" as const, color: C.textPrimary, marginBottom: S.xs }}>
        {item.requestedAt}
      </Text>
      <Text style={{ fontSize: F.sm, color: C.textSecondary, marginBottom: item.deadline ? S.xs : S.lg }}>
        {item.requester}
      </Text>
      {item.deadline ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: S.lg }}>
          <Feather name="clock" size={I.xs} color={C.textTertiary} />
          <Text style={{ fontSize: F.xs, color: C.textTertiary }}>{item.deadline}</Text>
        </View>
      ) : null}

      {item.parts.length > 0 && (
        <View style={{ marginBottom: S.md }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: S.xs }}>
            <Text style={{ fontSize: F.xs, color: C.textTertiary }}>Progresso</Text>
            <Text style={{ fontSize: F.xs, color: C.textTertiary }}>{item.parts.length}/{item.totalParts} partes</Text>
          </View>
          <View style={{ height: 3, backgroundColor: C.border, borderRadius: R.pill, overflow: "hidden" }}>
            <View style={{ height: 3, width: `${progress * 100}%`, backgroundColor: C.textPrimary, borderRadius: R.pill }} />
          </View>
        </View>
      )}

      <View style={{ height: 1, backgroundColor: C.border, marginBottom: S.md }} />

      <TouchableOpacity
        onPress={(e) => { e.stopPropagation?.(); onStart(item.id); }}
        activeOpacity={0.85}
        style={{
          flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S.sm,
          backgroundColor: C.textPrimary, borderRadius: R.xl, paddingVertical: S.md,
        }}
      >
        <Feather name="camera" size={I.md} color={C.surface} />
        <Text style={{ fontSize: F.sm, fontWeight: "700" as const, color: C.surface }}>
          {item.parts.length > 0 ? "Continuar vistoria" : "Iniciar vistoria"}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const renderBackdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
);

function InspectionDetailSheet({
  sheetRef,
  item,
  onStart,
}: {
  sheetRef: React.RefObject<BottomSheetModal | null>;
  item: Inspection | null;
  onStart: (id: number) => void;
}) {
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  if (!item) return null;

  const typeCl   = typeColor(item.type);
  const statusCl = STATUS_COLORS[item.status] ?? STATUS_COLORS.Pendente;
  const isPending = item.status === "Pendente";

  const allParts = (item.plannedParts ?? INSPECTION_STEPS.map(s => s.id)).map(id => ({
    id,
    label: PART_LABELS[id] ?? id,
    done: item.parts.includes(id),
  }));

  function Row({ label, value }: { label: string; value: string }) {
    return (
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: S.sm }}>
        <Text style={{ fontSize: F.sm, color: C.textTertiary }}>{label}</Text>
        <Text style={{ fontSize: F.sm, fontWeight: "500" as const, color: C.textPrimary }}>{value}</Text>
      </View>
    );
  }

  return (
    <BottomSheetModal ref={sheetRef} enablePanDownToClose backdropComponent={renderBackdrop}>
      <BottomSheetScrollView contentContainerStyle={{ paddingBottom: bottomPad + S.xl }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: S.xl, paddingTop: S.sm, paddingBottom: S.lg }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: S.sm }}>
            <View style={{ backgroundColor: typeCl.bg, borderRadius: R.pill, paddingVertical: 3, paddingHorizontal: S.sm }}>
              <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: typeCl.text }}>{item.type}</Text>
            </View>
            <View style={{ backgroundColor: statusCl.bg, borderRadius: R.pill, paddingVertical: 3, paddingHorizontal: S.sm }}>
              <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: statusCl.text }}>{item.status}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => sheetRef.current?.dismiss()} activeOpacity={0.7} style={{ padding: S.xs }}>
            <Feather name="x" size={I.md} color={C.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Descrição */}
        {item.descricao ? (
          <View style={{ paddingHorizontal: S.xl, marginBottom: S.lg }}>
            <Text style={{ fontSize: F.base, color: C.textSecondary, lineHeight: 22 }}>{item.descricao}</Text>
          </View>
        ) : null}

        {/* Solicitação */}
        <View style={{ backgroundColor: C.surface, borderRadius: R.xxl, marginHorizontal: S.xl, padding: S.lg, marginBottom: S.md }}>
          <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: S.xs }}>
            Solicitação
          </Text>
          <Row label="Solicitante" value={item.requester} />
          <Row label="Data de solicitação" value={item.requestedAt} />
          {item.deadline ? <Row label="Prazo" value={item.deadline} /> : null}
        </View>

        {/* Realização */}
        {!isPending && item.completedAt ? (
          <View style={{ backgroundColor: C.surface, borderRadius: R.xxl, marginHorizontal: S.xl, padding: S.lg, marginBottom: S.md }}>
            <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: S.xs }}>
              Realização
            </Text>
            <Row label="Data de realização" value={item.completedAt} />
            {item.completedTime ? <Row label="Horário" value={item.completedTime} /> : null}
            {item.km && item.km !== "—" ? <Row label="KM no ato" value={item.km} /> : null}
          </View>
        ) : null}

        {/* Partes */}
        <View style={{ backgroundColor: C.surface, borderRadius: R.xxl, marginHorizontal: S.xl, padding: S.lg, marginBottom: S.lg }}>
          <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: S.xs }}>
            Partes do veículo
          </Text>
          {allParts.map((p, idx) => (
            <View
              key={p.id}
              style={{
                flexDirection: "row", alignItems: "center", gap: S.sm,
                paddingVertical: S.sm,
                borderTopWidth: idx === 0 ? 0 : 1, borderTopColor: C.border,
              }}
            >
              <View style={{
                width: 22, height: 22, borderRadius: 11,
                backgroundColor: p.done ? "#DCFCE7" : C.background,
                alignItems: "center", justifyContent: "center",
              }}>
                <Feather name={p.done ? "check" : "clock"} size={12} color={p.done ? "#16A34A" : C.textTertiary} />
              </View>
              <Text style={{ fontSize: F.sm, color: p.done ? C.textPrimary : C.textTertiary, fontWeight: p.done ? "500" as const : "400" as const }}>
                {p.label}
              </Text>
            </View>
          ))}
        </View>

        {/* CTA — só pendentes */}
        {isPending && (
          <TouchableOpacity
            onPress={() => { sheetRef.current?.dismiss(); onStart(item.id); }}
            activeOpacity={0.85}
            style={{
              marginHorizontal: S.xl,
              backgroundColor: C.textPrimary, borderRadius: R.xxl,
              paddingVertical: S.lg, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S.sm,
            }}
          >
            <Feather name="camera" size={I.lg} color={C.surface} />
            <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: C.surface }}>
              {item.parts.length > 0 ? "Continuar vistoria" : "Iniciar vistoria"}
            </Text>
          </TouchableOpacity>
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

type MotivoItem = typeof INSPECTION_MOTIVOS[number];

function NewInspectionSheet({
  sheetRef,
  onConfirm,
}: {
  sheetRef: React.RefObject<BottomSheetModal | null>;
  onConfirm: (parts: string[], motivo: string, descricao: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [selected, setSelected] = useState<string[]>(
    INSPECTION_STEPS.filter(s => s.required).map(s => s.id)
  );
  const [motivo, setMotivo] = useState<MotivoItem | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [customMotivo, setCustomMotivo] = useState("");

  const isOutro = motivo?.id === "outro";
  const canConfirm = selected.length > 0 && motivo !== null && (isOutro ? customMotivo.trim().length > 0 : true);

  const handleSelectMotivo = (m: MotivoItem) => {
    setMotivo(m);
    setShowDropdown(false);
    if (m.id !== "outro") {
      setDescricao(m.desc);
      setCustomMotivo("");
    } else {
      setDescricao("");
    }
  };

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleStart = () => {
    if (selected.length === 0) {
      Alert.alert("Selecione ao menos uma parte", "Escolha pelo menos uma parte do veículo para vistoriar.");
      return;
    }
    if (!motivo) {
      Alert.alert("Selecione um motivo", "Escolha o motivo da vistoria antes de continuar.");
      return;
    }
    if (isOutro && customMotivo.trim().length === 0) {
      Alert.alert("Informe o motivo", "Descreva brevemente o motivo da vistoria.");
      return;
    }
    const motivoLabel = isOutro ? customMotivo.trim() : motivo.label;
    sheetRef.current?.dismiss();
    onConfirm(selected, motivoLabel, descricao.trim());
    setSelected(INSPECTION_STEPS.filter(s => s.required).map(s => s.id));
    setMotivo(null);
    setShowDropdown(false);
    setDescricao("");
    setCustomMotivo("");
  };

  return (
    <BottomSheetModal ref={sheetRef} enablePanDownToClose backdropComponent={renderBackdrop}>
      <BottomSheetScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: bottomPad + S.xl }}
      >
        {/* Título */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: S.xl, paddingTop: S.sm, paddingBottom: S.lg }}>
          <Text style={{ fontSize: F.xxl, fontWeight: "700" as const, color: C.textPrimary }}>Solicitar vistoria</Text>
          <TouchableOpacity onPress={() => sheetRef.current?.dismiss()} activeOpacity={0.7} style={{ padding: S.xs }}>
            <Feather name="x" size={I.md} color={C.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* SOLICITANTE — read-only */}
        <View style={{ paddingHorizontal: S.xl, marginBottom: S.lg }}>
          <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: S.sm }}>
            Solicitante
          </Text>
          <View style={{
            flexDirection: "row", alignItems: "center", gap: S.sm,
            backgroundColor: C.background, borderRadius: R.xl,
            paddingVertical: S.md, paddingHorizontal: S.lg,
          }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.iconBg, alignItems: "center", justifyContent: "center" }}>
              <Feather name="user" size={I.sm} color={C.iconColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary }}>{CURRENT_USER.name}</Text>
              <Text style={{ fontSize: F.xs, color: C.textTertiary }}>{CURRENT_USER.bond}</Text>
            </View>
            <Feather name="lock" size={I.sm} color={C.textTertiary} />
          </View>
        </View>

        {/* MOTIVO — dropdown */}
        <View style={{ paddingHorizontal: S.xl, marginBottom: S.lg }}>
          <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: S.sm }}>
            Motivo
          </Text>

          <TouchableOpacity
            onPress={() => setShowDropdown(v => !v)}
            activeOpacity={0.7}
            style={{
              flexDirection: "row", alignItems: "center", justifyContent: "space-between",
              backgroundColor: C.background, borderRadius: R.xl,
              paddingVertical: S.md, paddingHorizontal: S.lg,
            }}
          >
            {motivo ? (
              <View style={{ flex: 1, marginRight: S.sm }}>
                <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary }}>{motivo.label}</Text>
                {motivo.desc ? (
                  <Text style={{ fontSize: F.xs, color: C.textTertiary, marginTop: 2 }}>{motivo.desc}</Text>
                ) : (
                  <Text style={{ fontSize: F.xs, color: C.textTertiary, marginTop: 2, fontStyle: "italic" as const }}>Informe abaixo</Text>
                )}
              </View>
            ) : (
              <Text style={{ flex: 1, fontSize: F.base, color: C.textTertiary }}>Selecione um motivo…</Text>
            )}
            <Feather name={showDropdown ? "chevron-up" : "chevron-down"} size={I.md} color={C.textTertiary} />
          </TouchableOpacity>

          {showDropdown && (
            <View style={{ marginTop: S.xs, backgroundColor: C.background, borderRadius: R.xl, overflow: "hidden" }}>
              {INSPECTION_MOTIVOS.map((m) => {
                const isSelected = motivo?.id === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => handleSelectMotivo(m)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: "row", alignItems: "center",
                      paddingVertical: S.md, paddingHorizontal: S.lg,
                      marginBottom: 2,
                      backgroundColor: isSelected ? C.iconBg : "transparent",
                      borderRadius: R.lg,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: F.base, fontWeight: isSelected ? "600" as const : "400" as const, color: C.textPrimary }}>{m.label}</Text>
                      {m.desc ? (
                        <Text style={{ fontSize: F.xs, color: C.textTertiary, marginTop: 2 }}>{m.desc}</Text>
                      ) : (
                        <Text style={{ fontSize: F.xs, color: C.textTertiary, marginTop: 2, fontStyle: "italic" as const }}>Informe abaixo</Text>
                      )}
                    </View>
                    {isSelected && <Feather name="check" size={I.md} color={C.textPrimary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* MOTIVO PERSONALIZADO — só para "Outro" */}
        {isOutro && (
          <View style={{ paddingHorizontal: S.xl, marginBottom: S.lg }}>
            <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: S.sm }}>
              Nome do motivo
            </Text>
            <TextInput
              value={customMotivo}
              onChangeText={setCustomMotivo}
              placeholder="Ex: Revisão pré-viagem…"
              placeholderTextColor={C.textTertiary}
              style={{
                backgroundColor: C.background, borderRadius: R.xl,
                paddingVertical: S.md, paddingHorizontal: S.lg,
                fontSize: F.base, color: C.textPrimary,
              }}
            />
          </View>
        )}

        {/* DESCRIÇÃO — campo livre só para "Outro" */}
        {isOutro ? (
          <View style={{ paddingHorizontal: S.xl, marginBottom: S.lg }}>
            <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: S.sm }}>
              Descrição
            </Text>
            <TextInput
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Descreva o contexto da vistoria…"
              placeholderTextColor={C.textTertiary}
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: C.background, borderRadius: R.xl,
                paddingVertical: S.md, paddingHorizontal: S.lg,
                fontSize: F.base, color: C.textPrimary,
                minHeight: 80, textAlignVertical: "top" as const,
              }}
            />
          </View>
        ) : null}

        {/* PARTES DO VEÍCULO */}
        <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const, paddingHorizontal: S.xl, marginBottom: S.sm }}>
          Partes do veículo
        </Text>

        {INSPECTION_STEPS.map((step, idx) => {
          const isChecked = selected.includes(step.id);
          const isLast = idx === INSPECTION_STEPS.length - 1;
          return (
            <TouchableOpacity
              key={step.id}
              onPress={() => toggle(step.id)}
              activeOpacity={0.7}
              style={{
                flexDirection: "row", alignItems: "center",
                paddingVertical: S.md, paddingHorizontal: S.xl,
                borderBottomWidth: isLast ? 0 : 1, borderBottomColor: C.border,
              }}
            >
              <View style={{
                width: 22, height: 22, borderRadius: 6,
                borderWidth: isChecked ? 0 : 2, borderColor: C.border,
                backgroundColor: isChecked ? C.textPrimary : "transparent",
                alignItems: "center", justifyContent: "center", marginRight: S.md,
              }}>
                {isChecked && <Feather name="check" size={13} color={C.surface} />}
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: S.xs }}>
                  <Text style={{ fontSize: F.base, fontWeight: "500" as const, color: C.textPrimary }}>{step.label}</Text>
                  {step.required && (
                    <View style={{ backgroundColor: "#EFF6FF", borderRadius: R.pill, paddingVertical: 1, paddingHorizontal: S.xs }}>
                      <Text style={{ fontSize: F.xxs, fontWeight: "600" as const, color: "#2563EB" }}>Obrigatório</Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: F.xs, color: C.textTertiary, marginTop: 2 }}>{step.instruction}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          onPress={handleStart}
          activeOpacity={canConfirm ? 0.85 : 1}
          style={{
            marginHorizontal: S.xl, marginTop: S.xl,
            backgroundColor: canConfirm ? C.textPrimary : C.border,
            borderRadius: R.xxl, paddingVertical: S.lg,
            flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S.sm,
          }}
        >
          <Feather name="camera" size={I.lg} color={canConfirm ? C.surface : C.textTertiary} />
          <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: canConfirm ? C.surface : C.textTertiary }}>
            Solicitar vistoria · {selected.length} {selected.length === 1 ? "parte" : "partes"}
          </Text>
        </TouchableOpacity>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

export default function AllInspectionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("todas");
  const [selectedItem, setSelectedItem] = useState<Inspection | null>(null);
  const newInspectionRef = useRef<BottomSheetModal>(null);
  const detailSheetRef   = useRef<BottomSheetModal>(null);
  const { inspections, addInspection } = useInspections();

  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const openDetail = (item: Inspection) => {
    setSelectedItem(item);
    detailSheetRef.current?.present();
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: `Histórico de vistorias — ${inspections.length} registros` });
    } catch (_) {}
  };

  const handleExport = () => {
    Alert.alert("Exportar", "Escolha o formato de exportação", [
      { text: "CSV", onPress: () => {} },
      { text: "PDF", onPress: () => {} },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const handleStats = () => {
    Alert.alert(
      "Estatísticas",
      `Total: ${inspections.length} vistorias\nAprovadas: ${inspections.filter(i => i.status === "Aprovada").length}\nMédia de partes: ${Math.round(inspections.reduce((a, b) => a + b.totalParts, 0) / inspections.length)}/vistoria`,
    );
  };

  const handleConfirmNew = (parts: string[], motivo: string, descricao: string) => {
    const newId = addInspection(parts, motivo, descricao);
    router.navigate(`/inspection-run?id=${newId}`);
  };

  const matchesQuery = (item: Inspection) =>
    query === "" ||
    item.requestedAt.toLowerCase().includes(query.toLowerCase()) ||
    item.type.toLowerCase().includes(query.toLowerCase()) ||
    item.requester.toLowerCase().includes(query.toLowerCase());

  const pendingItems = inspections.filter(item => {
    const isPending = item.status === "Pendente";
    const matchFilter = filter === "todas" || filter === "pendentes" || item.type === filter;
    return isPending && matchFilter && matchesQuery(item);
  });

  const historyItems = inspections.filter(item => {
    const isDone = item.status !== "Pendente";
    const matchFilter = filter === "todas" || (filter !== "pendentes" && item.type === filter);
    return isDone && matchFilter && matchesQuery(item);
  });

  const totalFiltered = pendingItems.length + historyItems.length;

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: C.background }}
        contentContainerStyle={{ paddingTop: topPad + S.lg, paddingBottom: bottomPad + S.xxxl }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: S.xl }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <BackButton onPress={() => router.back()} />
            <View style={{ flexDirection: "row", alignItems: "center", gap: S.xs }}>
              <TouchableOpacity onPress={handleShare} activeOpacity={0.7} style={{ padding: S.xs }}>
                <Feather name="share-2" size={I.xxl} color={C.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleExport} activeOpacity={0.7} style={{ padding: S.xs }}>
                <Feather name="download" size={I.xxl} color={C.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ marginBottom: S.xxl }}>
            <Text style={{ fontSize: F.hero, fontWeight: "700" as const, color: C.textPrimary, letterSpacing: -0.5 }}>Vistorias</Text>
          </View>

          <View style={{ flexDirection: "row", gap: S.sm, marginBottom: S.xxl, width: "66%" }}>
            <ActionButtonSquare iconName="camera" label="Solicitar vistoria" onPress={() => newInspectionRef.current?.present()} />
            <ActionButtonSquare iconName="bar-chart-2" label="Estatísticas" onPress={handleStats} />
          </View>

          <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const }}>
            Histórico de vistorias
          </Text>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar por data, motivo, solicitante…" style={{ marginTop: S.md, marginBottom: S.sm }} />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ paddingHorizontal: S.xl, paddingVertical: S.md, gap: S.sm }}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.id}
              onPress={() => setFilter(f.id)}
              activeOpacity={0.7}
              style={{
                paddingVertical: 6, paddingHorizontal: S.lg,
                borderRadius: R.pill,
                backgroundColor: filter === f.id ? C.textPrimary : C.surface,
                marginRight: S.sm,
              }}
            >
              <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: filter === f.id ? C.surface : C.textSecondary }}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: S.xl, paddingTop: S.xs }}>
          {totalFiltered === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: S.xxxl, gap: S.sm }}>
              <Feather name="search" size={I.xxxl} color={C.textTertiary} />
              <Text style={{ fontSize: F.sm, color: C.textTertiary }}>Nenhuma vistoria encontrada</Text>
            </View>
          ) : (
            <>
              {pendingItems.length > 0 && (
                <View style={{ marginBottom: S.xs }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.sm }}>
                    <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const }}>
                      Pendentes
                    </Text>
                    <View style={{ backgroundColor: "#FEF9C3", borderRadius: R.pill, paddingVertical: 2, paddingHorizontal: S.sm }}>
                      <Text style={{ fontSize: F.xxs, fontWeight: "700" as const, color: "#B45309" }}>{pendingItems.length}</Text>
                    </View>
                  </View>
                  {pendingItems.map(item => (
                    <PendingInspectionCard
                      key={item.id}
                      item={item}
                      onPress={() => openDetail(item)}
                      onStart={(id) => router.navigate(`/inspection-run?id=${id}`)}
                    />
                  ))}
                </View>
              )}

              {historyItems.length > 0 && filter !== "pendentes" && (
                <View>
                  {pendingItems.length > 0 && (
                    <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: S.sm, marginTop: S.sm }}>
                      Histórico
                    </Text>
                  )}
                  {historyItems.map(item => (
                    <InspectionCard key={item.id} item={item} onPress={() => openDetail(item)} />
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <NewInspectionSheet sheetRef={newInspectionRef} onConfirm={handleConfirmNew} />
      <InspectionDetailSheet
        sheetRef={detailSheetRef}
        item={selectedItem}
        onStart={(id) => router.navigate(`/inspection-run?id=${id}`)}
      />
    </>
  );
}
