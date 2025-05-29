# 🔧 Guia de Configuração - Variáveis de Ambiente (.env)

## 📋 Arquivo .env Principal

Copie o arquivo de exemplo e configure suas variáveis:

```bash
cp .env.example .env
nano .env
```

## 🗄️ **1. Configuração do Banco de Dados**

```env
# URL de conexão com MongoDB
MONGODB_URI=mongodb://localhost:27017/pandorapro
DATABASE_URL=mongodb://localhost:27017/pandorapro
```

### **Explicação:**
- **Local:** Use `mongodb://localhost:27017/pandorapro`
- **Remoto:** Use `mongodb://usuario:senha@servidor:27017/pandorapro`
- **Atlas:** Use a string de conexão do MongoDB Atlas

### **Exemplos:**
```env
# MongoDB Local
MONGODB_URI=mongodb://localhost:27017/pandorapro

# MongoDB com Autenticação
MONGODB_URI=mongodb://admin:senha123@localhost:27017/pandorapro

# MongoDB Atlas
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/pandorapro

# Docker MongoDB
MONGODB_URI=mongodb://mongo:27017/pandorapro
```

---

## 🔐 **2. Configuração JWT**

```env
# Chave secreta para tokens JWT (mínimo 32 caracteres)
JWT_SECRET=seu-jwt-secret-super-seguro-aqui-min-32-chars
```

### **Explicação:**
- **Obrigatório:** Mínimo 32 caracteres
- **Geração:** Use um gerador de senhas seguras
- **Importante:** Nunca compartilhe esta chave

### **Como Gerar:**
```bash
# Gerar chave aleatória (Linux/Mac)
openssl rand -base64 32

# Gerar chave aleatória (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🤖 **3. Configuração Evolution API**

```env
# URL da Evolution API (onde ela está rodando)
EVOLUTION_API_URL=http://localhost:8080

# Chave de API da Evolution (deve ser igual ao AUTHENTICATION_APIKEY da Evolution)
EVOLUTION_API_KEY=B6D711FCDE4D4FD5936544120E713976
```

### **Explicação:**
- **EVOLUTION_API_URL:** Onde sua Evolution API está rodando
- **EVOLUTION_API_KEY:** Deve ser **EXATAMENTE** igual ao `AUTHENTICATION_APIKEY` da Evolution API

### **Configurações por Ambiente:**
```env
# Desenvolvimento Local
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=B6D711FCDE4D4FD5936544120E713976

# Servidor Local (IP interno)
EVOLUTION_API_URL=http://192.168.1.100:8080
EVOLUTION_API_KEY=B6D711FCDE4D4FD5936544120E713976

# Produção
EVOLUTION_API_URL=https://api.seudominio.com
EVOLUTION_API_KEY=sua-chave-de-producao-super-segura
```

### **⚠️ IMPORTANTE:**
A `EVOLUTION_API_KEY` deve ser a **mesma** nos dois projetos:
- **Evolution API:** `AUTHENTICATION_APIKEY=B6D711FCDE4D4FD5936544120E713976`
- **PandoraPro:** `EVOLUTION_API_KEY=B6D711FCDE4D4FD5936544120E713976`

---

## 🔗 **4. Configuração Webhook**

```env
# Chave secreta para validar webhooks recebidos
WEBHOOK_SECRET=webhook-secret-key
```

### **Explicação:**
- **Uso:** Validar que os webhooks vêm realmente da Evolution API
- **Opcional:** Mas recomendado para segurança
- **Geração:** Use uma chave única e segura

---

## 🌐 **5. Configuração da Aplicação**

```env
# Chave secreta para NextAuth (se usar autenticação externa)
NEXTAUTH_SECRET=nextauth-secret-key

# URL base da aplicação
NEXTAUTH_URL=http://localhost:3000
```

### **Explicação:**
- **NEXTAUTH_SECRET:** Para futuras integrações de autenticação
- **NEXTAUTH_URL:** URL base onde sua aplicação está rodando

### **Por Ambiente:**
```env
# Desenvolvimento
NEXTAUTH_URL=http://localhost:3000

# Produção
NEXTAUTH_URL=https://seudominio.com
```

---

## 🚀 **6. Exemplo Completo por Ambiente**

### **📍 Desenvolvimento Local:**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/pandorapro
DATABASE_URL=mongodb://localhost:27017/pandorapro

# JWT
JWT_SECRET=pandorapro-dev-secret-2024-desenvolvimento-local

# Evolution API
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=B6D711FCDE4D4FD5936544120E713976

# Webhook
WEBHOOK_SECRET=webhook-dev-secret-2024

# App
NEXTAUTH_SECRET=nextauth-dev-secret-2024
NEXTAUTH_URL=http://localhost:3000
```

### **🏢 Servidor de Desenvolvimento:**
```env
# Database
MONGODB_URI=mongodb://192.168.1.50:27017/pandorapro
DATABASE_URL=mongodb://192.168.1.50:27017/pandorapro

# JWT
JWT_SECRET=pandorapro-staging-secret-2024-servidor-desenvolvimento

# Evolution API
EVOLUTION_API_URL=http://192.168.1.100:8080
EVOLUTION_API_KEY=STAGING-API-KEY-2024-DESENVOLVIMENTO

# Webhook
WEBHOOK_SECRET=webhook-staging-secret-2024

# App
NEXTAUTH_SECRET=nextauth-staging-secret-2024
NEXTAUTH_URL=http://192.168.1.200:3000
```

### **🌐 Produção:**
```env
# Database
MONGODB_URI=mongodb+srv://produser:senhasegura@cluster.mongodb.net/pandorapro
DATABASE_URL=mongodb+srv://produser:senhasegura@cluster.mongodb.net/pandorapro

# JWT
JWT_SECRET=pandorapro-production-ultra-secure-secret-2024-never-share

# Evolution API
EVOLUTION_API_URL=https://api.seudominio.com
EVOLUTION_API_KEY=PRODUCTION-SUPER-SECURE-API-KEY-2024

# Webhook
WEBHOOK_SECRET=production-webhook-ultra-secure-2024

# App
NEXTAUTH_SECRET=production-nextauth-ultra-secure-2024
NEXTAUTH_URL=https://seudominio.com
```

---

## ✅ **7. Checklist de Configuração**

### **Antes de Iniciar:**
- [ ] MongoDB está rodando e acessível
- [ ] Evolution API está configurada e rodando
- [ ] Arquivo `.env` foi criado a partir do `.env.example`

### **Configurações Obrigatórias:**
- [ ] `MONGODB_URI` - Conexão com banco funciona
- [ ] `JWT_SECRET` - Mínimo 32 caracteres
- [ ] `EVOLUTION_API_URL` - Evolution API acessível
- [ ] `EVOLUTION_API_KEY` - Mesma chave nos dois projetos

### **Testar Configurações:**
```bash
# Testar MongoDB
mongosh "mongodb://localhost:27017/pandorapro"

# Testar Evolution API
curl http://localhost:8080/

# Iniciar PandoraPro
npm run dev
```

---

## 🐛 **8. Solução de Problemas**

### **Erro: MongoDB Connection Failed**
```
MongoServerError: Authentication failed
```
**Solução:** Verifique usuário/senha no `MONGODB_URI`

### **Erro: Evolution API Unauthorized**
```
Error: Unauthorized (401)
```
**Solução:** Verifique se `EVOLUTION_API_KEY` é igual ao `AUTHENTICATION_APIKEY` da Evolution

### **Erro: JWT Secret Too Short**
```
Error: JWT secret must be at least 32 characters
```
**Solução:** Gere uma nova chave com 32+ caracteres

### **Erro: Cannot Connect to Evolution API**
```
Error: connect ECONNREFUSED 127.0.0.1:8080
```
**Solução:** Verifique se Evolution API está rodando na porta 8080

---

## 🔒 **9. Segurança em Produção**

### **Chaves Seguras:**
- Use geradores de senha para todas as chaves
- Nunca comite o arquivo `.env` no Git
- Use diferentes chaves para dev/staging/produção

### **Exemplo de Geração:**
```bash
# Gerar JWT_SECRET
openssl rand -base64 32

# Gerar EVOLUTION_API_KEY
openssl rand -hex 16 | tr '[:lower:]' '[:upper:]'

# Gerar WEBHOOK_SECRET
openssl rand -base64 24
```

---

## 📁 **10. Estrutura de Arquivos**

```
pandoraprov3/
├── .env                 # Configurações locais (não commitado)
├── .env.example        # Modelo de configuração
├── .env.local          # Alternativa para desenvolvimento
├── .env.production     # Configurações de produção
└── .gitignore          # Inclui .env para não ser commitado
```

**💡 Dica:** Mantenha sempre o `.env.example` atualizado como modelo! 