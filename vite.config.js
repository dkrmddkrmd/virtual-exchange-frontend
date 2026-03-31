import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            // /upbit-api 로 시작하는 요청은 업비트로 우회시킵니다.
            '/upbit-api': {
                target: 'https://api.upbit.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/upbit-api/, '')
            }
        }
    }
})