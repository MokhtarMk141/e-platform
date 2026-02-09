import { PrismaConfig } from '@prisma/client/config'
import dotenv from 'dotenv'

dotenv.config()  // load DATABASE_URL from .env

const config: PrismaConfig = {
  client: {
    adapter: 'postgresql',          // your database provider
    url: process.env.DATABASE_URL,  // make sure this exists in .env
  },
}

export default config
