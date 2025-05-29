import * as Minio from 'minio'
import { v4 as uuidv4 } from 'uuid'

// Configuração do MinIO client
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
  secretKey: process.env.MINIO_SECRET_KEY || 'password123',
})

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'pandorapro-documents'
const REGION = process.env.MINIO_REGION || 'us-east-1'

// Inicializar bucket se não existir
async function ensureBucketExists() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME)
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, REGION)
      console.log(`✅ Bucket '${BUCKET_NAME}' criado com sucesso`)
    }
  } catch (error) {
    console.error('❌ Erro ao verificar/criar bucket:', error)
    throw error
  }
}

// Interface para upload de arquivo
export interface FileUploadOptions {
  buffer: Buffer
  originalName: string
  mimeType: string
  clienteId: string
  tipoDocumento: string
}

export interface FileUploadResult {
  objectName: string
  url: string
  size: number
  etag: string
}

// Upload de arquivo para MinIO
export async function uploadFile(options: FileUploadOptions): Promise<FileUploadResult> {
  await ensureBucketExists()

  const { buffer, originalName, mimeType, clienteId, tipoDocumento } = options
  
  // Gerar nome único para o arquivo
  const fileExtension = originalName.split('.').pop() || ''
  const uniqueFileName = `${clienteId}/${tipoDocumento}/${uuidv4()}.${fileExtension}`
  
  const metadata = {
    'Content-Type': mimeType,
    'X-Uploaded-By': 'PandoraPro',
    'X-Original-Name': originalName,
    'X-Cliente-Id': clienteId,
    'X-Tipo-Documento': tipoDocumento,
    'X-Upload-Date': new Date().toISOString()
  }

  try {
    const uploadResult = await minioClient.putObject(
      BUCKET_NAME,
      uniqueFileName,
      buffer,
      buffer.length,
      metadata
    )

    // Gerar URL assinada para acesso ao arquivo (válida por 7 dias)
    const url = await minioClient.presignedGetObject(BUCKET_NAME, uniqueFileName, 7 * 24 * 60 * 60)

    return {
      objectName: uniqueFileName,
      url,
      size: buffer.length,
      etag: uploadResult.etag
    }
  } catch (error) {
    console.error('❌ Erro no upload do arquivo:', error)
    throw new Error(`Falha no upload: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  }
}

// Download de arquivo do MinIO
export async function downloadFile(objectName: string): Promise<Buffer> {
  try {
    const stream = await minioClient.getObject(BUCKET_NAME, objectName)
    const chunks: Buffer[] = []
    
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(chunk))
      stream.on('end', () => resolve(Buffer.concat(chunks)))
      stream.on('error', reject)
    })
  } catch (error) {
    console.error('❌ Erro no download do arquivo:', error)
    throw new Error(`Falha no download: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  }
}

// Gerar URL assinada para download direto
export async function getSignedUrl(objectName: string, expiresInSeconds: number = 3600): Promise<string> {
  try {
    return await minioClient.presignedGetObject(BUCKET_NAME, objectName, expiresInSeconds)
  } catch (error) {
    console.error('❌ Erro ao gerar URL assinada:', error)
    throw new Error(`Falha ao gerar URL: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  }
}

// Deletar arquivo do MinIO
export async function deleteFile(objectName: string): Promise<void> {
  try {
    await minioClient.removeObject(BUCKET_NAME, objectName)
  } catch (error) {
    console.error('❌ Erro ao deletar arquivo:', error)
    throw new Error(`Falha ao deletar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  }
}

// Listar arquivos de um cliente
export async function listClientFiles(clienteId: string): Promise<Array<{
  name: string
  size: number
  lastModified: Date
  etag: string
}>> {
  try {
    const stream = minioClient.listObjects(BUCKET_NAME, `${clienteId}/`, true)
    const files: Array<{ name: string; size: number; lastModified: Date; etag: string }> = []

    return new Promise((resolve, reject) => {
      stream.on('data', (obj) => {
        files.push({
          name: obj.name || '',
          size: obj.size || 0,
          lastModified: obj.lastModified || new Date(),
          etag: obj.etag || ''
        })
      })
      stream.on('end', () => resolve(files))
      stream.on('error', reject)
    })
  } catch (error) {
    console.error('❌ Erro ao listar arquivos do cliente:', error)
    throw new Error(`Falha ao listar arquivos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  }
}

// Obter informações de um arquivo
export async function getFileInfo(objectName: string) {
  try {
    const stat = await minioClient.statObject(BUCKET_NAME, objectName)
    return {
      size: stat.size,
      lastModified: stat.lastModified,
      etag: stat.etag,
      metaData: stat.metaData
    }
  } catch (error) {
    console.error('❌ Erro ao obter informações do arquivo:', error)
    throw new Error(`Falha ao obter informações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  }
}

// Verificar se MinIO está conectado
export async function checkMinioConnection(): Promise<boolean> {
  try {
    await minioClient.listBuckets()
    return true
  } catch (error) {
    console.error('❌ MinIO não está conectado:', error)
    return false
  }
}

export { minioClient, BUCKET_NAME } 