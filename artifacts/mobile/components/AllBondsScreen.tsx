import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, TextInput, ScrollView, Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { ALL_BONDS } from "@/constants/data";
import { R, S, F, I, ActionButtonSquare, ActiveBadge, BackButton } from "@/components/shared";

const C = colors.light;

const FILTERS = [
  { id: "todos", label: "Todos" },
  { id: "ativos", label: "Ativos" },
  { id: "encerrados", label: "Encerrados" },
  { id: "tipo", label: "Por tipo" },
  { id: "usuario", label: "Por usuário" },
  { id: "data", label: "Por data" },
];

function BondItem({ b }: { b: typeof ALL_BONDS[number] }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: S.md, backgroundColor: C.surface, borderRadius: R.xl, padding: S.lg, marginBottom: S.sm }}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.iconBg, alignItems: "center", justifyContent: "center" }}>
        <Feather name="user" size={I.lg} color={C.iconColor} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary }} numberOfLines={1}>{b.user}</Text>
        <Text style={{ fontSize: F.sm, color: C.textSecondary, marginTop: 1 }}>{b.type}</Text>
        <Text style={{ fontSize: F.xs, color: C.textTertiary, marginTop: 2 }}>{b.since}{b.until ? ` – ${b.until}` : ""}</Text>
      </View>
      <ActiveBadge active={b.active} />
    </View>
  );
}

export default function AllBondsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("todos");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const activeCount = ALL_BONDS.filter(b => b.active).length;

  const filtered = ALL_BONDS.filter(b => {
    const matchQuery = query === "" || b.user.toLowerCase().includes(query.toLowerCase()) || b.type.toLowerCase().includes(query.toLowerCase());
    const matchFilter = filter === "ativos" ? b.active : filter === "encerrados" ? !b.active : true;
    return matchQuery && matchFilter;
  });

  const sorted = filter === "data"
    ? [...filtered].sort((a, b) => (a.since < b.since ? 1 : -1))
    : filter === "usuario"
      ? [...filtered].sort((a, b) => a.user.localeCompare(b.user))
      : filtered;

  const groupedByType = sorted.reduce<Record<string, typeof ALL_BONDS>>((acc, b) => {
    if (!acc[b.type]) acc[b.type] = [];
    acc[b.type].push(b);
    return acc;
  }, {});

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.background }}
      contentContainerStyle={{ paddingTop: topPad + S.lg, paddingBottom: bottomPad + S.xxxl }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* BACK + TITLE */}
      <View style={{ paddingHorizontal: S.xl }}>
        <BackButton onPress={() => router.back()} />
        <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: S.xxl }}>
          <Text style={{ fontSize: F.hero, fontWeight: "700" as const, color: C.textPrimary, letterSpacing: -0.5 }}>Vínculos</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: C.successBg, borderRadius: R.pill, paddingVertical: 5, paddingHorizontal: S.md, marginBottom: 4 }}>
            <Feather name="check-circle" size={I.xs} color={C.success} />
            <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.success }}>{activeCount} ativos</Text>
          </View>
        </View>

        {/* ACTION BUTTONS */}
        <View style={{ flexDirection: "row", gap: S.sm, marginBottom: S.xxl }}>
          <ActionButtonSquare iconName="user-plus" label="Solicitar" />
          <ActionButtonSquare iconName="user-check" label="Conceder" />
          <ActionButtonSquare iconName="file-text" label="Reivindicar" />
        </View>

        <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const }}>Histórico de vínculos</Text>

        {/* SEARCH */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: S.md, backgroundColor: C.surface, borderRadius: R.xl, paddingVertical: 14, paddingHorizontal: S.lg, marginTop: S.md, marginBottom: S.sm }}>
          <Feather name="search" size={I.lg} color={C.textTertiary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar por nome ou tipo..."
            placeholderTextColor={C.textTertiary}
            style={{ flex: 1, fontSize: F.base, color: C.textPrimary }}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} activeOpacity={0.7}>
              <Feather name="x" size={I.sm} color={C.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* FILTER CHIPS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: S.xl, paddingVertical: S.md, gap: S.sm }}
      >
        {FILTERS.map(f => (
          <TouchableOpacity key={f.id} onPress={() => setFilter(f.id)} activeOpacity={0.7}
            style={{ paddingVertical: 6, paddingHorizontal: S.lg, borderRadius: R.pill, backgroundColor: filter === f.id ? C.primary : C.surface, marginRight: S.sm }}>
            <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: filter === f.id ? C.primaryForeground : C.textSecondary }}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* LIST */}
      <View style={{ paddingHorizontal: S.xl, paddingTop: S.xs }}>
        {sorted.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: S.xxxl, gap: S.sm }}>
            <Feather name="users" size={I.xxxl} color={C.textTertiary} />
            <Text style={{ fontSize: F.base, color: C.textTertiary, fontWeight: "500" as const }}>Nenhum vínculo encontrado</Text>
          </View>
        ) : filter === "tipo" ? (
          Object.entries(groupedByType).map(([type, bonds]) => (
            <View key={type} style={{ marginBottom: S.xl }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.sm }}>
                <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const }}>{type}</Text>
                <Text style={{ fontSize: F.xs, color: C.textTertiary }}>{bonds.length} {bonds.length === 1 ? "vínculo" : "vínculos"}</Text>
              </View>
              {bonds.map(b => <BondItem key={b.id} b={b} />)}
            </View>
          ))
        ) : (
          sorted.map(b => <BondItem key={b.id} b={b} />)
        )}
      </View>
    </ScrollView>
  );
}
