import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import "./quiet-tech.css";
import "./portfolio-premium.css";
import "./obsidian-aurora.css";
import { PWA_ICONS } from "./pwa-branding";
import { SITES_APP_ORIGIN } from "../application/http/provider-proxy-contract";

const SITE_DESCRIPTION = "登录后跨设备查看个人美股持仓与延迟行情估值。";
const SOCIAL_IMAGE = new URL("/og.png", SITES_APP_ORIGIN).href;

export const metadata: Metadata = {
  metadataBase: new URL(SITES_APP_ORIGIN),
  title: {
    default: "总仓位",
    template: "%s · 总仓位",
  },
  description: SITE_DESCRIPTION,
  applicationName: "总仓位",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "总仓位",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: PWA_ICONS.favicon32, sizes: "32x32", type: "image/png" },
      { url: PWA_ICONS.any192, sizes: "192x192", type: "image/png" },
      { url: PWA_ICONS.any512, sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: PWA_ICONS.appleTouch180,
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    title: "总仓位",
    description: SITE_DESCRIPTION,
    type: "website",
    images: [{ url: SOCIAL_IMAGE, width: 1731, height: 909, alt: "总仓位" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "总仓位",
    description: SITE_DESCRIPTION,
    images: [SOCIAL_IMAGE],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#050506",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
