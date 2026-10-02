// scripts/convert-router-imports.mjs
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

  // Skip files that don't use react-router-dom
  if (!src.includes('react-router-dom')) continue

  const changes = []

  // 1. Simple named imports we can map 1:1
  src = src.replace(
    /import\s*\{\s*useParams\s*\}\s*from\s*['"]react-router-dom['"];?/,
    () => { changes.push('useParams → next/navigation'); return `import { useParams } from 'next/navigation'` }
  )
  src = src.replace(
    /import\s*\{\s*useSearchParams\s*\}\s*from\s*['"]react-router-dom['"];?/,
    () => { changes.push('useSearchParams → next/navigation'); return `import { useSearchParams } from 'next/navigation'` }
  )
  src = src.replace(
    /import\s*\{\s*useNavigate\s*\}\s*from\s*['"]react-router-dom['"];?/,
    () => { changes.push('useNavigate → useRouter (next/navigation)'); return `import { useRouter } from 'next/navigation'` }
  )
  src = src.replace(
    /import\s*\{\s*useLocation\s*\}\s*from\s*['"]react-router-dom['"];?/,
    () => { changes.push('useLocation → usePathname (next/navigation)'); return `import { usePathname } from 'next/navigation'` }
  )

  // 2. Link import
  src = src.replace(
    /import\s*\{\s*Link\s*\}\s*from\s*['"]react-router-dom['"];?/,
    () => { changes.push('Link → next/link'); return `import Link from 'next/link'` }
  )

  // 3. Combined imports: `import { Link, useNavigate } from 'react-router-dom'`
  //    Turn into multiple imports from Next.
  src = src.replace(
    /import\s*\{([^}]+)\}\s*from\s*['"]react-router-dom['"];?/g,
    (match, names) => {
      const list = names.split(',').map(s => s.trim()).filter(Boolean)
      const out = []
      if (list.includes('Link')) out.push(`import Link from 'next/link'`)
      const navNames = list.filter(n => n !== 'Link')
      if (navNames.includes('useNavigate')) {
        out.push(`import { useRouter } from 'next/navigation'`)
        changes.push('useNavigate → useRouter')
      }
      const rest = navNames.filter(n => n !== 'useNavigate')
      if (rest.length) {
        out.push(`import { ${rest.join(', ')} } from 'next/navigation'`)
        changes.push(`${rest.join(', ')} → next/navigation`)
      }
      return out.join('\n')
    }
  )

  // 4. Body-level: `navigate(` → `router.push(` (only if useNavigate was replaced)
  //    We can't reliably detect the variable name, so we handle the common case:
  //      const navigate = useNavigate()
  //      navigate('...')  →  router.push('...')
  if (src.includes('useRouter') && src.includes('useNavigate')) {
    src = src.replace(/const\s+navigate\s*=\s*useNavigate\(\)/, 'const router = useRouter()')
    src = src.replace(/\bnavigate\(/g, 'router.push(')
    changes.push('navigate() → router.push()')
  }

  // 5. Link `to=` → `href=`
  if (src.includes(`from 'next/link'`)) {
    src = src.replace(/<Link([^>]*?)\sto=/g, '<Link$1 href=')
    changes.push('<Link to= → <Link href=')
  }

  if (src !== original) {
    fs.writeFileSync(file, src, 'utf8')
    touched++
    report.push(`✅ ${file}`)
    changes.forEach(c => report.push(`     - ${c}`))
  }
}

console.log(report.join('\n'))
console.log(`\n📝 ${touched} file(s) converted.`)
console.log('\n⚠️  Manual review needed for:')
console.log('   - Any remaining `useNavigate()` where the var name is not `navigate`')
console.log('   - `useLocation()` usages — swap to `usePathname()` + `useSearchParams()` manually')
console.log('   - `navigate(-1)` → `router.back()`')