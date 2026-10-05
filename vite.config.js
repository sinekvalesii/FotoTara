import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// CSP yalnızca üretim derlemesine eklenir (geliştirme sunucusu satır içi betik kullanır).
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'"
const csp = { name: 'csp', apply: 'build', transformIndexHtml: h => h.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n<meta http-equiv="Content-Security-Policy" content="${CSP}" />`) }

export default defineConfig({ plugins: [react(), csp], base: './', build: { sourcemap: false } })
