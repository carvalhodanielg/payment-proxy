# Dockerfile simplificado para projeto Bun/TypeScript
FROM oven/bun:1.0-alpine

# Instalar dependências do sistema necessárias
RUN apk add --no-cache git

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json bun.lock ./

# Instalar dependências
RUN bun install

# Copiar código fonte
COPY . .

# Build da aplicação (se necessário)
RUN bun run build

# Configurar variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000
ENV REDIS_URL=redis://redis:6379
ENV PROCESSOR_PRIMARY=http://processor-primary
ENV PROCESSOR_FALLBACK=http://processor-fallback

# Expor porta
EXPOSE 3000

# Comando padrão
CMD ["bun", "index.ts"]
