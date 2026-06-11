/**
 * Generate _credentials.ts with Google OAuth credentials baked in.
 * Reads from .env (local dev) or environment variables (CI/GitHub Secrets).
 * Run before build: npm run prebuild
 */
const { writeFileSync } = require('fs')
const { resolve } = require('path')

try { require('dotenv').config() } catch { /* .env or dotenv not available */ }

const credPath = resolve(__dirname, '../src/main/calendar/_credentials.ts')

writeFileSync(credPath,
  `// Auto-generated at build time — DO NOT EDIT OR COMMIT\n` +
  `export const GOOGLE_CLIENT_ID = ${JSON.stringify(process.env.GOOGLE_CLIENT_ID || '')}\n` +
  `export const GOOGLE_CLIENT_SECRET = ${JSON.stringify(process.env.GOOGLE_CLIENT_SECRET || '')}\n`
)

console.log('Credentials generated:', process.env.GOOGLE_CLIENT_ID ? 'with ID' : 'empty (no env vars)')
