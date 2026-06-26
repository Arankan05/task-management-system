FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Copy Prisma and configuration BEFORE npm install
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

# Install root dependencies (which includes dotenv, prisma, etc. for config resolution)
RUN npm install

# Install backend dependencies without running the postinstall script
RUN npm install --prefix backend --ignore-scripts

# Copy backend source
COPY backend ./backend

# Generate Prisma Client
RUN cd backend && DATABASE_URL=mysql://dummy:3306/dummy npx prisma generate --config ../prisma.config.ts

EXPOSE 5000

WORKDIR /app/backend

CMD ["node", "src/app.js"]