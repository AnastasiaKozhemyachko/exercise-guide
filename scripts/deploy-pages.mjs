import { execFileSync } from 'node:child_process';
import { mkdtempSync, cpSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const run = (cmd, args, cwd = root) => execFileSync(cmd, args, { cwd, stdio: 'inherit' });
const read = (args, cwd = root) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
run('npm', ['run', 'validate:assets']);
run('npm', ['run', 'build:pages']);
// Publish only generated files in a new temporary clone. No source checkout resets.
const remote = read(['remote', 'get-url', 'origin']);
const name = read(['config', 'user.name']);
const email = read(['config', 'user.email']);
const temp = mkdtempSync(join(tmpdir(), 'exercise-guide-pages-'));
try {
  run('git', ['init', '-b', 'gh-pages', temp]);
  run('git', ['remote', 'add', 'origin', remote], temp);
  if (read(['ls-remote', '--heads', 'origin', 'gh-pages'], temp)) {
    run('git', ['fetch', '--depth=1', 'origin', 'gh-pages'], temp);
    run('git', ['reset', '--hard', 'FETCH_HEAD'], temp);
  }
  for (const entry of readdirSync(temp)) {
    if (entry !== '.git') rmSync(join(temp, entry), { recursive: true, force: true });
  }
  cpSync(resolve(root, 'dist'), temp, { recursive: true });
  writeFileSync(join(temp, '.nojekyll'), '');
  run('git', ['add', '.'], temp);
  const changes = read(['diff', '--cached', '--name-only'], temp);
  if (changes) run('git', ['-c', `user.name=${name}`, '-c', `user.email=${email}`, 'commit', '-m', 'Publish exercise library to GitHub Pages'], temp);
  run('git', ['push', 'origin', 'HEAD:gh-pages'], temp);
} finally {
  rmSync(temp, { recursive: true, force: true });
}
