import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: {
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
