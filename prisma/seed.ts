import { PrismaClient, ProviderType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hash(pw: string) {
  return bcrypt.hash(pw, 10);
}

async function main() {
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.court.deleteMany();
  await prisma.user.deleteMany();
  await prisma.venue.deleteMany();

  const demoConfig = JSON.stringify({});
  const wixConfig = JSON.stringify({
    wix: {
      siteId: process.env.WIX_SITE_ID ?? "demo-site",
      serviceId1h: process.env.WIX_SERVICE_ID_LOCACAO_1H ?? "service-1h",
      serviceId2h: process.env.WIX_SERVICE_ID_LOCACAO_2H ?? "service-2h",
    },
  });
  const sbConfig = JSON.stringify({
    simplybook: {
      companyLogin: process.env.SIMPLYBOOK_COMPANY_LOGIN ?? "demo-club",
      eventId1h: process.env.SIMPLYBOOK_EVENT_ID_1H ?? "1",
      eventId2h: process.env.SIMPLYBOOK_EVENT_ID_2H ?? "2",
    },
  });

  const venues: {
    name: string;
    slug: string;
    city: string;
    state: string;
    address: string;
    description: string;
    provider: ProviderType;
    providerConfig: string;
    pricePerHour: number;
    courts: string[];
  }[] = [
    {
      name: "Tennis Club Demo SP",
      slug: "tennis-club-demo-sp",
      city: "São Paulo",
      state: "SP",
      address: "Av. Paulista, 1000",
      description: "Clube demonstração com agenda interna.",
      provider: "INTERNAL",
      providerConfig: demoConfig,
      pricePerHour: 12000,
      courts: ["Quadra 1 — Saibro", "Quadra 2 — Hard"],
    },
    {
      name: "Academia Wix Rio",
      slug: "academia-wix-rio",
      city: "Rio de Janeiro",
      state: "RJ",
      address: "Barra da Tijuca",
      description: "Exemplo Wix Bookings.",
      provider: "WIX",
      providerConfig: wixConfig,
      pricePerHour: 15000,
      courts: ["Quadra Central"],
    },
    {
      name: "Clube SimplyBook Curitiba",
      slug: "clube-simplybook-curitiba",
      city: "Curitiba",
      state: "PR",
      address: "Batel",
      description: "Exemplo SimplyBook.me.",
      provider: "SIMPLYBOOK",
      providerConfig: sbConfig,
      pricePerHour: 10000,
      courts: ["Quadra 1", "Quadra 2", "Quadra 3"],
    },
  ];

  const createdVenues = [];
  for (const v of venues) {
    const venue = await prisma.venue.create({
      data: {
        name: v.name,
        slug: v.slug,
        city: v.city,
        state: v.state,
        address: v.address,
        description: v.description,
        provider: v.provider,
        providerConfig: v.providerConfig,
        pricePerHour: v.pricePerHour,
        courts: {
          create: v.courts.map((name) => ({
            name,
            surface: name.includes("Hard") ? "Hard" : "Saibro",
          })),
        },
      },
    });
    createdVenues.push(venue);
  }

  await prisma.user.create({
    data: {
      email: "admin@reservaquadra.com",
      passwordHash: await hash("admin123"),
      name: "Admin Sistema",
      role: "SUPER_ADMIN",
    },
  });

  await prisma.user.create({
    data: {
      email: "gestor@tennisclub.com",
      passwordHash: await hash("gestor123"),
      name: "Gestor Tennis Club",
      role: "VENUE_ADMIN",
      venueId: createdVenues[0].id,
    },
  });

  await prisma.user.create({
    data: {
      email: "jogador@test.com",
      passwordHash: await hash("jogador123"),
      name: "João Jogador",
      phone: "11999999999",
      role: "PLAYER",
    },
  });

  console.log("Seed OK:");
  console.log("  admin@reservaquadra.com / admin123 (super admin)");
  console.log("  gestor@tennisclub.com / gestor123 (admin escola SP)");
  console.log("  jogador@test.com / jogador123 (jogador)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
