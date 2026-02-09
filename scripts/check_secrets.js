const { execSync } = require('child_process');
const fs = require('fs');

function getStagedFiles() {
  try {
    const out = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' });
    return out.split('\n').map(s => s.trim()).filter(Boolean);
  } catch (e) {
    console.error('Erro obtendo arquivos staged:', e.message);
    process.exit(0);
  }
}

const patterns = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/i,
  /AKIA[0-9A-Z]{16}/, // AWS Access Key ID
  /aws_access_key_id/i,
  /aws_secret_access_key/i,
  /password\s*=\s*/i,
  /password\s*:\s*/i,
  /jwt[-_ ]?secret/i,
  /api[_-]?key/i,
  /client[_-]?secret/i,
  /-----BEGIN CERTIFICATE-----/i,
  /PRIVATE_KEY/i,
  /ENCRYPTED PRIVATE KEY/i,
];

function scanFile(path) {
  try {
    const content = fs.readFileSync(path, 'utf8');
    for (const re of patterns) {
      if (re.test(content)) {
        return { path, match: re.toString() };
      }
    }
  } catch (e) {
    // binary files or permissions
  }
  return null;
}

function main() {
  const files = getStagedFiles();
  if (files.length === 0) {
    process.exit(0);
  }

  const findings = [];
  for (const f of files) {
    const r = scanFile(f);
    if (r) findings.push(r);
  }

  if (findings.length > 0) {
    console.error('\n⚠️  Possible secrets detected in staged files:');
    for (const it of findings) console.error(` - ${it.path}  (pattern: ${it.match})`);
    console.error('\nPlease remove secrets from the files or unstaged them. If these are false positives, you can adjust scripts/check_secrets.js patterns.');
    process.exit(1);
  }

  process.exit(0);
}

main();
