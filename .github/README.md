--teste
# GitHub Actions Workflows - Release e Deploy

Este repositório contém workflows automatizados para release e deploy de imagens Docker.

## 🚀 Workflows Disponíveis

### **1. `release.yml` - Release Semântico com go-semantic-release**
**Trigger:** Push para branch `main`

**Funcionalidades:**
- ✅ **Release automático** usando `go-semantic-release/action@v1`
- 🏷️ Criação automática de tags e releases
- 🐳 Build e push da imagem Docker para GitHub Container Registry
- 🔄 Versionamento semântico baseado em commits

**Como funciona:**
1. Analisa commits automaticamente
2. Determina versão baseada em Conventional Commits
3. Cria release no GitHub
4. Build e push da imagem Docker

### **2. `simple-release.yml` - Release Simples com ncipollo/release-action**
**Trigger:** Push para branch `main`

**Funcionalidades:**
- 🎯 Release simples baseado no commit SHA
- 🐳 Build Docker básico
- 🏷️ Tags: `latest` e `{commit-sha}`

## 🎯 Como Funciona o go-semantic-release

### **Conventional Commits:**
- `feat:` → **Minor** version (1.0.0 → 1.1.0)
- `fix:` → **Patch** version (1.0.0 → 1.0.1)
- `BREAKING CHANGE:` → **Major** version (1.0.0 → 2.0.0)
- `docs:`, `style:`, `refactor:`, `test:`, `chore:` → **Patch**

### **Exemplos de Commits:**
```bash
git commit -m "feat: add payment processing"
git commit -m "fix: resolve authentication bug"
git commit -m "docs: update API documentation"
git commit -m "feat!: BREAKING CHANGE: remove legacy API"
git commit -m "chore: update dependencies"
```

## ⚙️ Configuração Necessária

### **1. Permissões do Repositório**
```yaml
# Settings > Actions > General > Workflow permissions
Contents: Write ✅
Packages: Write ✅
```

### **2. Package.json (Opcional)**
```json
{
  "name": "seu-projeto",
  "version": "1.0.0"
}
```

### **3. Secrets**
- `GITHUB_TOKEN` - Automático, não precisa configurar

## 🔄 Fluxo de Trabalho

### **1. Desenvolvimento:**
```bash
git checkout -b feature/nova-funcionalidade
# Fazer commits seguindo Conventional Commits
git commit -m "feat: add new feature"
git push origin feature/nova-funcionalidade
```

### **2. Merge para Main:**
- Merge para main dispara o workflow
- go-semantic-release analisa commits
- Nova versão é criada automaticamente
- Release é criado no GitHub
- Imagem Docker é buildada e publicada

### **3. Resultado:**
- 🏷️ Tag `v1.1.0` criado automaticamente
- 📝 Release no GitHub com changelog
- 🐳 Imagem Docker `ghcr.io/repo:latest` e `ghcr.io/repo:v1.1.0`

## 🎨 Estrutura de Tags Docker

### **Tags Automáticas:**
- `latest` - Última versão da branch main
- `v1.2.3` - Versão específica
- `1.2` - Major.Minor
- `1` - Major
- `main` - Branch atual

## 🚨 Troubleshooting

### **Problema: Workflow não executa**
- ✅ Verifique se está fazendo push para `main`
- ✅ Confirme permissões do repositório

### **Problema: Release não é criado**
- ✅ Verifique se há commits com padrão Conventional Commits
- ✅ Confirme se não há tags duplicadas

### **Problema: Docker build falha**
- ✅ Verifique se o Dockerfile está correto
- ✅ Confirme permissões para GitHub Container Registry

## 🔧 Alternativas

### **1. Release Manual com Tags**
```yaml
on:
  push:
    tags:
      - 'v*'
```

### **2. Release por Pull Request**
```yaml
on:
  pull_request:
    types: [closed]
    branches: [main]
```

### **3. Release Programado**
```yaml
on:
  schedule:
    - cron: '0 0 * * 1'  # Toda segunda-feira
```

## 🎯 Recomendação

Use o **`release.yml`** como workflow principal pois oferece:
- 🚀 **go-semantic-release** - Solução robusta e testada
- 🏷️ **Versionamento automático** - Baseado em commits reais
- 🐳 **Build Docker integrado** - Deploy automático
- 🔒 **Segurança** - Permissões adequadas
- 📊 **Performance** - Cache otimizado

O `go-semantic-release` é uma solução Go nativa que oferece:
- ✅ **Zero configuração** para casos básicos
- 🔧 **Configuração flexível** para casos avançados
- 🧪 **Testado em produção** por milhares de projetos
- 📚 **Documentação excelente** e comunidade ativa
- 🔄 **Integração nativa** com GitHub Actions

## 📋 Vantagens das Actions Escolhidas

### **go-semantic-release/action@v1:**
- ✅ Análise inteligente de commits
- ✅ Versionamento semântico automático
- ✅ Suporte a Conventional Commits
- ✅ Configuração mínima

### **ncipollo/release-action@v1:**
- ✅ Simples e direto
- ✅ Release baseado em commit SHA
- ✅ Configuração mínima
- ✅ Ideal para projetos simples

Agora seu projeto tem workflows de release simples e eficientes! 🎉
