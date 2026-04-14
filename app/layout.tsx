import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DMT - Companion App",
  description:
    "Tu copiloto digital para analizar telemetría de carreras. Sube tus datos, visualiza gráficos interactivos y optimiza tu rendimiento en pista. ¡Conviértete en el piloto que siempre soñaste ser!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}

        <footer className="w-full py-8 mt-auto border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-sm">
          <div className="max-center px-8 flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Texto Principal */}
            <div className="flex items-center gap-3 text-slate-500 text-xs font-medium tracking-tight">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              <span>
                Developed for{" "}
                <span className="text-slate-300 font-bold italic uppercase">
                  DA MATTA ESPORTS
                </span>
              </span>
            </div>

            {/* Firma y Créditos */}
            <div className="text-[11px] font-mono text-slate-600 flex items-center gap-1.5">
              <span>CREATED BY</span>
              <a
                href="https://github.com/jyturrieta"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-red-500 transition-colors font-black flex items-center gap-1 group"
              >
                JYTURRIETA
                <svg
                  className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>

            {/* Versión / Status */}
            <div className="text-[10px] text-slate-700 font-mono uppercase tracking-[0.2em]">
              v1.1.8 // DMT COMPANION APP
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
