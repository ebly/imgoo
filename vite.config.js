import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { readFileSync, existsSync } from 'fs'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  server: {
    host: '0.0.0.0'
  },
  plugins: [
    vue(),
    {
      name: 'ort-static',
      configureServer(server) {
        server.middlewares.use('/ort/', (req, res, next) => {
          if (!req.url || req.url === '/') return next()
          const urlPath = req.url.split('?')[0] // strip query params
          const filePath = resolve('.ort-files', '.' + urlPath)
          if (existsSync(filePath)) {
            const content = readFileSync(filePath)
            const ext = urlPath.split('.').pop()
            const mime = ext === 'wasm' ? 'application/wasm' :
                         ext === 'mjs' ? 'text/javascript' :
                         ext === 'js' ? 'text/javascript' :
                         'application/octet-stream'
            res.setHeader('Content-Type', mime)
            res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
            res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.end(content)
          } else {
            next()
          }
        })
      }
    },
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts'
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts'
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/assets/styles/variables.scss" as *;
          @use "@/assets/styles/responsive.scss" as *;
        `
      }
    }
  },
  base: '/'
})
