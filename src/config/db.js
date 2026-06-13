require("dotenv").config();
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const url = new URL(process.env.DATABASE_URL);
url.searchParams.set('allowPublicKeyRetrieval', 'true');

const adapter = new PrismaMariaDb(url.toString());
const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

module.exports = prisma;
