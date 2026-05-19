import { MercadoPagoConfig, Preference } from "mercadopago";

function getClient() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) return null;
  return new MercadoPagoConfig({ accessToken: token });
}

export async function createCheckoutPreference(params: {
  bookingId: string;
  title: string;
  amountCents: number;
  payerEmail: string;
  payerName: string;
}) {
  const client = getClient();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!client) {
    return {
      demoMode: true as const,
      initPoint: `${baseUrl}/reserva/${params.bookingId}/sucesso?demo=1`,
      preferenceId: `demo-${params.bookingId}`,
    };
  }

  const preference = new Preference(client);
  const amount = params.amountCents / 100;

  const result = await preference.create({
    body: {
      items: [
        {
          id: params.bookingId,
          title: params.title,
          quantity: 1,
          unit_price: amount,
          currency_id: "BRL",
        },
      ],
      payer: {
        email: params.payerEmail,
        name: params.payerName,
      },
      back_urls: {
        success: `${baseUrl}/reserva/${params.bookingId}/sucesso`,
        failure: `${baseUrl}/reserva/${params.bookingId}?payment=failed`,
        pending: `${baseUrl}/reserva/${params.bookingId}/sucesso?pending=1`,
      },
      auto_return: "approved",
      external_reference: params.bookingId,
      notification_url: `${baseUrl}/api/webhooks/mercadopago`,
    },
  });

  return {
    demoMode: false as const,
    initPoint: result.init_point!,
    preferenceId: result.id!,
  };
}
