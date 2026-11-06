import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

// Pre-release backup: export D1 to a local SQL file and upload to R2 under backups/.
// Usage: npm run backup -- [--env preview]
const envArg = process.argv.includes('--env') ? ['--env', process.argv[process.argv.indexOf('--env') + 1]!] : [];
const envFlag = envArg.join(' ');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const file = `backups/d1-${stamp}.sql`;
mkdirSync('backups', { recursive: true });

execSync(`npx wrangler d1 export tarot-db --remote --output=${file} ${envFlag}`, { stdio: 'inherit' });
execSync(`npx wrangler r2 object put tarot-media/${file} --file=${file} --remote ${envFlag}`, { stdio: 'inherit' });
writeFileSync('backups/LAST_BACKUP', `${file}\n`);
console.log(`backup uploaded to r2://tarot-media/${file}`);
