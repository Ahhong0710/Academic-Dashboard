import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Academic-Dashboard/', // 重点是这一行，必须跟你的 GitHub 仓库名一样
})