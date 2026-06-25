require("dotenv").config();
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const url = new URL(process.env.DATABASE_URL);
url.searchParams.set('allowPublicKeyRetrieval', 'true');

const adapter = new PrismaMariaDb(url.toString());
const prisma = new PrismaClient({
  adapter,
  log: ['error'],
});

module.exports = prisma;