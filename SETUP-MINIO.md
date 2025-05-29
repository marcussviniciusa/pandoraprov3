# Configuração do MinIO para PandoraPro

## Instalação e Configuração do MinIO

### 1. Usando Docker (Recomendado)

```bash
# Criar pasta para dados persistentes
mkdir -p ~/minio/data

# Executar MinIO via Docker
docker run -d \
  --name minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -v ~/minio/data:/data \
  -e "MINIO_ROOT_USER=admin" \
  -e "MINIO_ROOT_PASSWORD=password123" \
  quay.io/minio/minio server /data --console-address ":9001"
```

### 2. Instalação Manual (Linux)

```bash
# Download do MinIO
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
sudo mv minio /usr/local/bin/

# Criar diretório de dados
sudo mkdir -p /usr/local/share/minio
sudo chown $(whoami):$(whoami) /usr/local/share/minio

# Executar MinIO
export MINIO_ROOT_USER=admin
export MINIO_ROOT_PASSWORD=password123
minio server /usr/local/share/minio --console-address ":9001"
```

### 3. Configuração no PandoraPro

As variáveis de ambiente já estão configuradas no `.env.local`:

```env
# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=password123
MINIO_USE_SSL=false
MINIO_BUCKET_NAME=pandorapro-documents
MINIO_REGION=us-east-1
```

### 4. Acessar Interface Web

- **Console do MinIO**: http://localhost:9001
- **API do MinIO**: http://localhost:9000
- **Usuário**: admin
- **Senha**: password123

### 5. Verificar Funcionamento

Após iniciar o MinIO, execute o PandoraPro:

```bash
npm run dev
```

O sistema criará automaticamente o bucket `pandorapro-documents` no primeiro upload.

## Estrutura de Arquivos no MinIO

```
pandorapro-documents/
├── {clienteId}/
│   ├── rg/
│   │   └── {uuid}.pdf
│   ├── cpf/
│   │   └── {uuid}.jpg
│   ├── laudo_medico/
│   │   └── {uuid}.pdf
│   └── outros/
│       └── {uuid}.docx
```

## Scripts Úteis

### Listar Buckets
```bash
curl -X GET http://admin:password123@localhost:9000
```

### Verificar Status
```bash
curl -X GET http://localhost:9000/minio/health/live
```

## Configuração para Produção

Para produção, altere no `.env.local`:

```env
MINIO_ENDPOINT=seu-servidor-minio.com
MINIO_PORT=443
MINIO_USE_SSL=true
MINIO_ACCESS_KEY=sua-chave-de-acesso
MINIO_SECRET_KEY=sua-chave-secreta
```

## Troubleshooting

### Erro de Conexão
1. Verifique se o MinIO está rodando: `docker ps` ou `ps aux | grep minio`
2. Teste a conectividade: `curl http://localhost:9000`
3. Verifique os logs: `docker logs minio`

### Erro de Permissão
1. Verifique as credenciais no `.env.local`
2. Recrie o container com as variáveis corretas

### Bucket não Criado
O sistema cria automaticamente o bucket. Se houver erro:
1. Acesse o console: http://localhost:9001
2. Crie manualmente o bucket `pandorapro-documents`
3. Defina como público (se necessário)

## Backup e Restore

### Backup
```bash
# Backup do diretório de dados
tar -czf minio-backup-$(date +%Y%m%d).tar.gz ~/minio/data
```

### Restore
```bash
# Restore do backup
tar -xzf minio-backup-YYYYMMDD.tar.gz -C ~/
``` 