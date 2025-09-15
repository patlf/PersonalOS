import type { Metadata } from "next";
import "./globals.css";
import { AppLayout } from "@/components/layout/app-layout";
import { AuthProvider } from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Personal OS",
  description: "Your personal operating system for productivity - manage tasks, calendar, and workflows in one unified platform",
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0b0b0b" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'system';
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                const resolvedTheme = theme === 'system' ? systemTheme : theme;
                
                if (resolvedTheme === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider defaultTheme="system">
          <AuthProvider>
            <QueryProvider>
              <AppLayout>{children}</AppLayout>
              <Toaster 
                position="top-right"
                richColors
                closeButton
                duration={4000}
              />
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}