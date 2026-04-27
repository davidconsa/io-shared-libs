import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface PackageJson {
  name: string;
  exports?: Record<string, unknown>;
}

function checkPath(pkgDir: string, value: unknown, missing: string[]): void {
  if (typeof value === 'string') {
    const abs = resolve(pkgDir, value);
    if (!existsSync(abs)) missing.push(value);
  } else if (typeof value === 'object' && value !== null) {
    for (const v of Object.values(value)) {
      checkPath(pkgDir, v, missing);
    }
  }
}

function checkPackageExports(packageJsonPath: string): void {
  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as PackageJson;
  const pkgDir = dirname(packageJsonPath);
  const missing: string[] = [];

  checkPath(pkgDir, pkg.exports, missing);

  if (missing.length > 0) {
    console.error(
      `${pkg.name}: Missing export paths:\n${missing.map((p) => `  - ${p}`).join('\n')}`,
    );
    process.exit(1);
  }

  console.info(`${pkg.name}: all exports verified ✓`);
}

checkPackageExports(
  resolve(__dirname, '../../packages/http-client/package.json'),
);
checkPackageExports(
  resolve(__dirname, '../../packages/logger/package.json'),
);
