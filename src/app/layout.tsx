import type { Metadata } from "next";
import { Heebo, Assistant } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-provider";
import { DataProvider } from "@/components/providers/data-provider";
import { SessionManager } from "@/components/auth/session-manager";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "זמן זוגי - מערכת השאלת משחקי זוגיות",
  description: "מערכת ניהול השאלת משחקי זוגיות עם ממשק מלא בעברית",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body
        className={`${heebo.variable} ${assistant.variable} font-hebrew antialiased`}
      >
        <AuthProvider>
          <SessionManager />
          <DataProvider>
            {children}
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
