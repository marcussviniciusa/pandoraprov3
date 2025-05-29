# 🚀 Guia de Configuração da Evolution API

## 📋 Pré-requisitos

- Node.js 18+ instalado
- MongoDB rodando (local ou remoto)
- Git instalado

## 🔧 Instalação da Evolution API

### 1. Clonar o Repositório

```bash
git clone -b v2.0.0 https://github.com/EvolutionAPI/evolution-api.git
cd evolution-api
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e configure suas variáveis:

```bash
cp .env.example .env
nano .env
```

### 4. Configurações Mínimas Necessárias

```env
# API Configuration
SERVER_TYPE=http
SERVER_PORT=8080
CORS_ORIGIN=*
CORS_METHODS=POST,GET,PUT,DELETE
CORS_CREDENTIALS=true

# Global API Key (IMPORTANTE!)
AUTHENTICATION_TYPE=bearer
AUTHENTICATION_APIKEY=B6D711FCDE4D4FD5936544120E713976

# Database (MongoDB)
DATABASE_ENABLED=true
DATABASE_PROVIDER=mongodb
DATABASE_CONNECTION_URI=mongodb://localhost:27017/evolution
DATABASE_CONNECTION_DB_PREFIX_NAME=evolution
DATABASE_SAVE_DATA_INSTANCE=true
DATABASE_SAVE_DATA_NEW_MESSAGE=true
DATABASE_SAVE_MESSAGE_UPDATE=true
DATABASE_SAVE_DATA_CONTACTS=true
DATABASE_SAVE_DATA_CHATS=true

# Log Configuration
LOG_LEVEL=ERROR,WARN,DEBUG,INFO,LOG,VERBOSE,DARK,WEBHOOKS
LOG_COLOR=true
LOG_BAILEYS=error

# Webhook Global Configuration
WEBHOOK_GLOBAL_URL=''
WEBHOOK_GLOBAL_ENABLED=false
WEBHOOK_GLOBAL_WEBHOOK_BY_EVENTS=false

# Instance Configuration
DEL_INSTANCE=false
```

### 5. Iniciar a API

```bash
npm run start:prod
```

### 6. Verificar se está Funcionando

Acesse: `http://localhost:8080`

Você deve ver uma resposta JSON como:

```json
{
  "status": 200,
  "message": "Welcome to Evolution API, it is working!",
  "version": "2.x.x",
  "documentation": "http://localhost:8080/docs"
}
```

## 🔑 Configuração da API Key

A Evolution API usa uma chave de autenticação global. No nosso projeto, usamos:

```
EVOLUTION_API_KEY=B6D711FCDE4D4FD5936544120E713976
```

**IMPORTANTE:** Esta chave deve ser a mesma nos dois projetos:
- No arquivo `.env` da Evolution API (`AUTHENTICATION_APIKEY`)
- No arquivo `.env` do PandoraPro (`EVOLUTION_API_KEY`)

## 🎯 Testando a Integração

### 1. Conectar Primeiro WhatsApp

1. Acesse: `http://localhost:3000/whatsapp/connect`
2. Digite um nome para sua instância (ex: `empresa-principal`)
3. Clique em "Criar Instância"
4. Clique em "Gerar QR Code"
5. Escaneie com seu WhatsApp pelo celular
6. Aguarde a conexão ser estabelecida

### 2. Verificar Logs

A Evolution API mostrará logs similares a:

```
[INFO] Instance empresa-principal created
[INFO] QR Code generated for empresa-principal
[INFO] Instance empresa-principal connected
[INFO] Webhook configured for empresa-principal
```

### 3. Testar Envio de Mensagem

Após conectar, envie uma mensagem para o número conectado. A mensagem deve aparecer na interface do chat em tempo real.

## 🐛 Solução de Problemas Comuns

### Erro de Conexão com a API

```
Error: connect ECONNREFUSED 127.0.0.1:8080
```

**Solução:** Verifique se a Evolution API está rodando na porta 8080

### Erro de Autenticação

```
Error: Unauthorized
```

**Solução:** Verifique se a `EVOLUTION_API_KEY` está correta nos dois projetos

### QR Code não Aparece

1. Verifique os logs da Evolution API
2. Tente reiniciar a instância
3. Verifique se o MongoDB está conectado

### Webhook não Funciona

1. Verifique se o webhook foi configurado corretamente
2. O PandoraPro deve estar acessível na URL configurada
3. Verifique os logs do webhook: `http://localhost:8080/webhook/find/[instance]`

## 📱 Usando com ngrok (Desenvolvimento)

Para testar webhooks em desenvolvimento local:

### 1. Instalar ngrok

```bash
npm install -g ngrok
```

### 2. Expor o PandoraPro

```bash
ngrok http 3000
```

### 3. Atualizar Webhook URL

Use a URL do ngrok (ex: `https://abc123.ngrok.io/api/whatsapp/webhook`) ao criar a instância.

## 🚀 Produção

### 1. Domínio e HTTPS

Configure um domínio com HTTPS para ambos os serviços:
- Evolution API: `https://api.seudominio.com`
- PandoraPro: `https://seudominio.com`

### 2. Variáveis de Produção

```env
# Evolution API
EVOLUTION_API_URL=https://api.seudominio.com
EVOLUTION_API_KEY=sua-chave-super-segura-aqui

# PandoraPro
WEBHOOK_URL=https://seudominio.com/api/whatsapp/webhook
```

### 3. PM2 (Opcional)

Para manter a Evolution API rodando:

```bash
npm install -g pm2
pm2 start npm --name "evolution-api" -- run start:prod
pm2 save
pm2 startup
```

## 📊 Monitoramento

### Endpoints Úteis

- Status da API: `GET /`
- Listar instâncias: `GET /instance/fetchInstances`
- Status de uma instância: `GET /instance/connectionState/{instance}`
- Configuração de webhook: `GET /webhook/find/{instance}`

### Logs da Evolution API

```bash
# Ver logs em tempo real
tail -f logs/evolution-api.log

# Logs do PM2
pm2 logs evolution-api
```

## 🔄 Atualizações

Para atualizar a Evolution API:

```bash
cd evolution-api
git pull origin v2.0.0
npm install
npm run start:prod
```

## 📞 Suporte

- **Evolution API:** https://github.com/EvolutionAPI/evolution-api
- **Documentação:** https://docs.evolution-api.com
- **Comunidade:** Discord/Telegram da Evolution API

---

## ✅ Checklist de Configuração

- [ ] Node.js 18+ instalado
- [ ] MongoDB rodando
- [ ] Evolution API clonada e configurada
- [ ] Variáveis de ambiente configuradas
- [ ] API rodando na porta 8080
- [ ] Chave de API configurada nos dois projetos
- [ ] Primeira instância conectada
- [ ] Webhook funcionando
- [ ] Mensagens sendo recebidas em tempo real

🎉 **Parabéns!** Sua integração WhatsApp está funcionando! 