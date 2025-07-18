import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import DefineOptions from 'unplugin-vue-define-options/vite'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
import vuetify from 'vite-plugin-vuetify'
import ViteYaml from '@modyfi/vite-plugin-yaml'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vuetify({
      styles: {
        configFile: 'src/styles/variables/_vuetify.scss',
      },
    }),
    Pages({}),
    Layouts(),
    Components({
      dirs: ['src/@core/components', 'src/components'],
      extensions: ['vue'],
      dts: true,
    }),
    AutoImport({
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
      },
      imports: ['vue', 'vue-router', '@vueuse/core', 'vue-i18n', 'pinia'],
      vueTemplate: true,
    }),
    DefineOptions(),
    ViteYaml(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@core': fileURLToPath(new URL('./src/@core', import.meta.url)),
      '@layouts': fileURLToPath(new URL('./src/@layouts', import.meta.url)),
      '@configured-variables': fileURLToPath(new URL('./src/styles/variables/_template.scss', import.meta.url)),
      '@axios': fileURLToPath(new URL('./src/plugins/axios', import.meta.url)),
      'apexcharts': fileURLToPath(new URL('node_modules/apexcharts-clevision', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 5000,
  },
  optimizeDeps: {
    exclude: ['vuetify'],
    entries: [
      './src/**/*.vue',
    ],
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
    proxy: {
      // 예: /userInfos → http://localhost:8088/userInfos 로 프록시
      '/userInfos': {
        target: 'http://localhost:8088',
        changeOrigin: true,
      },
      '/authors': {
        target: 'http://localhost:8088',
        changeOrigin: true,
      },
      '/scripts': {
        target: 'http://localhost:8088',
        changeOrigin: true,
      },
      '/books': {
        target: 'http://localhost:8088',
        changeOrigin: true,
      },
      '/readings': {
        target: 'http://localhost:8088',
        changeOrigin: true,
      },
      '/points': {
        target: 'http://localhost:8088',
        changeOrigin: true,
      },
      '/publishings': {
        target: 'http://localhost:8088',
        changeOrigin: true,
      },
      '/getAllLibraries': {
        target: 'http://localhost:8088',
        changeOrigin: true,
      },
      '/getAllPoints': {
        target: 'http://localhost:8088',
        changeOrigin: true,
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern'
      }
    }
  }
})