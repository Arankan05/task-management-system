import { config } from 'dotenv'
import { resolve } from 'path'
import { defineConfig, env } from 'prisma/config'

const root = resolve(__dirname)

config({ path: resolve(root, '.env') })
config({ path: resolve(root, 'backend', '.env') })

export default defineConfig({
  schema: resolve(root, 'prisma/schema.prisma'),
  migrations: {
    path: resolve(root, 'prisma/migrations'),
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
