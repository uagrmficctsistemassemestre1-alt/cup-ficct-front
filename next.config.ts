import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Imagen liviana para Docker.
  output: "standalone",
  // El linteo se corre aparte; no debe frenar el build de producción.
  eslint: { ignoreDuringBuilds: true },
  // Oculta el indicador de desarrollo de Next (el botón "N").
  devIndicators: false,
};

export default nextConfig;
