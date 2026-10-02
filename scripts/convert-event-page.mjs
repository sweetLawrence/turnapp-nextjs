// scripts/convert-event-page.mjs
import fs from 'node:fs'
import path from 'node:path'

const target = path.resolve('app/e/[identifier]/EventDetailsClient.jsx')

if (!fs.existsSync(target)) {
  console.error(`❌ File not found: ${target}`)
  process.exit(1)
}

let src = fs.readFileSync(target, 'utf8')
const original = src
const log = []

// ---------- 1. Add "use client" at top if missing ----------
if (!src.startsWith('"use client"')) {
  src = `"use client"\n\n${src}`
  log.push('✅ Added "use client"')
}

// ---------- 2. Fix react-router-dom import line ----------
src = src.replace(
  /import\s*\{\s*useParams,\s*useNavigate,\s*useSearchParams\s*\}\s*from\s*['"]react-router-dom['"];?/,
  `import { useParams, useSearchParams, useRouter } from 'next/navigation'`
)
log.push('✅ Replaced react-router-dom imports')

// ---------- 3. Remove Helmet import ----------
src = src.replace(
  /import\s*\{\s*Helmet\s*\}\s*from\s*['"]react-helmet-async['"];?\s*\n?/,
  ''
)
log.push('✅ Removed Helmet import')

// ---------- 4. Rewrite relative imports to @/ aliases ----------
src = src.replace(/from\s*['"]\.\.\/utils\//g, "from '@/lib/utils/")
src = src.replace(/from\s*['"]\.\.\/services\//g, "from '@/lib/services/")
src = src.replace(/from\s*['"]\.\.\/components\//g, "from '@/components/")
src = src.replace(/from\s*['"]\.\.\/hooks\//g, "from '@/hooks/")
src = src.replace(/from\s*['"]\.\.\/data\//g, "from '@/data/")
log.push('✅ Rewrote relative imports to @/ aliases')

// ---------- 5. Change component signature ----------
// const EventDetailsPage = () => {  →  const EventDetailsClient = ({ event: initialEvent }) => {
src = src.replace(
  /const\s+EventDetailsPage\s*=\s*\(\s*\)\s*=>\s*\{/,
  'const EventDetailsClient = ({ event: initialEvent }) => {'
)
log.push('✅ Renamed component to EventDetailsClient with event prop')

// ---------- 6. Change default export ----------
src = src.replace(
  /export\s+default\s+EventDetailsPage\s*;?\s*$/m,
  'export default EventDetailsClient'
)
log.push('✅ Fixed default export')

// ---------- 7. useNavigate -> useRouter, navigate( -> router.push( ----------
src = src.replace(/const\s+navigate\s*=\s*useNavigate\(\)/, 'const router = useRouter()')
src = src.replace(/\bnavigate\(/g, 'router.push(')
log.push('✅ Replaced useNavigate / navigate() with useRouter / router.push()')

// ---------- 8. Replace `const [event, setEvent] = useState(null)` with initialEvent ----------
src = src.replace(
  /const\s+\[\s*event\s*,\s*setEvent\s*\]\s*=\s*useState\(null\)/,
  'const [event, setEvent] = useState(initialEvent)'
)
log.push('✅ Initialized event state with server prop')

// ---------- 9. Delete the useEffect that loads the event ----------
// Pattern: useEffect(() => { if (lastLoadedRef.current === identifier) return ... }, [identifier])
// We'll do this with a regex that matches from `// ========== LOAD EVENT ==========` down to the closing of that useEffect.
src = src.replace(
  /\/\/\s*=+\s*LOAD EVENT\s*=+[\s\S]*?\n\s*\}\s*,\s*\[\s*identifier\s*\]\s*\)\s*\n/,
  ''
)
log.push('✅ Removed the LOAD EVENT useEffect')

// ---------- 10. Delete the loadEvent function ----------
// Matches: const loadEvent = async () => { ... }
// Greedy stop at the next top-level `const X = ` or `// ==========`
src = src.replace(
  /const\s+loadEvent\s*=\s*async\s*\(\s*\)\s*=>\s*\{[\s\S]*?\n\s*\}\s*\n/,
  ''
)
log.push('✅ Removed the loadEvent function')

// ---------- 11. Delete the document.title useEffect ----------
src = src.replace(
  /\/\/\s*=+\s*DOCUMENT TITLE\s*=+[\s\S]*?\n\s*\}\s*,\s*\[\s*event\s*\]\s*\)\s*\n/,
  ''
)
log.push('✅ Removed the DOCUMENT TITLE useEffect')

// ---------- 12. Delete the <Helmet>...</Helmet> JSX block ----------
src = src.replace(/<Helmet>[\s\S]*?<\/Helmet>\s*\n?/g, '')
log.push('✅ Removed <Helmet>...</Helmet> block')

// ---------- 13. Fix navigate('/checkout', { state: {...} }) ----------
// Too structural to safely regex — flag it for manual review.
const hasCheckoutNav = /router\.push\(\s*['"]\/checkout['"]/.test(src)
if (hasCheckoutNav) {
  log.push('⚠️  FOUND router.push("/checkout") — you must manually wrap it with sessionStorage (see notes below)')
}

// ---------- Report ----------
if (src === original) {
  console.log('ℹ️  No changes made (already converted?)')
} else {
  fs.writeFileSync(target, src, 'utf8')
  console.log(log.join('\n'))
  console.log(`\n📝 Wrote: ${target}`)
  console.log(`📏 ${original.length} → ${src.length} chars (removed ${original.length - src.length})`)
  console.log('\n🧪 Next: open the file in VS Code and search for:')
  console.log('   - "lastLoadedRef" (should be gone or only in comments)')
  console.log('   - "Helmet" (should be gone entirely)')
  console.log('   - "router.push(\'/checkout\'" (needs manual sessionStorage wrap)')
  console.log('   - "response.canonical_slug" (delete that block — server handles it now)')
}