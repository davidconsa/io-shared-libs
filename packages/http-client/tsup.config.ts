import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: {
    // composite:true in tsconfig conflicts with tsup's in-memory TS project
    // used for DTS generation — disable it only for the DTS build.
    compilerOptions: { composite: false, incremental: false },
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: 'node20',
  platform: 'node',
  outExtension({ format }) {
    return { js: format === 'cjs' ? '.cjs' : '.js' };
  },
});
