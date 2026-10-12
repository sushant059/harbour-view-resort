import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Harbour View Resort Darwin",
    short_name: "Harbour View",
    description: "Carpet, couch, mattress and bond cleaning in Darwin and the Northern Territory.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F3EC",
    theme_color: "#13262F",
    icons: [{ src: "/hvr-mark.png", sizes: "512x512", type: "image/png" }],
  };
}
