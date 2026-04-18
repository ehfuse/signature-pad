import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// 예제 앱에서 상위 패키지 소스를 직접 바라보게 한다.
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@ehfuse/signature-pad": path.resolve(__dirname, "../src"),
        },
        dedupe: ["react", "react-dom"],
    },
    optimizeDeps: {
        include: ["react", "react-dom", "react-router-dom"],
    },
});
