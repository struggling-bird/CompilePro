import path from "path";
import { defineConfig, loadEnv, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("react")) return "react";
              if (id.includes("react-router")) return "router";
              if (id.includes("@ant-design/icons")) return "antd-icons";
              if (id.includes("@ant-design/cssinjs")) return "antd-cssinjs";
              if (id.includes("@rc-component")) return "rc-components";
              if (id.includes("antd")) return "antd-core";
              return "vendor";
            }
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
    server: {
      port: 3000,
      host: "0.0.0.0",
      proxy: {
        "/apis": {
          target: "http://localhost:3001",
          changeOrigin: true,
        },
      },
    },
    plugins: [react(), splitVendorChunkPlugin()],
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});
