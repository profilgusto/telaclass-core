import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
          <main className="min-h-[calc(100vh-56px-40px]"> {/* O cálculo é para reservar o espaço do header e fazer com que o conteúdo principal empurre o footer até o fim da página. Deve-se ajustar este valor caso altere os tamanhos de header ou footer */}
            {children}
          </main>

          <Footer />

        </ThemeProvider>
      </body>
    </html>
  );
}
