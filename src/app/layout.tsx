import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Yeapy — Ofertas de 24 horas",
    template: "%s | Yeapy",
  },
  description:
    "Descubra ofertas temporarias com prazo de 24 horas. Oportunidades reais todos os dias com precos que so diminuem.",
  keywords: [
    "ofertas",
    "promocoes",
    "24 horas",
    "oportunidades",
    "descontos",
    "ofertas locais",
  ],
  openGraph: {
    title: "Yeapy — Ofertas de 24 horas",
    description:
      "Descubra ofertas temporarias com prazo de 24 horas. Oportunidades reais todos os dias.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
