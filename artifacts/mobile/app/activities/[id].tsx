import { useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";
import EventDetailScreen from "@/components/EventDetailScreen";
import { ACTIVITIES } from "@/constants/data";
import colors from "@/constants/colors";
import { F, S } from "@/components/shared";

const C = colors.light;

export default function ActivityDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = ACTIVITIES.find(a => String(a.id) === id);

  if (!event) {
    return (
      <View style={{ flex: 1, backgroundColor: C.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: F.base, color: C.textTertiary }}>Atividade não encontrada</Text>
      </View>
    );
  }

  return <EventDetailScreen event={event} />;
}
