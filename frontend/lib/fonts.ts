import { Public_Sans } from "next/font/google";
import localFont from "next/font/local";

export const sansFont = Public_Sans({
  variable: "--font-lk-sans",
  subsets: ["latin"],
  preload: true,
});

export const monoFont = localFont({
  src: "../fonts/commit-mono-variable-font.woff2",
  variable: "--font-lk-mono",
  preload: true,
});

export const displayFont = localFont({
  src: [
    { path: "../fonts/everett-light.woff2", weight: "300", style: "normal" },
    { path: "../fonts/everett-regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/everett-medium.woff2", weight: "600", style: "normal" },
    { path: "../fonts/everett-bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-lk-display",
  preload: false,
});
