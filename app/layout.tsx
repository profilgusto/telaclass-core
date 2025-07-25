import type { Metadata } from "next";
import localFont from 'next/font/local';
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const geistSans = localFont({
  src: [
    { path: "../public/fonts/Geist-Regular.woff2", weight: "400", style: "normal", format: "woff2" },
    { path: "../public/fonts/Geist-Medium.woff2",  weight: "500", style: "normal", format: "woff2" },
  ],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: [
    { path: "../public/fonts/GeistMono-Regular.woff2", weight: "400", style: "normal", format: "woff2" },
  ],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Telaclass",
  description: "Portal de aulas",
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode;}>) {
  return (
    <html
      lang="pt-br"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <ThemeProvider>
          <Header />

          {/*Conteúdo principal */}
          <main className="min-h-[calc(100vh-56px-40px)]"> {/* O cálculo é para reservar o espaço do header e fazer com que o conteúdo principal empurre o footer até o fim da página. Deve-se ajustar este valor caso altere os tamanhos de header ou footer */}
            {children}
          </main>

          <Footer />

        </ThemeProvider>
      </body>
    </html>
  );
}
