import { defineConfig, loadEnv } from "vite";
import solidPlugin from "vite-plugin-solid";
import solidSvg from "vite-plugin-solid-svg";

export default ({ mode }: { mode: any }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    plugins: [solidPlugin(), solidSvg()],
    server: {
      host: "0.0.0.0",
      port: 8080,
    },
    build: {
      target: "esnext",
    },
  });
};
