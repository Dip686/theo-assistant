/**
 * Google OAuth2 authentication for Calendar API.
 *
 * Flow:
 * 1. User clicks "Connect" in Settings
 * 2. Opens a BrowserWindow with Google's consent screen
 * 3. User authorizes → redirects to loopback with auth code
 * 4. Exchange code for tokens
 * 5. Store refresh token in ~/.theo/google-auth.json
 */

import { BrowserWindow } from 'electron'
import { google } from 'googleapis'
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import http from 'http'

const DATA_DIR = join(homedir(), '.theo')
const TOKEN_FILE = join(DATA_DIR, 'google-auth.json')

// OAuth2 client credentials — for a desktop app these are not secret
// Users can also set their own via environment variables
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '461652737025-placeholder.apps.googleusercontent.com'
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'placeholder-secret'
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

interface StoredTokens {
  access_token: string
  refresh_token: string
  expiry_date: number
  email?: string
}

let cachedTokens: StoredTokens | null = null

function createOAuth2Client(redirectUri?: string) {
  return new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    redirectUri || 'http://localhost:0'
  )
}

/**
 * Check if we have stored tokens (user previously connected)
 */
export function isConnected(): boolean {
  return loadTokens() !== null
}

/**
 * Get the connected email address
 */
export function getConnectedEmail(): string | undefined {
  return loadTokens()?.email
}

/**
 * Load tokens from disk
 */
function loadTokens(): StoredTokens | null {
  if (cachedTokens) return cachedTokens

  if (existsSync(TOKEN_FILE)) {
    try {
      const raw = readFileSync(TOKEN_FILE, 'utf-8')
      cachedTokens = JSON.parse(raw)
      return cachedTokens
    } catch {
      return null
    }
  }
  return null
}

/**
 * Save tokens to disk
 */
function saveTokens(tokens: StoredTokens): void {
  cachedTokens = tokens
  writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2), 'utf-8')
}

/**
 * Get an authenticated OAuth2 client with valid tokens.
 * Returns null if not connected.
 */
export function getAuthClient(): ReturnType<typeof createOAuth2Client> | null {
  const tokens = loadTokens()
  if (!tokens) return null

  const client = createOAuth2Client()
  client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date,
  })

  // Auto-refresh on token expiry
  client.on('tokens', (newTokens) => {
    const updated = { ...tokens }
    if (newTokens.access_token) updated.access_token = newTokens.access_token
    if (newTokens.expiry_date) updated.expiry_date = newTokens.expiry_date
    saveTokens(updated)
  })

  return client
}

/**
 * Start the OAuth2 flow in a BrowserWindow.
 * Returns the connected email on success.
 */
export async function connectGoogleCalendar(): Promise<string> {
  return new Promise((resolve, reject) => {
    // Start a temporary local server to receive the OAuth callback
    const server = http.createServer()

    server.listen(0, '127.0.0.1', () => {
      const port = (server.address() as { port: number }).port
      const redirectUri = `http://127.0.0.1:${port}/callback`
      const oauth2Client = createOAuth2Client(redirectUri)

      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent', // Always show consent to get refresh_token
      })

      // Handle the callback
      server.on('request', async (req, res) => {
        if (!req.url?.startsWith('/callback')) return

        const url = new URL(req.url, `http://127.0.0.1:${port}`)
        const code = url.searchParams.get('code')
        const error = url.searchParams.get('error')

        if (error || !code) {
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end('<html><body><h2>Authorization failed</h2><p>You can close this window.</p></body></html>')
          server.close()
          authWindow?.close()
          reject(new Error(error || 'No auth code received'))
          return
        }

        try {
          const { tokens } = await oauth2Client.getToken(code)
          oauth2Client.setCredentials(tokens)

          // Get user email
          const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
          const userInfo = await oauth2.userinfo.get()
          const email = userInfo.data.email || 'unknown'

          saveTokens({
            access_token: tokens.access_token || '',
            refresh_token: tokens.refresh_token || '',
            expiry_date: tokens.expiry_date || 0,
            email,
          })

          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end(`<html><body><h2>Connected!</h2><p>Theo is now connected to ${email}. You can close this window.</p></body></html>`)
          server.close()
          authWindow?.close()
          resolve(email)
        } catch (err) {
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end('<html><body><h2>Error</h2><p>Failed to exchange token. You can close this window.</p></body></html>')
          server.close()
          authWindow?.close()
          reject(err)
        }
      })

      // Open the auth URL in a BrowserWindow
      let authWindow: BrowserWindow | null = new BrowserWindow({
        width: 500,
        height: 700,
        title: 'Connect Google Calendar',
        autoHideMenuBar: true,
      })

      authWindow.loadURL(authUrl)

      authWindow.on('closed', () => {
        authWindow = null
        server.close()
      })
    })
  })
}

/**
 * Disconnect Google Calendar — remove stored tokens
 */
export function disconnectGoogleCalendar(): void {
  cachedTokens = null
  if (existsSync(TOKEN_FILE)) {
    unlinkSync(TOKEN_FILE)
  }
}
