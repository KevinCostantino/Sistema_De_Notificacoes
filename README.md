# Sistema de Notificações

Sistema completo de gerenciamento de notificações desenvolvido com Node.js (backend) e React.js (frontend), conforme especificação do desafio técnico.

## 🚀 Funcionalidades Implementadas

### Backend (Node.js)
- ✅ **API RESTful** com Express.js
- ✅ **CRUD completo** de notificações:
  - Criar notificação
  - Listar notificações paginadas com filtros
  - Marcar como lida/não lida
  - Remover notificação (soft delete)
- ✅ **Persistência em MongoDB** com Mongoose
- ✅ **Validação robusta** com Joi
- ✅ **Tratamento de erros** consistente
- ✅ **Testes unitários** abrangentes (Jest + Supertest)
- ✅ **Paginação e filtros** avançados
- ✅ **Soft delete** implementado
- ✅ **Estatísticas** de notificações

### Frontend (React.js)
- ✅ **Interface moderna** e responsiva
- ✅ **Sistema de usuários** com seletor visual
- ✅ **3 usuários de teste** pré-configurados (A, B, C)
- ✅ **Consumo da API** com Axios
- ✅ **Gerenciamento de estado** com hooks customizados
- ✅ **Componentes reutilizáveis**
- ✅ **Filtros e paginação** interativos
- ✅ **Notificações em tempo real** (toast)
- ✅ **Formulário simplificado** (sem campo userId)
- ✅ **Auto-atribuição** de notificações ao usuário atual
- ✅ **Design responsivo** para mobile

### Infraestrutura
- ✅ **Docker Compose** para orquestração
- ✅ **Contêineres otimizados** para produção
- ✅ **Variáveis de ambiente** configuráveis
- ✅ **Health checks** implementados

## 🛠 Tecnologias Utilizadas

### Backend
- **Node.js 18** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **Joi** - Validação de dados
- **Jest** - Framework de testes
- **Supertest** - Testes de API
- **MongoDB Memory Server** - Testes em memória

### Frontend
- **React 18** - Biblioteca UI
- **Axios** - Cliente HTTP
- **React Toastify** - Notificações
- **Lucide React** - Ícones
- **CSS3** - Estilização

### DevOps
- **Docker** - Contêinerização
- **Docker Compose** - Orquestração
- **Nginx** - Servidor web (frontend)

## 📦 Estrutura do Projeto

```
sistema-notificacoes/
├── backend/                    # API Node.js
│   ├── src/
│   │   ├── config/            # Configurações (database)
│   │   ├── controllers/       # Controladores
│   │   ├── middleware/        # Middlewares
│   │   ├── models/           # Modelos Mongoose
│   │   ├── routes/           # Rotas da API
│   │   ├── validators/       # Validadores Joi
│   │   └── server.js         # Servidor principal
│   ├── tests/                # Testes unitários
│   ├── Dockerfile           # Contêiner backend
│   └── package.json         # Dependências
├── frontend/                  # Aplicação React
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   ├── hooks/           # Hooks customizados
│   │   ├── services/        # Serviços API
│   │   ├── styles/          # Estilos CSS
│   │   └── App.js           # Componente principal
│   ├── Dockerfile           # Contêiner frontend
│   └── package.json         # Dependências
├── docker-compose.yml        # Orquestração
├── README.md                # Este arquivo
└── NOTES.md                 # Notas técnicas
```

## 🚀 Como Executar

### Opção 1: Docker Compose (Recomendado)

1. **Clone o repositório:**
   ```bash
   git clone <repository-url>
   cd sistema-notificacoes
   ```

2. **Execute com Docker Compose:**
   ```bash
   docker-compose up --build
   ```

3. **Acesse as aplicações:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001
   - Health check: http://localhost:3001/health

### Opção 2: Execução Local

#### Backend
```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env conforme necessário

# Executar em desenvolvimento
npm run dev

# Executar testes
npm test

# Executar com coverage
npm run test:coverage
```

#### Frontend
```bash
cd frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env conforme necessário

# Executar em desenvolvimento
npm start

# Build para produção
npm run build
```

#### MongoDB
Certifique-se de ter o MongoDB rodando localmente na porta 27017, ou use a string de conexão configurada no `.env`.

## 📋 Exemplos de Uso da API

### Criar Notificação
```bash
curl -X POST http://localhost:3001/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "673e4b8f9a1b2c3d4e5f6789",
    "title": "Nova mensagem",
    "message": "Você recebeu uma nova mensagem",
    "type": "info",
    "priority": "medium"
  }'
```

### Usuários de Teste Disponíveis
```javascript
// Usuário A - Administrador
{ "id": "673e4b8f9a1b2c3d4e5f6789", "name": "Usuário A", "role": "Administrador" }

// Usuário B - Desenvolvedor  
{ "id": "673e4b8f9a1b2c3d4e5f678a", "name": "Usuário B", "role": "Desenvolvedor" }

// Usuário C - Designer
{ "id": "673e4b8f9a1b2c3d4e5f678b", "name": "Usuário C", "role": "Designer" }
```

### Popular Banco com Dados de Teste
```bash
# Executa script que cria notificações para os 3 usuários
./populate-users.sh
```

### Listar Notificações (Paginado)
```bash
curl "http://localhost:3001/api/notifications/user/673e4b8f9a1b2c3d4e5f6789?page=1&limit=10&includeRead=true"
```

### Marcar como Lida
```bash
curl -X PATCH http://localhost:3001/api/notifications/{id}/read
```

### Remover Notificação
```bash
curl -X DELETE http://localhost:3001/api/notifications/{id}
```

### Marcar Todas como Lidas
```bash
curl -X PATCH http://localhost:3001/api/notifications/user/673e4b8f9a1b2c3d4e5f6789/mark-all-read
```

### Obter Estatísticas
```bash
curl http://localhost:3001/api/notifications/user/673e4b8f9a1b2c3d4e5f6789/stats
```

## 🧪 Executar Testes

### Backend
```bash
cd backend

# Testes unitários
npm test

# Testes com coverage
npm run test:coverage

# Testes em watch mode
npm run test:watch
```

### Frontend
```bash
cd frontend

# Testes unitários
npm test
```

## 🔧 Configuração

### Variáveis de Ambiente

#### Backend (.env)
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/notifications
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3001/api
```

## 📊 Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/notifications` | Criar notificação |
| GET | `/api/notifications/user/:userId` | Listar notificações do usuário |
| GET | `/api/notifications/:id` | Obter notificação específica |
| PATCH | `/api/notifications/:id` | Atualizar notificação |
| PATCH | `/api/notifications/:id/read` | Marcar como lida |
| PATCH | `/api/notifications/:id/unread` | Marcar como não lida |
| PATCH | `/api/notifications/user/:userId/mark-all-read` | Marcar todas como lidas |
| DELETE | `/api/notifications/:id` | Remover notificação (soft delete) |
| GET | `/api/notifications/user/:userId/stats` | Estatísticas do usuário |

## ✨ Funcionalidades Especiais

### 🔄 Atualização Automática da Listagem
- **Após criar notificação**: Listagem atualiza automaticamente
- **Estado sincronizado**: Hook `useNotifications` mantém dados atualizados
- **Feedback visual**: Toast de confirmação e loading states
- **Performance otimizada**: Atualizações locais de estado quando possível



## 🎯 Decisões Arquiteturais

### Backend
- **Arquitetura em Camadas**: Separação clara entre rotas, controladores, modelos e validação
- **Soft Delete**: Notificações não são removidas fisicamente, apenas marcadas como deletadas
- **Paginação Eficiente**: Implementada com skip/limit e metadados de paginação
- **Validação Robusta**: Joi para validação de entrada com mensagens personalizadas
- **Error Handling**: Middleware centralizado para tratamento consistente de erros
- **Índices MongoDB**: Otimização de consultas com índices compostos
- **Testes Abrangentes**: Coverage alto com testes unitários e de integração

### Frontend
- **Hooks Customizados**: 
  - `useNotifications`: Encapsula toda lógica de gerenciamento de notificações
  - Estado reativo com `useState` e `useCallback` para otimização
  - Sincronização automática entre criação e listagem
- **Componentes Modulares**: 
  - `NotificationCard`: Responsável apenas pela exibição de uma notificação
  - `CreateNotificationForm`: Modal isolado para criação
  - `NotificationFilters`: Filtros reutilizáveis e configuráveis
  - `Pagination`: Componente genérico de paginação
- **Arquitetura de Serviços**:
  - `notificationService`: Camada de abstração para API calls
  - Configuração centralizada do Axios com interceptors
  - Headers UTF-8 automáticos para suporte completo ao português
- **Estado Local Otimista**: 
  - Atualizações imediatas na UI após ações (marcar como lida, deletar)
  - Rollback automático em caso de erro na API
  - Sincronização de estado entre componentes via hooks
- **Design System**:
  - CSS modular com classes utilitárias
  - Tema consistente com variáveis CSS customizadas
  - Interface responsiva com breakpoints mobile-first
  - Componentes acessíveis com ARIA labels
- **Experiência do Usuário**:
  - Loading states específicos para cada ação
  - Toast notifications com diferentes tipos (success, error, info)
  - Auto-preenchimento inteligente do userId
  - Validação em tempo real nos formulários

### Infraestrutura
- **Contêineres Multi-stage**: Builds otimizados para produção
- **Health Checks**: Monitoramento automático da saúde dos serviços
- **Nginx**: Servidor web otimizado para frontend com compressão e cache
- **Redes Docker**: Isolamento e comunicação segura entre serviços

## 🔒 Segurança

- **Helmet.js**: Headers de segurança HTTP
- **Rate Limiting**: Proteção contra ataques de força bruta
- **CORS**: Configuração adequada para origens permitidas
- **Validação**: Sanitização e validação de todos os inputs
- **Usuários não-root**: Contêineres executam com usuários não privilegiados

## 📈 Monitoramento

- **Health Checks**: Endpoints de verificação de saúde
- **Logging**: Sistema de logs estruturado
- **Error Tracking**: Captura e tratamento de erros

## 🚧 Próximos Passos

Veja o arquivo [NOTES.md](./NOTES.md) para informações sobre melhorias futuras e limitações conhecidas.

## 📝 Licença

Este projeto foi desenvolvido como parte de um desafio técnico.

---

**Desenvolvido por:** Kevin Nicolas Costantino
**Data:** Novembro 2025