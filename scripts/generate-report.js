const fs   = require('fs');
const path = require('path');

const RESULTS_PATH = path.join(__dirname, '..', 'reports', 'test-results.json');
const OUTPUT_PATH  = path.join(__dirname, '..', 'reports', 'summary.md');

function loadResults() {
  if (!fs.existsSync(RESULTS_PATH)) {
    console.error('No test-results.json found. Run `npm test` first.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
}

function summarise(data) {
  const suites = data.suites || [];

  let total = 0, passed = 0, failed = 0, skipped = 0;
  const failures = [];

  function walk(suite) {
    (suite.specs || []).forEach(spec => {
      (spec.tests || []).forEach(t => {
        total++;
        const status = t.results?.[0]?.status;
        if (status === 'passed')  passed++;
        else if (status === 'skipped') skipped++;
        else {
          failed++;
          failures.push({
            title:   spec.title,
            file:    suite.file || suite.title,
            error:   t.results?.[0]?.error?.message || 'Unknown error',
          });
        }
      });
    });
    (suite.suites || []).forEach(walk);
  }

  suites.forEach(walk);

  return { total, passed, failed, skipped, failures };
}

function buildMarkdown({ total, passed, failed, skipped, failures }) {
  const rate  = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';
  const emoji = failed === 0 ? '✅' : '❌';
  const lines = [
    `# ${emoji} QA Test Report`,
    '',
    `**Generated:** ${new Date().toISOString()}`,
    '',
    '## Summary',
    '',
    `| Metric   | Value |`,
    `|----------|-------|`,
    `| Total    | ${total}   |`,
    `| Passed   | ${passed}  |`,
    `| Failed   | ${failed}  |`,
    `| Skipped  | ${skipped} |`,
    `| Pass Rate| ${rate}%   |`,
    '',
  ];

  if (failures.length) {
    lines.push('## Failed Tests', '');
    failures.forEach((f, i) => {
      lines.push(`### ${i + 1}. ${f.title}`);
      lines.push(`- **File:** \`${f.file}\``);
      lines.push(`- **Error:** ${f.error}`);
      lines.push('');
    });
  } else {
    lines.push('_All tests passed. 🎉_', '');
  }

  return lines.join('\n');
}

// ─── Main ────────────────────────────────────────────────────────────────────
const data    = loadResults();
const stats   = summarise(data);
const markdown = buildMarkdown(stats);

// Print to console
console.log(markdown);

// Write to file
fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, markdown, 'utf8');
console.log(`\nReport written to ${OUTPUT_PATH}`);

// Exit with error code if tests failed (useful for CI)
process.exit(stats.failed > 0 ? 1 : 0);
