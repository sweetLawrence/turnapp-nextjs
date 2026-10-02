// scripts/fix-quotes.mjs
import fs from 'node:fs'
import path from 'node:path'

const dir = 'pages-legacy'
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'))
let fixed = 0

for (const name of files) {
  const full = path.join(dir, name)
  let src = fs.readFileSync(full, 'utf8')
  const original = src

  // `from 'X";` → `from 'X';`
  src = src.replace(/from\s+'([^'"\n]*)";/g, "from '$1';")
  // `from "X';` → `from "X";`
  src = src.replace(/from\s+"([^'"\n]*)';/g, 'from "$1";')

  if (src !== original) {
    fs.writeFileSync(full, src, 'utf8')
    fixed++
    console.log(`✅ fixed ${name}`)
  }
}

console.log(`\n📝 ${fixed} file(s) cleaned.`)