import { basename, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))

function getCssHash(css: string) {
  let hash = 5381
  let index = css.length

  while (index) {
    hash = (hash * 33) ^ css.charCodeAt(--index)
  }

  return (hash >>> 0).toString(36).slice(0, 5)
}

function getLineNumber(className: string, css: string) {
  const index = css.indexOf(`.${className}`)

  return css.slice(0, Math.max(0, index)).split(/[\r\n]/).length
}

function generateScopedName(className: string, filename: string, css: string) {
  const styleName = basename(filename).replace(/\.module\.\w+$/, '')
  const safeStyleName = styleName.replace(/[^a-zA-Z0-9_-]/g, '_')
  const hash = getCssHash(css)
  const lineNumber = getLineNumber(className, css)

  return `${safeStyleName}_${className}_${hash}_${lineNumber}`
}

export default defineConfig({
  base: '/TimeManager/',
  resolve: {
    alias: {
      '@state': resolve(projectRoot, 'src/state'),
      '@kit': resolve(projectRoot, 'src/kit'),
      '@components': resolve(projectRoot, 'src/components'),
      '@utils': resolve(projectRoot, 'src/utils'),
    },
  },
  css: {
    modules: {
      generateScopedName,
    },
  },
  plugins: [react()],
})
