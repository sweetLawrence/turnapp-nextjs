// scripts/convert-relative-imports.mjs
import fs from 'node:fs'
import path from 'node:path'

const ROOTS = ['components', 'app', 'lib', 'hooks', 'utils', 'data']

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else if (/\.(jsx?|mjs)$/.test(entry.name)) out.push(full)
  }
  return out
}

const files = ROOTS.flatMap(walk)
let touched = 0
const report = []

for (const file of files) {
  let src = fs.readFileSync(file, 'utf8')
  const original = src
  const changes = []

  const before = src

  // ../services/foo  →  @/lib/services/foo
  src = src.replace(/from\s*['"]\.\.\/services\//g, () => { changes.push('../services/ → @/lib/services/'); return "from '@/lib/services/" })
  // ../utils/foo     →  @/lib/utils/foo
  src = src.replace(/from\s*['"]\.\.\/utils\//g, () => { changes.push('../utils/ → @/lib/utils/'); return "from '@/lib/utils/" })
  // ../lib/foo       →  @/lib/foo
  src = src.replace(/from\s*['"]\.\.\/lib\//g, () => { changes.push('../lib/ → @/lib/'); return "from '@/lib/" })
  // ../components/   →  @/components/
  src = src.replace(/from\s*['"]\.\.\/components\//g, () => { changes.push('../components/ → @/components/'); return "from '@/components/" })
  // ../hooks/        →  @/hooks/
  src = src.replace(/from\s*['"]\.\.\/hooks\//g, () => { changes.push('../hooks/ → @/hooks/'); return "from '@/hooks/" })
  // ../data/         →  @/data/
  src = src.replace(/from\s*['"]\.\.\/data\//g, () => { changes.push('../data/ → @/data/'); return "from '@/data/" })
  // ../../services/  →  @/lib/services/ (in case of nested files)
  src = src.replace(/from\s*['"]\.\.\/\.\.\/services\//g, () => { changes.push('../../services/ → @/lib/services/'); return "from '@/lib/services/" })
  src = src.replace(/from\s*['"]\.\.\/\.\.\/utils\//g, () => { changes.push('../../utils/ → @/lib/utils/'); return "from '@/lib/utils/" })
  src = src.replace(/from\s*['"]\.\.\/\.\.\/components\//g, () => { changes.push('../../components/ → @/components/'); return "from '@/components/" })

  // Also catch `import X from "../lib/..."` style without `from` keyword? Rare, skip.

  if (src !== original) {
    fs.writeFileSync(file, src, 'utf8')
    touched++
    report.push(`✅ ${file}`)
    ;[...new Set(changes)].forEach(c => report.push(`     - ${c}`))
  }
}

console.log(report.join('\n'))
console.log(`\n📝 ${touched} file(s) converted.`)
console.log('\n⚠️  Any remaining relative imports starting with "../" or "./" that point OUTSIDE the current folder need manual review.')