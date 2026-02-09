# 📁 Estrutura Completa do Projeto Habit Tracker

```
habit-tracker/
│
├── 📄 README.md                          # Documentação principal
├── 📄 INSTALL_GUIDE.md                   # Guia completo de instalação
│
├── 📂 backend/                           # Servidor Node.js + Express
│   ├── 📄 package.json                   # Dependências do backend
│   ├── 📄 .env.example                   # Exemplo de configurações
│   ├── 📄 database.sql                   # Script de criação do banco
│   │
│   └── 📂 src/
│       ├── 📄 server.js                  # Arquivo principal do servidor
│       │
│       ├── 📂 config/
│       │   └── 📄 database.js            # Configuração PostgreSQL
│       │
│       ├── 📂 controllers/
│       │   ├── 📄 authController.js      # Lógica de autenticação
│       │   ├── 📄 habitController.js     # Lógica de hábitos
│       │   └── 📄 statsController.js     # Lógica de estatísticas
│       │
│       ├── 📂 middleware/
│       │   └── 📄 auth.js                # Middleware JWT
│       │
│       └── 📂 routes/
│           ├── 📄 auth.js                # Rotas de autenticação
│           ├── 📄 habits.js              # Rotas de hábitos
│           └── 📄 stats.js               # Rotas de estatísticas
│
├── 📂 frontend/                          # Aplicação React
│   ├── 📄 package.json                   # Dependências do frontend
│   ├── 📄 vite.config.js                 # Configuração Vite
│   ├── 📄 tailwind.config.js             # Configuração Tailwind CSS
│   ├── 📄 postcss.config.js              # Configuração PostCSS
│   ├── 📄 .env.example                   # Exemplo de configurações
│   ├── 📄 index.html                     # HTML principal
│   │
│   └── 📂 src/
│       ├── 📄 main.jsx                   # Ponto de entrada React
│       ├── 📄 App.jsx                    # Componente principal + Rotas
│       ├── 📄 index.css                  # Estilos globais Tailwind
│       │
│       ├── 📂 pages/
│       │   ├── 📄 Login.jsx              # Página de login
│       │   ├── 📄 Register.jsx           # Página de registro
│       │   └── 📄 Dashboard.jsx          # Dashboard principal
│       │
│       ├── 📂 components/
│       │   ├── 📄 HabitCard.jsx          # Card de hábito individual
│       │   ├── 📄 CreateHabitModal.jsx   # Modal para criar hábito
│       │   └── 📄 CalendarView.jsx       # Visualização de calendário
│       │
│       ├── 📂 context/
│       │   └── 📄 AuthContext.jsx        # Contexto de autenticação
│       │
│       ├── 📂 services/
│       │   └── 📄 api.js                 # Funções de API
│       │
│       └── 📂 utils/                     # Utilitários (vazio por enquanto)

```

## 🗂️ Descrição dos Arquivos Principais

### Backend

#### 📄 `server.js`
- Configuração do servidor Express
- Middlewares (CORS, JSON)
- Definição de rotas
- Inicialização do servidor na porta 5000

#### 📄 `database.js`
- Conexão com PostgreSQL usando pg
- Pool de conexões
- Tratamento de erros de conexão

#### 📄 `authController.js`
- **register**: Criar novo usuário (hash de senha com bcrypt)
- **login**: Autenticar usuário (comparar senha, gerar JWT)
- **getProfile**: Buscar perfil do usuário autenticado
- **updateProfile**: Atualizar dados do usuário

#### 📄 `habitController.js`
- **getAll**: Listar todos os hábitos do usuário
- **create**: Criar novo hábito
- **update**: Atualizar hábito existente
- **delete**: Deletar hábito
- **toggleComplete**: Marcar/desmarcar hábito como completo
- **getHistory**: Buscar histórico de um hábito
- **getCalendar**: Buscar dados do calendário (90 dias)

#### 📄 `statsController.js`
- **getStats**: Estatísticas gerais (streaks, taxa de conclusão)
- **getProgress**: Dados de progresso dos últimos 30 dias
- **getHeatmap**: Dados para heatmap de 365 dias

#### 📄 `database.sql`
Cria 4 tabelas principais:
- **users**: Dados dos usuários
- **habits**: Hábitos criados
- **habit_logs**: Registro de conclusões
- **user_stats**: Cache de estatísticas

### Frontend

#### 📄 `App.jsx`
- Configuração do React Router
- Rotas públicas: /login, /register
- Rotas privadas: /dashboard
- Proteção de rotas com AuthContext

#### 📄 `Login.jsx` e `Register.jsx`
- Formulários de autenticação
- Validação de entrada
- Animações com Framer Motion
- Design glassmorphism com gradientes

#### 📄 `Dashboard.jsx`
- View principal do aplicativo
- 4 cards de estatísticas
- 3 abas: Hoje, Calendário, Estatísticas
- Gráficos com Recharts
- Lista de hábitos com progress bar

#### 📄 `HabitCard.jsx`
- Card individual de hábito
- Checkbox animado
- Barra de progresso
- Ações: deletar hábito
- Animações de hover e clique

#### 📄 `CreateHabitModal.jsx`
- Modal para criar novo hábito
- Seletor de ícone (14 emojis)
- Seletor de cor (15 cores)
- Preview em tempo real
- Validação de formulário

#### 📄 `CalendarView.jsx`
- Visualização de calendário mensal
- Navegação entre meses
- Indicação de dias com atividade
- Detalhes ao clicar em um dia
- Ícones dos hábitos completados

#### 📄 `AuthContext.jsx`
- Gerenciamento de estado de autenticação
- Funções: login, register, logout
- Armazenamento de token no localStorage
- Verificação automática de sessão

#### 📄 `api.js`
- Funções para todas as chamadas de API
- 3 módulos: authAPI, habitsAPI, statsAPI
- Tratamento de erros
- Inclusão automática de token JWT

#### 📄 `index.css`
- Configuração Tailwind CSS
- Classes utilitárias customizadas
- Animações: float, pulse, gradient, slide
- Componentes: glass, btn-primary, card
- Scrollbar customizada
- Gradient text

## 🎨 Design System

### Cores Principais
```css
Primary (Vermelho): #ef4444
Accent (Laranja): #f97316
Dark Background: #0f172a → #1e293b → #334155
```

### Tipografia
- **Display**: Outfit (headings)
- **Body**: DM Sans (texto)

### Componentes Reutilizáveis
- `.glass`: Efeito glassmorphism
- `.btn-primary`: Botão gradiente
- `.btn-secondary`: Botão glass
- `.input-field`: Campo de input
- `.card`: Card com glass effect

### Animações
- **float**: Movimento flutuante
- **pulse-slow**: Pulsação suave
- **gradient**: Gradiente animado
- **slide-up**: Entrada de baixo para cima
- **fade-in**: Fade simples

## 🔐 Segurança

- Senhas hasheadas com bcrypt (salt rounds: 10)
- JWT para autenticação (expira em 7 dias)
- Proteção de rotas no frontend e backend
- Validação de inputs
- SQL injection protegido (queries parametrizadas)
- CORS configurado

## 📊 Fluxo de Dados

### Criar Conta
```
User → Register.jsx → authAPI.register() → 
POST /api/auth/register → authController.register() → 
PostgreSQL INSERT → JWT gerado → Login automático
```

### Marcar Hábito
```
User clica → HabitCard → onToggle() → 
Dashboard.handleToggleHabit() → habitsAPI.toggleComplete() →
POST /api/habits/:id/toggle → habitController.toggleComplete() →
PostgreSQL INSERT/DELETE habit_logs → Stats atualizadas
```

### Ver Estatísticas
```
Dashboard mount → loadData() → 
Promise.all([habitsAPI, statsAPI, progressAPI]) →
3 chamadas simultâneas → Dados renderizados →
Recharts gera gráficos
```

## 🚀 Performance

- **Frontend**: Vite para build ultra-rápido
- **Backend**: Node.js assíncrono
- **Database**: Índices em colunas chave
- **Cache**: user_stats para evitar cálculos pesados
- **Lazy loading**: Componentes carregados sob demanda

## 📦 Dependências Principais

### Backend
- express: Framework web
- pg: Cliente PostgreSQL
- bcryptjs: Hash de senhas
- jsonwebtoken: Autenticação JWT
- cors: Política CORS

### Frontend
- react: UI library
- react-router-dom: Roteamento
- framer-motion: Animações
- recharts: Gráficos
- lucide-react: Ícones
- tailwindcss: Estilização

## 🎯 Funcionalidades

✅ **Autenticação**
- Registro de usuários
- Login com JWT
- Proteção de rotas
- Logout

✅ **Gestão de Hábitos**
- Criar hábitos personalizados
- Editar hábitos (via update)
- Deletar hábitos
- Marcar como completo/incompleto
- Visualizar por dia

✅ **Visualizações**
- Dashboard com métricas
- Lista de hábitos de hoje
- Calendário mensal
- Gráficos de progresso

✅ **Estatísticas**
- Streak atual e recorde
- Taxa de conclusão
- Hábitos mais consistentes
- Progresso dos últimos 30 dias
- Distribuição por dia da semana

✅ **UX/UI**
- Design moderno e criativo
- Animações suaves
- Responsivo (mobile/desktop)
- Feedback visual
- Loading states

---

**Total de Arquivos Criados**: 30+ arquivos
**Linhas de Código**: ~3000+ linhas
**Tempo de Desenvolvimento Estimado**: 10-15 horas manual
