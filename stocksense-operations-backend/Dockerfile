FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY tsconfig*.json nest-cli.json prisma7.config.ts ./
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
COPY scripts ./scripts
RUN npm run build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/prisma7.config.ts ./prisma7.config.ts
EXPOSE 3001
CMD ["sh", "-c", "npm run db:deploy && node scripts/ensure-db-safety.cjs && node dist/main.js"]
