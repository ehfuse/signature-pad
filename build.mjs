import * as esbuild from "esbuild";
import { execSync } from "child_process";

const external = ["react", "react-dom", "react/jsx-runtime"];

// 라이브러리 번들을 생성한다.
await esbuild.build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    minify: true,
    sourcemap: true,
    external,
    format: "esm",
    platform: "browser",
    target: "es2020",
    outfile: "dist/index.mjs",
});

// CommonJS 번들을 생성한다.
await esbuild.build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    minify: true,
    sourcemap: true,
    external,
    format: "cjs",
    platform: "browser",
    target: "es2020",
    outfile: "dist/index.js",
});

// 타입 선언 파일을 생성한다.
execSync("npx tsc --emitDeclarationOnly --declaration --outDir dist", {
    stdio: "inherit",
});

console.log("@ehfuse/signature-pad build complete");
