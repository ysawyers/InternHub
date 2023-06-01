import { defineConfig, loadEnv } from "vite";
import solidPlugin from "vite-plugin-solid";
import solidSvg from "vite-plugin-solid-svg";
import pluginRewriteAll from "vite-plugin-rewrite-all";

export default ({ mode }: { mode: any }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    plugins: [solidPlugin(), solidSvg(), pluginRewriteAll()],
    server: {
      host: process.env.VITE_HOST,
      port: parseInt(process.env.VITE_PORT!),
    },
    build: {
      target: "esnext",
    },
  });
};
