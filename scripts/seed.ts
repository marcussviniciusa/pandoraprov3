import mongoose from 'mongoose'
import { Empresa, Usuario, Cliente } from '../src/models'

// Conexão direta com MongoDB para o seed
const MONGODB_URI = 'mongodb://admin:Marcus1911Marcus@206.183.131.10:27017/pandoraprov3?authSource=admin'

async function connectForSeed() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Conectado ao MongoDB')
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error)
    throw error
  }
}

async function seed() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...')
    
    await connectForSeed()
    
    // Limpar dados existentes
    await Promise.all([
      Cliente.deleteMany({}),
      Usuario.deleteMany({}),
      Empresa.deleteMany({})
    ])
    
    console.log('🗑️ Dados existentes limpos')
    
    // Criar empresa de teste
    const empresa = await Empresa.create({
      nome: 'Escritório Silva & Advogados',
      cnpj: '12345678000195',
      endereco: {
        rua: 'Rua das Flores',
        numero: '123',
        complemento: 'Sala 456',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234567'
      },
      telefone: '11987654321',
      email: 'contato@silvaadvogados.com.br',
      website: 'https://silvaadvogados.com.br',
      status: 'ativa',
      configuracoes: {
        limitesClientes: 1000,
        limitesUsuarios: 10,
        limitesInstanciasWhatsApp: 3,
        tema: 'light',
        personalizacao: {}
      }
    })
    
    console.log('✅ Empresa criada:', empresa.nome)
    
    // Criar usuários de teste
    const usuarios = await Usuario.create([
      {
        empresaId: empresa._id,
        nome: 'Dr. João Silva',
        email: 'joao@silvaadvogados.com.br',
        senha: '123456',
        role: 'admin',
        ativo: true,
        especialidades: ['aposentadoria_idade', 'aposentadoria_tempo_contribuicao', 'auxilio_doenca'],
        telefone: '11987654321',
        configuracoes: {
          notificacoes: true,
          tema: 'light',
          idioma: 'pt-BR'
        }
      },
      {
        empresaId: empresa._id,
        nome: 'Dra. Maria Santos',
        email: 'maria@silvaadvogados.com.br',
        senha: '123456',
        role: 'user',
        ativo: true,
        especialidades: ['bpc', 'pensao_morte', 'revisao_beneficios'],
        telefone: '11987654322',
        configuracoes: {
          notificacoes: true,
          tema: 'light',
          idioma: 'pt-BR'
        }
      },
      {
        empresaId: empresa._id,
        nome: 'Dr. Carlos Oliveira',
        email: 'carlos@silvaadvogados.com.br',
        senha: '123456',
        role: 'supervisor',
        ativo: true,
        especialidades: ['aposentadoria_especial', 'auxilio_doenca'],
        telefone: '11987654323',
        configuracoes: {
          notificacoes: true,
          tema: 'light',
          idioma: 'pt-BR'
        }
      }
    ])
    
    console.log('✅ Usuários criados:', usuarios.length)
    
    // Criar clientes de teste
    const clientes = await Cliente.create([
      {
        empresaId: empresa._id,
        nome: 'José da Silva',
        cpf: '12345678901',
        rg: '123456789',
        dataNascimento: new Date('1960-05-15'),
        telefone: '11999887766',
        email: 'jose.silva@email.com',
        endereco: {
          rua: 'Rua A',
          numero: '100',
          bairro: 'Vila Nova',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '12345678'
        },
        dadosPrevidenciarios: {
          nit: '12345678901',
          numeroProcesso: '12345678901234567890',
          tipoBeneficio: 'aposentadoria_idade',
          valorBeneficio: 1500.00,
          dataInicioProcesso: new Date('2024-01-15'),
          observacoes: 'Cliente quer aposentadoria por idade aos 65 anos'
        },
        statusProcessual: 'consulta_inicial',
        especialidade: 'aposentadoria_idade',
        prioridade: 'normal',
        origem: 'presencial',
        advogadoResponsavel: usuarios[0]._id,
        tags: ['aposentadoria', 'idade', '65anos'],
        whatsappNumero: '11999887766',
        ativo: true
      },
      {
        empresaId: empresa._id,
        nome: 'Maria Oliveira',
        cpf: '98765432100',
        rg: '987654321',
        dataNascimento: new Date('1975-03-22'),
        telefone: '11888776655',
        email: 'maria.oliveira@email.com',
        endereco: {
          rua: 'Rua B',
          numero: '200',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '87654321'
        },
        dadosPrevidenciarios: {
          nit: '98765432100',
          numeroProcesso: '98765432109876543210',
          tipoBeneficio: 'auxilio_doenca',
          dataInicioProcesso: new Date('2024-02-01'),
          dataUltimaPericia: new Date('2024-01-15'),
          proximaPericia: new Date('2025-12-15'),
          observacoes: 'Auxílio-doença por problema na coluna'
        },
        statusProcessual: 'documentacao_pendente',
        especialidade: 'auxilio_doenca',
        prioridade: 'alta',
        origem: 'whatsapp',
        advogadoResponsavel: usuarios[0]._id,
        tags: ['auxilio', 'doenca', 'coluna'],
        whatsappNumero: '11888776655',
        ativo: true
      },
      {
        empresaId: empresa._id,
        nome: 'Ana Costa',
        cpf: '11122233344',
        rg: '111222333',
        dataNascimento: new Date('1980-12-10'),
        telefone: '11777665544',
        endereco: {
          rua: 'Rua C',
          numero: '300',
          bairro: 'Jardim São Paulo',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '11223344'
        },
        dadosPrevidenciarios: {
          nit: '11122233344',
          tipoBeneficio: 'bpc_deficiencia',
          observacoes: 'BPC para pessoa com deficiência'
        },
        statusProcessual: 'analise_caso',
        especialidade: 'bpc',
        prioridade: 'normal',
        origem: 'online',
        advogadoResponsavel: usuarios[1]._id,
        tags: ['bpc', 'deficiencia'],
        whatsappNumero: '11777665544',
        ativo: true
      },
      {
        empresaId: empresa._id,
        nome: 'Pedro Santos',
        cpf: '55566677788',
        rg: '555666777',
        dataNascimento: new Date('1965-08-05'),
        telefone: '11666554433',
        endereco: {
          rua: 'Rua D',
          numero: '400',
          bairro: 'Vila Madalena',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '55667788'
        },
        dadosPrevidenciarios: {
          nit: '55566677788',
          numeroProcesso: '55566677788899900011',
          tipoBeneficio: 'aposentadoria_especial',
          valorBeneficio: 2500.00,
          dataInicioProcesso: new Date('2023-12-01'),
          observacoes: 'Aposentadoria especial por insalubridade'
        },
        statusProcessual: 'protocolo_inss',
        especialidade: 'aposentadoria_especial',
        prioridade: 'normal',
        origem: 'indicacao',
        advogadoResponsavel: usuarios[2]._id,
        tags: ['aposentadoria', 'especial', 'insalubridade'],
        whatsappNumero: '11666554433',
        ativo: true
      },
      {
        empresaId: empresa._id,
        nome: 'Lucia Ferreira',
        cpf: '99988877766',
        rg: '999888777',
        dataNascimento: new Date('1970-11-30'),
        telefone: '11555443322',
        endereco: {
          rua: 'Rua E',
          numero: '500',
          bairro: 'Mooca',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '99887766'
        },
        dadosPrevidenciarios: {
          nit: '99988877766',
          numeroProcesso: '99988877766554433221',
          tipoBeneficio: 'pensao_morte',
          valorBeneficio: 1200.00,
          dataInicioProcesso: new Date('2024-03-01'),
          observacoes: 'Pensão por morte do cônjuge'
        },
        statusProcessual: 'aguardando_resposta',
        especialidade: 'pensao_morte',
        prioridade: 'alta',
        origem: 'presencial',
        advogadoResponsavel: usuarios[1]._id,
        tags: ['pensao', 'morte', 'conjuge'],
        whatsappNumero: '11555443322',
        ativo: true
      },
      {
        empresaId: empresa._id,
        nome: 'Roberto Lima',
        cpf: '44433322211',
        rg: '444333222',
        dataNascimento: new Date('1955-04-18'),
        telefone: '11444332211',
        endereco: {
          rua: 'Rua F',
          numero: '600',
          bairro: 'Liberdade',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '44332211'
        },
        dadosPrevidenciarios: {
          nit: '44433322211',
          numeroProcesso: '44433322211998877665',
          tipoBeneficio: 'aposentadoria_tempo_contribuicao',
          valorBeneficio: 3000.00,
          dataInicioProcesso: new Date('2023-11-15'),
          observacoes: 'Aposentadoria por tempo de contribuição - 35 anos'
        },
        statusProcessual: 'deferido',
        especialidade: 'aposentadoria_tempo_contribuicao',
        prioridade: 'baixa',
        origem: 'presencial',
        advogadoResponsavel: usuarios[0]._id,
        tags: ['aposentadoria', 'tempo', 'contribuicao'],
        whatsappNumero: '11444332211',
        ativo: true
      }
    ])
    
    console.log('✅ Clientes criados:', clientes.length)
    
    // Adicionar algumas anotações aos clientes
    await clientes[0].adicionarAnotacao(
      'Cliente veio para consulta inicial. Documentos em análise.',
      usuarios[0]._id,
      true
    )
    
    await clientes[1].adicionarAnotacao(
      'Aguardando envio de documentos médicos atualizados.',
      usuarios[0]._id,
      false
    )
    
    await clientes[2].adicionarAnotacao(
      'Caso complexo de BPC. Requer análise médica detalhada.',
      usuarios[1]._id,
      true
    )
    
    console.log('✅ Anotações adicionadas')
    
    console.log('\n🎉 Seed concluído com sucesso!')
    console.log('\n📊 Dados criados:')
    console.log(`   • 1 Empresa: ${empresa.nome}`)
    console.log(`   • ${usuarios.length} Usuários`)
    console.log(`   • ${clientes.length} Clientes`)
    console.log('\n🔑 Credenciais de teste:')
    console.log('   • Admin: joao@silvaadvogados.com.br / 123456')
    console.log('   • Usuário: maria@silvaadvogados.com.br / 123456')
    console.log('   • Supervisor: carlos@silvaadvogados.com.br / 123456')
    
  } catch (error) {
    console.error('❌ Erro durante o seed:', error)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

// Executar seed se o arquivo for chamado diretamente
if (require.main === module) {
  seed()
}

export default seed 