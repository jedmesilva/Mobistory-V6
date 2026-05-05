import React, { useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Platform, Share, Alert,
} from "react-native";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { INSPECTION_STEPS } from "@/constants/data";
import { useInspections } from "@/contexts/InspectionsContext";
import { R, S, F, I, ActionButtonSquare, BackButton, SearchBar } from "@/components/shared";

const C = colors.light;

const FILTERS = [
  { id: "todas", label: "Todas" },
  { id: "pendentes", label: "Pendentes" },
  { id: "Rotina", label: "Rotina" },
  { id: "Transferência", label: "Transferência" },
  { id: "Solicitada", label: "Solicitada" },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Aprovada:  { bg: "#DCFCE7", text: "#16A34A" },
  Pendente:  { bg: "#FEF9C3", text: "#CA8A04" },
  Reprovada: { bg: "#FEF2F2", text: "#DC2626" },
};

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  Rotina:       { bg: C.iconBg,   text: C.iconColor },
  Transferência:{ bg: "#EFF6FF",  text: "#2563EB"   },
  Solicitada:   { bg: "#FDF4FF",  text: "#9333EA"   },
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

function InspectionCard({ item }: { item: ReturnType<typeof useInspections>["inspections"][number] }) {
  const status = STATUS_COLORS[item.status] ?? STATUS_COLORS.Pendente;
  const typeCl = TYPE_COLORS[item.type]     ?? TYPE_COLORS.Rotina;
  return (
    <View style={{ backgroundColor: C.surface, borderRadius: R.xxl, padding: S.xl, marginBottom: S.md }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.md }}>
        <View style={{ backgroundColor: typeCl.bg, borderRadius: R.pill, paddingVertical: 3, paddingHorizontal: S.sm }}>
          <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: typeCl.text }}>{item.type}</Text>
        </View>
        <View style={{ backgroundColor: status.bg, borderRadius: R.pill, paddingVertical: 3, paddingHorizontal: S.sm }}>
          <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: status.text }}>{item.status}</Text>
        </View>
      </View>

      <Text style={{ fontSize: F.xl, fontWeight: "700" as const, color: C.textPrimary, marginBottom: S.xs }}>
        {item.date}
      </Text>
      <Text style={{ fontSize: F.sm, color: C.textSecondary, marginBottom: S.lg }}>
        {item.time} · {item.km} · {item.requester}
      </Text>

      <View style={{ height: 1, backgroundColor: C.border, marginBottom: S.md }} />

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: S.xs }}>
          <Feather name="camera" size={I.sm} color={C.textTertiary} />
          <Text style={{ fontSize: F.sm, color: C.textSecondary }}>
            {item.parts.length}/{item.totalParts} {item.totalParts === 1 ? "parte" : "partes"} registradas
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: S.xs }}>
          {item.parts.slice(0, 3).map(p => (
            <View key={p} style={{ backgroundColor: C.background, borderRadius: R.sm, paddingVertical: 2, paddingHorizontal: S.xs }}>
              <Text style={{ fontSize: F.xxs, color: C.textTertiary, fontWeight: "500" as const }}>{PART_LABELS[p] ?? p}</Text>
            </View>
          ))}
          {item.parts.length > 3 && (
            <View style={{ backgroundColor: C.background, borderRadius: R.sm, paddingVertical: 2, paddingHorizontal: S.xs }}>
              <Text style={{ fontSize: F.xxs, color: C.textTertiary, fontWeight: "500" as const }}>+{item.parts.length - 3}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

function PendingInspectionCard({
  item,
  onStart,
}: {
  item: ReturnType<typeof useInspections>["inspections"][number];
  onStart: (id: number) => void;
}) {
  const typeCl  = TYPE_COLORS[item.type] ?? TYPE_COLORS.Rotina;
  const isOverdue = item.deadline === "Vencida";
  const accentBg  = isOverdue ? "#FEF2F2" : "#FFFBEB";
  const accentBorder = isOverdue ? "#FCA5A5" : "#FCD34D";
  const accentText   = isOverdue ? "#DC2626" : "#B45309";
  const progress = item.totalParts > 0 ? item.parts.length / item.totalParts : 0;

  return (
    <View style={{
      backgroundColor: accentBg,
      borderRadius: R.xxl,
      padding: S.xl,
      marginBottom: S.md,
      borderWidth: 1.5,
      borderColor: accentBorder,
    }}>
      {/* TOP ROW */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.sm }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: S.xs }}>
          <View style={{ backgroundColor: typeCl.bg, borderRadius: R.pill, paddingVertical: 3, paddingHorizontal: S.sm }}>
            <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: typeCl.text }}>{item.type}</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: S.xs }}>
          <Feather name="clock" size={I.xs} color={accentText} />
          <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: accentText }}>{item.deadline}</Text>
        </View>
      </View>

      {/* INFO */}
      <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: C.textPrimary, marginBottom: 2 }}>
        Solicitado por {item.requester}
      </Text>
      <Text style={{ fontSize: F.sm, color: C.textSecondary, marginBottom: S.lg }}>
        {item.km} · Solicitada em {item.date}
      </Text>

      {/* PROGRESS BAR */}
      {item.parts.length > 0 && (
        <View style={{ marginBottom: S.md }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.xs }}>
            <Text style={{ fontSize: F.xs, color: C.textTertiary }}>Progresso</Text>
            <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textSecondary }}>
              {item.parts.length}/{item.totalParts} partes
            </Text>
          </View>
          <View style={{ height: 4, backgroundColor: C.border, borderRadius: R.pill, overflow: "hidden" }}>
            <View style={{ height: 4, width: `${progress * 100}%`, backgroundColor: accentText, borderRadius: R.pill }} />
          </View>
        </View>
      )}

      <View style={{ height: 1, backgroundColor: accentBorder, marginBottom: S.md }} />

      {/* CTA */}
      <TouchableOpacity
        onPress={() => onStart(item.id)}
        activeOpacity={0.85}
        style={{
          flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S.sm,
          backgroundColor: C.textPrimary, borderRadius: R.xl,
          paddingVertical: S.md,
        }}
      >
        <Feather name="camera" size={I.md} color={C.surface} />
        <Text style={{ fontSize: F.sm, fontWeight: "700" as const, color: C.surface }}>
          {item.parts.length > 0 ? "Continuar vistoria" : "Iniciar vistoria"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const renderBackdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
);

const INSPECTION_TYPES = ["Rotina", "Solicitada", "Transferência"] as const;

function NewInspectionSheet({
  sheetRef,
  onConfirm,
}: {
  sheetRef: React.RefObject<BottomSheetModal | null>;
  onConfirm: (parts: string[], type: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const [selected, setSelected] = useState<string[]>(
    INSPECTION_STEPS.filter(s => s.required).map(s => s.id)
  );
  const [inspType, setInspType] = useState<string>("Rotina");

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleStart = () => {
    if (selected.length === 0) {
      Alert.alert("Selecione ao menos uma parte", "Escolha pelo menos uma parte do veículo para vistoriar.");
      return;
    }
    sheetRef.current?.dismiss();
    onConfirm(selected, inspType);
    setSelected(INSPECTION_STEPS.filter(s => s.required).map(s => s.id));
    setInspType("Rotina");
  };

  return (
    <BottomSheetModal ref={sheetRef} enablePanDownToClose backdropComponent={renderBackdrop}>
      <BottomSheetScrollView contentContainerStyle={{ paddingBottom: bottomPad + S.xl }}>
        {/* Título */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: S.xl, paddingTop: S.sm, paddingBottom: S.md }}>
          <Text style={{ fontSize: F.xxl, fontWeight: "700" as const, color: C.textPrimary }}>Nova vistoria</Text>
          <TouchableOpacity onPress={() => sheetRef.current?.dismiss()} activeOpacity={0.7} style={{ padding: S.xs }}>
            <Feather name="x" size={I.md} color={C.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* TIPO */}
        <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const, paddingHorizontal: S.xl, marginBottom: S.sm }}>
          Tipo de vistoria
        </Text>
        <View style={{ flexDirection: "row", paddingHorizontal: S.xl, gap: S.sm, marginBottom: S.lg }}>
          {INSPECTION_TYPES.map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setInspType(t)}
              activeOpacity={0.7}
              style={{
                paddingVertical: 6, paddingHorizontal: S.lg,
                borderRadius: R.pill,
                backgroundColor: inspType === t ? C.textPrimary : C.surface,
                borderWidth: 1,
                borderColor: inspType === t ? C.textPrimary : C.border,
              }}
            >
              <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: inspType === t ? C.surface : C.textSecondary }}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const, paddingHorizontal: S.xl, marginBottom: S.sm }}>
          Partes do veículo
        </Text>

        {INSPECTION_STEPS.map((step, idx) => {
          const isSelected = selected.includes(step.id);
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
                borderWidth: isSelected ? 0 : 2, borderColor: C.border,
                backgroundColor: isSelected ? C.textPrimary : "transparent",
                alignItems: "center", justifyContent: "center", marginRight: S.md,
              }}>
                {isSelected && <Feather name="check" size={13} color={C.surface} />}
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
          activeOpacity={0.85}
          style={{
            marginHorizontal: S.xl, marginTop: S.xl,
            backgroundColor: C.textPrimary, borderRadius: R.xxl,
            paddingVertical: S.lg, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S.sm,
          }}
        >
          <Feather name="camera" size={I.lg} color={C.surface} />
          <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: C.surface }}>
            Criar vistoria pendente · {selected.length} {selected.length === 1 ? "parte" : "partes"}
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
  const newInspectionRef = useRef<BottomSheetModal>(null);
  const { inspections, addInspection } = useInspections();

  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

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

  const handleConfirmNew = (parts: string[], type: string) => {
    const newId = addInspection(parts, type);
    router.navigate(`/inspection-run?id=${newId}`);
  };

  const matchesQuery = (item: typeof inspections[number]) =>
    query === "" ||
    item.date.toLowerCase().includes(query.toLowerCase()) ||
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
        {/* BACK + SHARE/EXPORT */}
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

          {/* TITLE */}
          <View style={{ marginBottom: S.xxl }}>
            <Text style={{ fontSize: F.hero, fontWeight: "700" as const, color: C.textPrimary, letterSpacing: -0.5 }}>Vistorias</Text>
          </View>

          {/* ACTION BUTTONS */}
          <View style={{ flexDirection: "row", gap: S.sm, marginBottom: S.xxl, width: "66%" }}>
            <ActionButtonSquare iconName="camera" label="Nova vistoria" onPress={() => newInspectionRef.current?.present()} />
            <ActionButtonSquare iconName="bar-chart-2" label="Estatísticas" onPress={handleStats} />
          </View>

          {/* LABEL + BUSCA */}
          <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const }}>
            Histórico de vistorias
          </Text>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar por data, tipo, solicitante…" style={{ marginTop: S.md, marginBottom: S.sm }} />
        </View>

        {/* FILTROS */}
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

        {/* LISTA */}
        <View style={{ paddingHorizontal: S.xl, paddingTop: S.xs }}>
          {totalFiltered === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: S.xxxl, gap: S.sm }}>
              <Feather name="search" size={I.xxxl} color={C.textTertiary} />
              <Text style={{ fontSize: F.sm, color: C.textTertiary }}>Nenhuma vistoria encontrada</Text>
            </View>
          ) : (
            <>
              {/* PENDENTES */}
              {pendingItems.length > 0 && (
                <View style={{ marginBottom: S.xs }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.sm }}>
                    <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const }}>
                      Pendentes
                    </Text>
                    <View style={{ backgroundColor: "#FEF9C3", borderRadius: R.pill, paddingVertical: 2, paddingHorizontal: S.sm }}>
                      <Text style={{ fontSize: F.xxs, fontWeight: "700" as const, color: "#B45309" }}>
                        {pendingItems.length}
                      </Text>
                    </View>
                  </View>
                  {pendingItems.map(item => (
                    <PendingInspectionCard
                      key={item.id}
                      item={item}
                      onStart={(id) => router.navigate(`/inspection-run?id=${id}`)}
                    />
                  ))}
                </View>
              )}

              {/* HISTÓRICO */}
              {historyItems.length > 0 && filter !== "pendentes" && (
                <View>
                  {pendingItems.length > 0 && (
                    <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: S.sm, marginTop: S.sm }}>
                      Histórico
                    </Text>
                  )}
                  {historyItems.map(item => <InspectionCard key={item.id} item={item} />)}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <NewInspectionSheet sheetRef={newInspectionRef} onConfirm={handleConfirmNew} />
    </>
  );
}
