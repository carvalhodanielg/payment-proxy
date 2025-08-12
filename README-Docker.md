# Docker Setup para Projeto de Pagamentos

Este projeto inclui uma configuração Docker completa para desenvolvimento e produção.

## 🚀 Início Rápido

### Desenvolvimento
```bash
# Construir e subir todos os serviços
make build
make up

# Ou usar docker-compose diretamente
docker-compose up -d
```

### Produção
```bash
# Usar configurações de produção
make prod

# Ou manualmente
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 📁 Arquivos Docker

- **`Dockerfile`** - Imagem multi-stage otimizada para Bun/TypeScript
- **`.dockerignore`** - Exclusões para otimizar o build
- **`docker-compose.yml`** - Configuração completa para desenvolvimento
- **`docker-compose.prod.yml`** - Configurações de produção
- **`Makefile`** - Comandos úteis para gerenciar o Docker
- **`health-check.js`** - Script de verificação de saúde

## 🛠️ Comandos Make

```bash
make help      # Ver todos os comandos disponíveis
make build     # Construir imagens Docker
make up        # Subir serviços
make down      # Parar serviços
make logs      # Ver logs da aplicação
make clean     # Limpar tudo (containers, volumes, imagens)
make test      # Testar endpoints da aplicação
make health    # Verificar saúde dos serviços
make dev       # Modo desenvolvimento (só Redis)
make scale     # Escalar aplicação para 3 instâncias
```

## 🔧 Serviços

### Aplicação Principal (`app`)
- **Porta**: 3000
- **Runtime**: Bun 1.0 Alpine
- **Health Check**: Automático a cada 30s
- **Usuário**: Não-root (bunjs:1001)

### Redis (`redis`)
- **Porta**: 6379
- **Versão**: 7 Alpine
- **Persistência**: AOF habilitado
- **Volume**: `redis_data`

### Processadores Mock
- **Primary**: Porta 3001
- **Fallback**: Porta 3002
- **Apenas em desenvolvimento**

### Redis Commander (Opcional)
- **Porta**: 8081
- **Interface web** para gerenciar Redis
- **Apenas em desenvolvimento**

## 🌍 Variáveis de Ambiente

```bash
NODE_ENV=production
PORT=3000
REDIS_URL=redis://redis:6379
PROCESSOR_PRIMARY=http://processor-primary:3001
PROCESSOR_FALLBACK=http://processor-fallback:3002
```

## 📊 Monitoramento

### Health Checks
- **App**: `/payments/service-health`
- **Redis**: `redis-cli ping`
- **Docker**: Automático com restart policies

### Logs
```bash
# Ver logs da aplicação
make logs

# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f app
```

## 🧪 Testando

```bash
# Testar todos os endpoints
make test

# Testar manualmente
curl http://localhost:3000/payments/service-health
curl -X POST http://localhost:3000/payments \
  -H "Content-Type: application/json" \
  -d '{"correlationId":"test-123","amount":19.90}'
```

## 🔒 Segurança

- **Usuário não-root**: Aplicação roda como `bunjs:1001`
- **Multi-stage build**: Imagem final menor e mais segura
- **Alpine Linux**: Base mínima para reduzir vulnerabilidades
- **dumb-init**: Gerenciamento correto de processos

## 📈 Produção

### Configurações Especiais
- **Recursos limitados**: CPU e memória configurados
- **Replicas**: 2 instâncias da aplicação
- **Rolling updates**: Atualizações sem downtime
- **Restart policies**: Recuperação automática de falhas

### Deploy
```bash
# Produção com Docker Swarm
docker stack deploy -c docker-compose.yml -c docker-compose.prod.yml payments

# Ou com docker-compose
make prod
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Porta já em uso**
   ```bash
   # Verificar portas em uso
   netstat -tulpn | grep :3000
   
   # Parar serviços
   make down
   ```

2. **Redis não conecta**
   ```bash
   # Verificar se Redis está rodando
   docker-compose ps redis
   
   # Ver logs do Redis
   docker-compose logs redis
   ```

3. **Aplicação não inicia**
   ```bash
   # Ver logs da aplicação
   make logs
   
   # Verificar health check
   make health
   ```

### Limpeza
```bash
# Limpar tudo
make clean

# Remover apenas volumes
docker-compose down -v

# Remover imagens não utilizadas
docker image prune -f
```

## 🔄 Desenvolvimento Local

Para desenvolvimento sem Docker (só Redis):
```bash
make dev
bun run dev:watch
```

## 📚 Recursos Adicionais

- [Bun Documentation](https://bun.sh/docs)
- [Docker Multi-stage Builds](https://docs.docker.com/develop/dev-best-practices/multistage-build/)
- [Redis Docker](https://hub.docker.com/_/redis)
- [Docker Compose](https://docs.docker.com/compose/)
