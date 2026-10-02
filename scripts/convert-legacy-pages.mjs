// scripts/convert-legacy-pages.mjs
import fs from 'node:fs'
import path from 'node:path'

const ROOT = 'pages-legacy'
const files = fs.readdirSync(ROOT).filter(f => f.endsWith('.jsx'))
const report = []

for (const file of files) {
  const full = path.join(ROOT, file)
  let src = fs.readFileSync(full, 'utf8')
  const original = src
  const changes = []

  // 1. Add "use client" if missing
  if (!src.startsWith('"use client"') && !src.startsWith("'use client'")) {
    src = `"use client"\n\n${src}`
    changes.push('added "use client"')
  }

  // 2. Rewrite react-router-dom imports
  // Combined: import { Link, useNavigate, useLocation } from 'react-router-dom'
  src = src.replace(
    /import\s*\{([^}]+)\}\s*from\s*['"]react-router-dom['"];?/g,
    (m, names) => {
      const list = names.split(',').map(s => s.trim()).filter(Boolean)
      const out = []
      if (list.includes('Link')) out.push(`import Link from 'next/link'`)
      const nav = list.filter(n => n !== 'Link')
      if (nav.includes('useNavigate')) {
        out.push(`import { useRouter } from 'next/navigation'`)
        changes.push('useNavigate → useRouter')
      }
      const rest = nav.filter(n => n !== 'useNavigate')
      if (rest.length) {
        out.push(`import { ${rest.join(', ')} } from 'next/navigation'`)
        changes.push(`${rest.join(', ')} → next/navigation`)
      }
      return out.join('\n')
    }
  )

  // 3. navigate( → router.push( , useNavigate() → useRouter()
  if (src.includes('useRouter') && /const\s+navigate\s*=\s*useNavigate\(\)/.test(src)) {
    src = src.replace(/const\s+navigate\s*=\s*useNavigate\(\)/, 'const router = useRouter()')
    src = src.replace(/\bnavigate\(/g, 'router.push(')
    changes.push('navigate() → router.push()')
  }

  // 4. Link to= → href=
  if (src.includes(`from 'next/link'`) || src.includes(`from "next/link"`)) {
    src = src.replace(/<Link([^>]*?)\sto=/g, '<Link$1 href=')
    src = src.replace(/<Link\s+to=/g, '<Link href=')
    changes.push('<Link to= → href=')
  }

  // 5. import.meta.env → process.env
  if (src.includes('import.meta.env.VITE_API_URL')) {
    src = src.replace(
      /import\.meta\.env\.VITE_API_URL/g,
      `(process.env.NEXT_PUBLIC_API_URL || 'https://api.turnapp.events/api')`
    )
    changes.push('import.meta.env.VITE_API_URL → process.env.NEXT_PUBLIC_API_URL')
  }
  if (src.includes('import.meta.env.VITE_')) {
    src = src.replace(/import\.meta\.env\.VITE_([A-Z_]+)/g, 'process.env.NEXT_PUBLIC_$1')
    changes.push('remaining import.meta.env.VITE_* → process.env.NEXT_PUBLIC_*')
  }

  // 6. Relative imports → @/
  src = src.replace(/from\s*['"]\.\.\/services\//g, "from '@/lib/services/")
  src = src.replace(/from\s*['"]\.\.\/utils\//g, "from '@/lib/utils/")
  src = src.replace(/from\s*['"]\.\.\/lib\//g, "from '@/lib/")
  src = src.replace(/from\s*['"]\.\.\/components\//g, "from '@/components/")
  src = src.replace(/from\s*['"]\.\.\/hooks\//g, "from '@/hooks/")

  if (src !== original) {
    fs.writeFileSync(full, src, 'utf8')
    report.push(`✅ ${file}`)
    ;[...new Set(changes)].forEach(c => report.push(`     - ${c}`))
  }
}

console.log(report.join('\n'))
console.log(`\n📝 ${files.length} file(s) processed.`)