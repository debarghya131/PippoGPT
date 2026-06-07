import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          maxSize: 300000,
          groups: [
            {
              name: "clerk",
              test: /node_modules[\\/]@clerk/,
              priority: 30,
            },
            {
              name: "markdown",
              test: /node_modules[\\/](react-markdown|rehype|remark|unified|highlight\.js)/,
              priority: 20,
            },
            {
              name: "react",
              test: /node_modules[\\/](react|react-dom|scheduler)/,
              priority: 20,
            },
            {
              name: "vendor",
              test: /node_modules/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
})
