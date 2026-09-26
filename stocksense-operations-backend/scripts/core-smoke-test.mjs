import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const source = path.resolve('src/common/domain/operation-state.ts');
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stocksense-core-'));

try {
  execFileSync('tsc', [
    source,
    '--target', 'ES2022',
    '--module', 'ESNext',
    '--moduleResolution', 'Node',
    '--outDir', tempDir,
    '--skipLibCheck',
    '--pretty', 'false',
  ], { stdio: 'pipe' });

  const compiled = path.join(tempDir, 'operation-state.js');
  const mod = await import(pathToFileURL(compiled).href);

  assert.equal(mod.canTransition('DRAFT', 'WAITING'), true);
  assert.equal(mod.canTransition('WAITING', 'READY'), true);
  assert.equal(mod.canTransition('READY', 'DONE'), true);
  assert.equal(mod.canTransition('READY', 'CANCELED'), true);
  assert.equal(mod.canTransition('DONE', 'READY'), false);
  assert.equal(mod.canTransition('CANCELED', 'DRAFT'), false);
  assert.equal(mod.calculateAdjustmentDelta(100, 97), -3);
  assert.equal(mod.calculateAdjustmentDelta(97, 100), 3);
  assert.equal(mod.isTerminalStatus('DONE'), true);
  assert.equal(mod.isTerminalStatus('CANCELED'), true);
  assert.equal(mod.isNonTerminalStatus('DRAFT'), true);
  assert.equal(mod.isNonTerminalStatus('READY'), true);

  console.log('Core smoke tests passed.');
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
