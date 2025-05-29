# 🏛️ PandoraPro - CRM para Advogados Previdenciários

Sistema especializado de CRM desenvolvido especificamente para **advogados do direito previdenciário**, com foco em gestão de clientes, acompanhamento de processos do INSS e comunicação via WhatsApp.

## 🎯 Características Principais

- 📋 **Gestão Especializada**: Campos específicos para advocacia previdenciária (CPF, NIT, benefícios INSS)
- 📱 **Integração WhatsApp**: Comunicação direta via Evolution API
- 🔄 **Kanban Processual**: Fluxo específico para casos previdenciários
- 🏢 **Multi-tenancy**: Isolamento completo entre escritórios
- 📊 **Relatórios Jurídicos**: Métricas especializadas para advocacia
- 🔗 **Webhooks**: Integrações personalizadas

## 🛠️ Tecnologias Utilizadas

- **Frontend/Backend**: Next.js 15 com App Router
- **Linguagem**: TypeScript
- **Banco de Dados**: MongoDB
- **ODM**: Mongoose
- **Estilização**: Tailwind CSS
- **Autenticação**: NextAuth.js
- **UI Components**: Radix UI
- **Estado Global**: Zustand
- **Validação**: Zod
- **Drag & Drop**: @dnd-kit

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js 18+
- MongoDB (local ou Atlas)
- NPM ou Yarn

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/pandorapro.git
cd pandorapro
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.local` e configure suas variáveis:

```bash
cp .env.local.example .env.local
```

Edite o arquivo `.env.local`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/pandorapro

# NextAuth
NEXTAUTH_SECRET=sua_chave_secreta_super_segura_aqui
NEXTAUTH_URL=http://localhost:3000

# Evolution API (para integração WhatsApp)
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua_chave_evolution_api_aqui
```

### 4. Execute em modo de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 15)
│   ├── api/               # API Routes
│   ├── auth/              # Páginas de autenticação
│   ├── dashboard/         # Área administrativa
│   └── layout.tsx         # Layout raiz
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── forms/            # Formulários
│   ├── kanban/           # Componentes do Kanban
│   └── charts/           # Gráficos e métricas
├── lib/                   # Configurações e utilitários
│   ├── mongodb.ts        # Conexão MongoDB
│   ├── auth.ts           # Configuração NextAuth
│   └── validations.ts    # Schemas Zod
├── models/               # Modelos Mongoose
├── types/                # Tipos TypeScript
├── utils/                # Funções utilitárias
└── styles/               # Estilos globais
```

## 🏗️ Funcionalidades Principais

### ✅ Implementadas

- [x] **Configuração Base**: Projeto Next.js + TypeScript + MongoDB
- [x] **Tipos TypeScript**: Interfaces completas para o sistema
- [x] **Utilitários**: Funções de formatação e validação
- [x] **Estilos Base**: Tailwind CSS com tema personalizado

### 🚧 Em Desenvolvimento

- [ ] **Autenticação**: Sistema de login multi-tenant
- [ ] **Gestão de Empresas**: CRUD de escritórios
- [ ] **Gestão de Clientes**: CRUD especializado
- [ ] **Sistema de Atendimento**: Chat e templates
- [ ] **Kanban Processual**: Arrastar e soltar
- [ ] **Integração WhatsApp**: Evolution API
- [ ] **Dashboard**: Métricas e relatórios

### 📋 Planejadas

- [ ] **Webhooks Personalizados**: Integrações externas
- [ ] **Sistema de Especialidades**: Gestão completa
- [ ] **Tags e Categorização**: Sistema flexível
- [ ] **Relatórios Avançados**: Exportação e análises
- [ ] **Mobile App**: Aplicativo nativo
- [ ] **Integrações**: APIs do governo e tribunais

## 🔐 Autenticação e Segurança

O sistema implementa:

- **Multi-tenancy**: Isolamento completo entre empresas
- **Controle de acesso**: Perfis admin, usuário, supervisor
- **Sessões seguras**: NextAuth.js com JWT
- **Validação**: Zod para validação de dados
- **Sanitização**: Prevenção de XSS e injeções

## 📊 Especialidades Previdenciárias

O sistema suporta as principais especialidades:

- **Aposentadorias**: Idade, Tempo de Contribuição, Especial
- **Auxílios**: Doença, Acidente
- **BPC**: Deficiência e Idoso
- **Pensão por Morte**
- **Revisões de Benefícios**
- **Especialidades Personalizadas**

## 🔄 Fluxo Processual (Kanban)

Colunas específicas para advocacia previdenciária:

1. **Consulta Inicial**
2. **Documentação Pendente**
3. **Análise do Caso**
4. **Protocolo INSS**
5. **Aguardando Resposta**
6. **Recurso/Contestação**
7. **Deferido**
8. **Indeferido**

## 📱 Integração WhatsApp

Utilizando a Evolution API para:

- Recebimento de mensagens em tempo real
- Sincronização de histórico (3 meses)
- Envio de mensagens e mídias
- Templates jurídicos pré-definidos
- QR Code para pareamento
- Status de entrega/leitura

## 🔗 Webhooks e Integrações

Sistema flexível de webhooks para:

- Notificações de novas mensagens
- Atualizações de status de caso
- Criação de novos clientes
- Integração com sistemas externos
- Automações personalizadas

## 📈 Métricas e Relatórios

Dashboard especializado com:

- Total de clientes por escritório
- Taxa de deferimento por especialidade
- Tempo médio de processos
- Distribuição por advogado
- Casos com prazos vencendo
- Receita por tipo de benefício

## 🧪 Testes

```bash
# Executar testes
npm run test

# Executar testes em modo watch
npm run test:watch

# Executar testes de cobertura
npm run test:coverage
```

## 🚀 Deploy

### Vercel (Recomendado)

```bash
npm run build
vercel --prod
```

### Docker

```bash
docker build -t pandorapro .
docker run -p 3000:3000 pandorapro
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

- **Email**: suporte@pandorapro.com.br
- **Documentação**: [docs.pandorapro.com.br](https://docs.pandorapro.com.br)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/pandorapro/issues)

## 🙏 Agradecimentos

- Advogados previdenciários que contribuíram com feedback
- Comunidade open source do Next.js
- Time de desenvolvimento da Evolution API

---

**PandoraPro** - Desenvolvido especificamente para advogados previdenciários 🏛️⚖️ 