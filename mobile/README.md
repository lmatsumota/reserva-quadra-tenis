# App mobile — Reserva Quadra

Cliente Expo (React Native) que lista escolas e abre o fluxo de reserva no navegador.

## Rodar

```bash
cd mobile
npm install
cp .env.example .env
# Edite EXPO_PUBLIC_API_URL com o IP do seu PC
npx expo start
```

Escaneie o QR code com o app **Expo Go** (Play Store / App Store).

## Publicar nas lojas

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android
eas build --platform ios
```

O APK/AAB gerado pode ser enviado à Google Play; o IPA à App Store.
