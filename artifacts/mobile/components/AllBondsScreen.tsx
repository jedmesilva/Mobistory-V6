import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Platform, Share, Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { R, S, F, I, ActionButtonSquare, ActiveBadge, BackButton, SearchBar } from "@/components/shared";
import { useBonds, Bond } from "@/contexts/BondsContext";

const C = colors.light;

const FILTERS = [
  { id: "todos",     label: "Todos"      },
  { id: "ativos",    label: "Ativos"     },
  { id: "encerrados",label: "Encerrados" },
  { id: "tipo",      label: "Por tipo"   },
  { id: "usuario",   label: "Por usuário"},
  { id: "data",      label: "Por data"   },
];

function BondItem({ b, onPress }: { b: Bond; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ flexDirection: "row", alignItems: "center", gap: S.md, backgroundColor: C.surface, borderRadius: R.xl, padding: S.lg, marginBottom: S.sm }}
    >
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.iconBg, alignItems: "center", justifyContent: "center" }}>
        <Feather name="user" size={I.lg} color={C.iconColor} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary }} numberOfLines={1}>{b.user}</Text>
        <Text style={{ fontSize: F.sm, color: C.textSecondary, marginTop: 1 }}>{b.type}</Text>
        <Text style={{ fontSize: F.xs, color: C.textTertiary, marginTop: 2 }}>{b.since}{b.until ? ` – ${b.until}` : ""}</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: S.sm }}>
        <ActiveBadge active={b.active} />
        <Feather name="chevron-right" size={I.lg} color={C.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}

export default function AllBondsScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { bonds } = useBonds();
  const [query,  setQuery]  = useState("");
  const [filter, setFilter] = useState("todos");

  const handleShare = async () => {
    try {
      await Share.share({ message: `Histórico de vínculos — ${bonds.length} registros` });
    } catch (_) {}
  };

  const handleExport = () => {
    Alert.alert("Exportar", "Escolha o formato de exportação", [
      { text: "CSV", onPress: () => {} },
      { text: "PDF", onPress: () => {} },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const activeCount = bonds.filter(b => b.active).length;

  const filtered = bonds.filter(b => {
    const matchQuery  = query === "" || b.user.toLowerCase().includes(query.toLowerCase()) || b.type.toLowerCase().includes(query.toLowerCase());
    const matchFilter = filter === "ativos" ? b.active : filter === "encerrados" ? !b.active : true;
    return matchQuery && matchFilter;
  });

  const sorted = filter === "data"
    ? [...filtered].sort((a, b) => (a.since < b.since ? 1 : -1))
    : filter === "usuario"
      ? [...filtered].sort((a, b) => a.user.localeCompare(b.user))
      : filtered;

  const groupedByType = sorted.reduce<Record<string, Bond[]>>((acc, b) => {
    if (!acc[b.type]) acc[b.type] = [];
    acc[b.type].push(b);
    return acc;
  }, {});

  const navigateToDetail = (b: Bond) => {
    router.push({ pathname: "/bond-detail", params: { id: String(b.id) } });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.background }}
      contentContainerStyle={{ paddingTop: topPad + S.lg, paddingBottom: bottomPad + S.xxxl }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* BACK + ICONS */}
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

        {/* TITLE + BADGE */}
        <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: S.xxl }}>
          <Text style={{ fontSize: F.hero, fontWeight: "700" as const, color: C.textPrimary, letterSpacing: -0.5 }}>Vínculos</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: C.successBg, borderRadius: R.pill, paddingVertical: 5, paddingHorizontal: S.md, marginBottom: 4 }}>
            <Feather name="check-circle" size={I.xs} color={C.success} />
            <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.success }}>{activeCount} ativos</Text>
          </View>
        </View>

        {/* ACTION BUTTONS */}
        <View style={{ flexDirection: "row", gap: S.sm, marginBottom: S.xxl }}>
          <ActionButtonSquare iconName="user-plus"  label="Solicitar"   onPress={() => router.push({ pathname: "/request-bond", params: { mode: "solicitar"   } })} />
          <ActionButtonSquare iconName="user-check" label="Conceder"    onPress={() => router.push("/grant-bond")} />
          <ActionButtonSquare iconName="file-text"  label="Reivindicar" onPress={() => router.push({ pathname: "/request-bond", params: { mode: "reivindicar" } })} />
        </View>

        <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const }}>Histórico de vínculos</Text>

        {/* SEARCH */}
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar por nome ou tipo..."
          style={{ marginTop: S.md, marginBottom: S.sm }}
        />
      </View>

      {/* FILTER CHIPS */}
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
            style={{ paddingVertical: 6, paddingHorizontal: S.lg, borderRadius: R.pill, backgroundColor: filter === f.id ? C.primary : C.surface, marginRight: S.sm }}
          >
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
          Object.entries(groupedByType).map(([type, typeBonds]) => (
            <View key={type} style={{ marginBottom: S.xl }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.sm }}>
                <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const }}>{type}</Text>
                <Text style={{ fontSize: F.xs, color: C.textTertiary }}>{typeBonds.length} {typeBonds.length === 1 ? "vínculo" : "vínculos"}</Text>
              </View>
              {typeBonds.map(b => <BondItem key={b.id} b={b} onPress={() => navigateToDetail(b)} />)}
            </View>
          ))
        ) : (
          sorted.map(b => <BondItem key={b.id} b={b} onPress={() => navigateToDetail(b)} />)
        )}
      </View>
    </ScrollView>
  );
}
