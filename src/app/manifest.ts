import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Classco - Class Management",
    short_name: "Classco",
    description: "Class management system",
    start_url: "/",
    display: "standalone",
    background_color: "#18181b",
    theme_color: "#00bba7",
    orientation: "portrait-primary",
    categories: ["education", "productivity"],
    lang: "fa",
    dir: "rtl",
    icons: [
      {
        src: "/icon512_maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon512_rounded.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    // برای PWA Features
    prefer_related_applications: false,
  };
}
