import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { RootStackParamList } from "../../App";
import { API_URL } from "../config";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

type Venue = {
  id: string;
  name: string;
  city: string;
  state: string;
  pricePerHour: number;
};

export function HomeScreen({ navigation }: Props) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/venues`)
      .then((r) => r.json())
      .then((d) => {
        setVenues(d.venues ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError(`Não foi possível conectar em ${API_URL}`);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#1b5e3b" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Text style={styles.hint}>
          Defina EXPO_PUBLIC_API_URL com o IP do seu PC (mesma rede Wi‑Fi).
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={venues}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() =>
            navigation.navigate("Venue", {
              id: item.id,
              name: item.name,
              pricePerHour: item.pricePerHour,
            })
          }
        >
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.sub}>
            {item.city}, {item.state}
          </Text>
          <Text style={styles.price}>R$ {item.pricePerHour}/h</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", padding: 24 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  title: { fontSize: 18, fontWeight: "600", color: "#0f1f17" },
  sub: { marginTop: 4, color: "#5c6f64" },
  price: { marginTop: 8, fontWeight: "700", color: "#c45c26" },
  error: { color: "#b00020", textAlign: "center" },
  hint: { marginTop: 12, color: "#5c6f64", textAlign: "center", fontSize: 13 },
});
