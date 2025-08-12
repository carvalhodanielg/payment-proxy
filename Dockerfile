# Multi-stage Dockerfile para projeto Bun/TypeScript
# Stage 1: Build stage
FROM oven/bun:1.0-alpine AS builder

# Instalar dependências do sistema necessárias
RUN apk add --no-cache \
    git \
    && rm -rf /var/cache/apk/*

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json bun.lock ./

# Instalar dependências
RUN bun install --frozen-lockfile --production=false

# Copiar código fonte
COPY . .

# Build da aplicação (se necessário)
RUN bun run build

# Stage 2: Production stage
FROM oven/bun:1.0-alpine AS production

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S bunjs -u 1001

# Instalar dependências do sistema necessárias para produção
RUN apk add --no-cache \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Definir diretório de trabalho
WORKDIR /app

# Copiar apenas arquivos necessários do builder
COPY --from=builder --chown=bunjs:nodejs /app/package.json ./
COPY --from=builder --chown=bunjs:nodejs /app/bun.lock ./

# Instalar apenas dependências de produção
RUN bun install --frozen-lockfile --production

# Copiar código compilado e arquivos necessários
COPY --from=builder --chown=bunjs:nodejs /app/dist ./dist
COPY --from=builder --chown=bunjs:nodejs /app/src ./src
COPY --from=builder --chown=bunjs:nodejs /app/index.ts ./

# Configurar variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000
ENV REDIS_URL=redis://redis:6379
ENV PROCESSOR_PRIMARY=http://processor-primary
ENV PROCESSOR_FALLBACK=http://processor-fallback

# Expor porta
EXPOSE 3000

# Mudar para usuário não-root
USER bunjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD bun run health-check || exit 1

# Usar dumb-init para gerenciar processos
ENTRYPOINT ["dumb-init", "--"]

# Comando padrão
CMD ["bun", "index.ts"]
