import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as WebBrowser from "expo-web-browser";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { RootStackParamList } from "../../App";
import { API_URL } from "../config";

type Props = NativeStackScreenProps<RootStackParamList, "Venue">;

export function VenueScreen({ route }: Props) {
  const { id, pricePerHour } = route.params;
  const webUrl = `${API_URL}/escola/${id}`;

  async function openBooking() {
    await WebBrowser.openBrowserAsync(webUrl);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        A reserva completa (horários, login e pagamento) abre no navegador
        integrado — mesma experiência do site.
      </Text>
      <Text style={styles.price}>A partir de R$ {pricePerHour}/h</Text>
      <Pressable style={styles.button} onPress={openBooking}>
        <Text style={styles.buttonText}>Reservar quadra</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#f4f7f5" },
  text: { fontSize: 16, color: "#5c6f64", lineHeight: 24 },
  price: { marginTop: 16, fontSize: 22, fontWeight: "700", color: "#c45c26" },
  button: {
    marginTop: 24,
    backgroundColor: "#1b5e3b",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
