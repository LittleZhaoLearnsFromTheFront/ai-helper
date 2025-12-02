import { build } from "esbuild"
build({
    entryPoints: ['src/index.ts'],
    platform: 'node',
    target: "node16",
    bundle: true,
    // minify: true,
    format: 'cjs',
    outdir: './dist',
    chunkNames:""
}).catch(() => process.exit(1));