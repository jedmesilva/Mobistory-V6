import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { ALL_FUEL } from "@/constants/data";
import { R, S, F, I, ActionButtonSquare, BackButton, SearchBar } from "@/components/shared";

const C = colors.light;

const FILTERS = [
  { id: "todos",    label: "Todos" },
  { id: "gasolina", label: "Gasolina" },
  { id: "etanol",   label: "Etanol" },
  { id: "data",     label: "Por data" },
  { id: "valor",    label: "Por valor" },
  { id: "volume",   label: "Por volume" },
];

function FuelItem({ item }: { item: typeof ALL_FUEL[number] }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: S.md, backgroundColor: C.surface, borderRadius: R.xl, padding: S.lg, marginBottom: S.sm }}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.iconBg, alignItems: "center", justifyContent: "center" }}>
        <Feather name="droplet" size={I.lg} color={C.iconColor} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary }}>{item.volume} · {item.type}</Text>
          <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: C.textPrimary }}>{item.value}</Text>
        </View>
        <Text style={{ fontSize: F.sm, color: C.textSecondary, marginTop: 1 }}>{item.station} · {item.km}</Text>
        <Text style={{ fontSize: F.xs, color: C.textTertiary, marginTop: 2 }}>{item.date} · {item.time} · {item.pricePerL}/L</Text>
      </View>
    </View>
  );
}

export default function AllFuelScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("todos");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const totalVolume = ALL_FUEL.reduce((acc, f) => acc + parseInt(f.volume), 0);

  const filtered = ALL_FUEL.filter(f => {
    const matchQuery = query === "" ||
      f.station.toLowerCase().includes(query.toLowerCase()) ||
      f.type.toLowerCase().includes(query.toLowerCase());
    const matchFilter =
      filter === "gasolina" ? f.type.toLowerCase().includes("gasolina") :
      filter === "etanol"   ? f.type.toLowerCase().includes("etanol") :
      true;
    return matchQuery && matchFilter;
  });

  const sorted =
    filter === "valor"  ? [...filtered].sort((a, b) => parseFloat(b.value.replace("R$ ", "").replace(",", ".")) - parseFloat(a.value.replace("R$ ", "").replace(",", "."))) :
    filter === "volume" ? [...filtered].sort((a, b) => parseInt(b.volume) - parseInt(a.volume)) :
    filter === "data"   ? [...filtered].sort((a, b) => (a.date < b.date ? 1 : -1)) :
    filtered;

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
          <Text style={{ fontSize: F.hero, fontWeight: "700" as const, color: C.textPrimary, letterSpacing: -0.5 }}>Abastecimentos</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: C.iconBg, borderRadius: R.pill, paddingVertical: 5, paddingHorizontal: S.md, marginBottom: 4 }}>
            <Feather name="droplet" size={I.xs} color={C.textSecondary} />
            <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textSecondary }}>{totalVolume}L total</Text>
          </View>
        </View>

        {/* ACTION BUTTONS */}
        <View style={{ flexDirection: "row", gap: S.sm, marginBottom: S.xxl }}>
          <ActionButtonSquare iconName="plus" label="Registrar" />
          <ActionButtonSquare iconName="bar-chart-2" label="Estatísticas" />
          <ActionButtonSquare iconName="download" label="Exportar" />
        </View>

        <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const }}>Histórico de abastecimentos</Text>

        {/* SEARCH */}
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar por posto ou combustível..."
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
            <Feather name="droplet" size={I.xxxl} color={C.textTertiary} />
            <Text style={{ fontSize: F.base, color: C.textTertiary, fontWeight: "500" as const }}>Nenhum abastecimento encontrado</Text>
          </View>
        ) : (
          sorted.map(item => <FuelItem key={item.id} item={item} />)
        )}
      </View>
    </ScrollView>
  );
}
