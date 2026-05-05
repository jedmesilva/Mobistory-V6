import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Platform, Share, Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { ALL_TIRE } from "@/constants/data";
import { R, S, F, I, ActionButtonSquare, BackButton, SearchBar } from "@/components/shared";

const C = colors.light;

const FILTERS = [
  { id: "todos",    label: "Todos"       },
  { id: "local",    label: "Por local"   },
  { id: "data",     label: "Por data"    },
  { id: "pressao",  label: "Por pressão" },
];

function parsePSI(p: string) {
  return parseInt(p.replace(" PSI", "")) || 0;
}

function TireItem({ item }: { item: typeof ALL_TIRE[number] }) {
  return (
    <View style={{
      flexDirection: "row", alignItems: "center", gap: S.md,
      backgroundColor: C.surface, borderRadius: R.xl,
      padding: S.lg, marginBottom: S.sm,
    }}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.iconBg, alignItems: "center", justifyContent: "center" }}>
        <Feather name="disc" size={I.lg} color={C.iconColor} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary, flexShrink: 1 }} numberOfLines={1}>{item.place}</Text>
          <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: C.textPrimary, marginLeft: S.sm }}>{item.pressure}</Text>
        </View>
        <Text style={{ fontSize: F.sm, color: C.textSecondary, marginTop: 1 }}>
          {item.tires} {item.tires === 1 ? "pneu calibrado" : "pneus calibrados"}
        </Text>
        <Text style={{ fontSize: F.xs, color: C.textTertiary, marginTop: 2 }}>{item.date} · {item.time} · {item.km}</Text>
      </View>
    </View>
  );
}

function GroupSection({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: S.xl }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.sm }}>
        <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const }}>{title}</Text>
        <Text style={{ fontSize: F.xs, color: C.textTertiary }}>{count} {count === 1 ? "registro" : "registros"}</Text>
      </View>
      {children}
    </View>
  );
}

export default function AllTireScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const [query,  setQuery]  = useState("");
  const [filter, setFilter] = useState("todos");

  const handleShare = async () => {
    try {
      await Share.share({ message: `Histórico de calibragens — ${ALL_TIRE.length} registros` });
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

  const filtered = ALL_TIRE.filter(f => {
    return query === "" ||
      f.place.toLowerCase().includes(query.toLowerCase()) ||
      f.pressure.toLowerCase().includes(query.toLowerCase());
  });

  const sorted =
    filter === "data"    ? [...filtered].sort((a, b) => (a.date < b.date ? 1 : -1)) :
    filter === "pressao" ? [...filtered].sort((a, b) => parsePSI(b.pressure) - parsePSI(a.pressure)) :
    filtered;

  const groupedByLocal = sorted.reduce<Record<string, typeof ALL_TIRE>>((acc, item) => {
    if (!acc[item.place]) acc[item.place] = [];
    acc[item.place].push(item);
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
          <Text style={{ fontSize: F.hero, fontWeight: "700" as const, color: C.textPrimary, letterSpacing: -0.5 }}>Calibragens</Text>
        </View>

        {/* ACTION BUTTONS */}
        <View style={{ flexDirection: "row", gap: S.sm, marginBottom: S.xxl, width: "66%" }}>
          <ActionButtonSquare iconName="plus" label="Registrar" />
          <ActionButtonSquare iconName="bar-chart-2" label="Estatísticas" />
        </View>

        <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const }}>
          Histórico de calibragens
        </Text>

        {/* SEARCH */}
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar por local ou pressão..."
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
            style={{
              paddingVertical: 6, paddingHorizontal: S.lg, borderRadius: R.pill,
              backgroundColor: filter === f.id ? C.primary : C.surface,
              marginRight: S.sm,
            }}
          >
            <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: filter === f.id ? C.primaryForeground : C.textSecondary }}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* LIST */}
      <View style={{ paddingHorizontal: S.xl, paddingTop: S.xs }}>
        {sorted.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: S.xxxl, gap: S.sm }}>
            <Feather name="disc" size={I.xxxl} color={C.textTertiary} />
            <Text style={{ fontSize: F.base, color: C.textTertiary, fontWeight: "500" as const }}>
              Nenhuma calibragem encontrada
            </Text>
          </View>
        ) : filter === "local" ? (
          Object.entries(groupedByLocal).map(([place, items]) => (
            <GroupSection key={place} title={place} count={items.length}>
              {items.map(item => <TireItem key={item.id} item={item} />)}
            </GroupSection>
          ))
        ) : (
          sorted.map(item => <TireItem key={item.id} item={item} />)
        )}
      </View>
    </ScrollView>
  );
}
