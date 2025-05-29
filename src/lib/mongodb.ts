import mongoose from 'mongoose'

if (!process.env.MONGODB_URI) {
  throw new Error('Por favor, defina a variável de ambiente MONGODB_URI no arquivo .env.local')
}

const MONGODB_URI = process.env.MONGODB_URI

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Usando cache global para evitar múltiplas conexões em desenvolvimento
declare global {
  var mongoose: MongooseCache | undefined
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null }

if (!global.mongoose) {
  global.mongoose = cached
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const options = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Usar IPv4
    }

    cached.promise = mongoose.connect(MONGODB_URI, options).then((mongoose) => {
      console.log('🚀 Conectado ao MongoDB com sucesso!')
      return mongoose
    }).catch((error) => {
      console.error('❌ Erro ao conectar com MongoDB:', error)
      throw error
    })
  }

  try {
    cached.conn = await cached.promise
    return cached.conn
  } catch (error) {
    cached.promise = null
    throw error
  }
}

// Função para desconectar do banco (útil para testes)
export async function disconnectFromDatabase(): Promise<void> {
  if (cached.conn) {
    await cached.conn.disconnect()
    cached.conn = null
    cached.promise = null
  }
}

// Middleware para garantir conexão antes de operações do banco
export async function ensureDbConnection() {
  if (mongoose.connection.readyState === 0) {
    await connectToDatabase()
  }
} 