import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Platform, Share, Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { ALL_IDENTITY_HISTORY, VEHICLE, IDENTITY } from "@/constants/data";
import { R, S, F, I, BackButton } from "@/components/shared";

const C = colors.light;

const FILTERS = [
  { id: "todos",     label: "Todos"      },
  { id: "aprovacao", label: "Aprovação"  },
  { id: "vistoria",  label: "Vistoria"   },
  { id: "atualizacao",label: "Atualização"},
  { id: "emissao",   label: "Emissão"    },
];

const TYPE_ICON: Record<string, React.ComponentProps<typeof Feather>["name"]> = {
  aprovacao:   "check-circle",
  vistoria:    "camera",
  atualizacao: "edit-2",
  emissao:     "file-text",
};

const TYPE_COLORS: Record<string, { bg: string; icon: string }> = {
  aprovacao:    { bg: "#DCFCE7", icon: "#16A34A" },
  vistoria:     { bg: "#EFF6FF", icon: "#2563EB" },
  atualizacao:  { bg: "#FFF7ED", icon: "#EA580C" },
  emissao:      { bg: C.iconBg,  icon: C.iconColor },
};

function HistoryCard({ item, isLast }: { item: typeof ALL_IDENTITY_HISTORY[number]; isLast: boolean }) {
  const colors = TYPE_COLORS[item.type] ?? TYPE_COLORS.emissao;
  const icon   = TYPE_ICON[item.type]   ?? "activity";

  return (
    <View style={{ flexDirection: "row", paddingBottom: isLast ? 0 : S.xl }}>
      {/* Timeline line + icon */}
      <View style={{ alignItems: "center", width: 40, marginRight: S.md }}>
        <View style={{
          width: 36, height: 36, borderRadius: 18,
          backgroundColor: colors.bg, alignItems: "center", justifyContent: "center",
        }}>
          <Feather name={icon} size={I.lg} color={colors.icon} />
        </View>
        {!isLast && (
          <View style={{ flex: 1, width: 1.5, backgroundColor: C.border, marginTop: S.xs }} />
        )}
      </View>

      {/* Content */}
      <View style={{ flex: 1, paddingBottom: isLast ? 0 : S.xs }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: S.xs }}>
          <View style={{ flex: 1, marginRight: S.sm }}>
            <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary }}>{item.typeLabel}</Text>
            <Text style={{ fontSize: F.sm, color: C.textSecondary, marginTop: 2 }}>{item.desc}</Text>
          </View>
          <View style={{ backgroundColor: C.surface, borderRadius: R.md, paddingVertical: 2, paddingHorizontal: S.xs }}>
            <Text style={{ fontSize: F.xxs, fontWeight: "600" as const, color: C.textTertiary }}>v{item.version}</Text>
          </View>
        </View>
        <Text style={{ fontSize: F.xs, color: C.textTertiary }}>{item.date} · {item.time}</Text>
      </View>
    </View>
  );
}

export default function AllIdentityScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const [filter, setFilter] = useState("todos");

  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleShare = async () => {
    try {
      await Share.share({ message: `Histórico da identidade ${IDENTITY.id} — ${ALL_IDENTITY_HISTORY.length} eventos · ${VEHICLE.name} · ${VEHICLE.plate}` });
    } catch (_) {}
  };

  const handleExport = () => {
    Alert.alert("Exportar", "Escolha o formato de exportação", [
      { text: "CSV", onPress: () => {} },
      { text: "PDF", onPress: () => {} },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const filtered = filter === "todos"
    ? ALL_IDENTITY_HISTORY
    : ALL_IDENTITY_HISTORY.filter(item => item.type === filter);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.background }}
      contentContainerStyle={{ paddingTop: topPad + S.lg, paddingBottom: bottomPad + S.xxxl, paddingHorizontal: S.xl }}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
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

      <Text style={{ fontSize: F.hero, fontWeight: "700" as const, color: C.textPrimary, letterSpacing: -0.5, marginTop: S.md, marginBottom: S.xs }}>
        Histórico da{"\n"}identidade
      </Text>
      <Text style={{ fontSize: F.sm, color: C.textSecondary, marginBottom: S.xl }}>
        {VEHICLE.name} · {VEHICLE.plate} · ID {IDENTITY.id}
      </Text>

      {/* FILTROS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: S.xxl }} contentContainerStyle={{ gap: S.xs }}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.id}
            onPress={() => setFilter(f.id)}
            activeOpacity={0.7}
            style={{
              paddingVertical: S.sm, paddingHorizontal: S.md,
              borderRadius: R.pill,
              backgroundColor: filter === f.id ? C.textPrimary : C.surface,
            }}
          >
            <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: filter === f.id ? C.surface : C.textSecondary }}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* TIMELINE */}
      {filtered.length === 0 ? (
        <View style={{ alignItems: "center", paddingVertical: S.xxxl, gap: S.sm }}>
          <Feather name="inbox" size={I.xxxl} color={C.textTertiary} />
          <Text style={{ fontSize: F.sm, color: C.textTertiary }}>Nenhum evento nesta categoria</Text>
        </View>
      ) : (
        <View>
          {filtered.map((item, idx) => (
            <HistoryCard key={item.id} item={item} isLast={idx === filtered.length - 1} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
