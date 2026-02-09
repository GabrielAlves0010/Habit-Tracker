# 🎯 Habit Tracker - Guia de Instalação e Uso Completo

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (v16 ou superior) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 ou superior) - [Download](https://www.postgresql.org/download/)
- **npm** ou **yarn** (vem com Node.js)

## 🗄️ Configuração do Banco de Dados

### 1. Instalar PostgreSQL

**Windows:**
- Baixe o instalador do site oficial
- Execute e siga as instruções
- Anote a senha do usuário `postgres`

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Criar o Banco de Dados

Abra o terminal PostgreSQL:

**Windows:** Abra "SQL Shell (psql)" do menu Iniciar

**macOS/Linux:**
```bash
sudo -u postgres psql
```

Execute os comandos do arquivo `backend/database.sql`:

```sql
-- Criar o banco
CREATE DATABASE habit_tracker;

-- Conectar ao banco
\c habit_tracker

-- Copie e cole todo o conteúdo de backend/database.sql aqui
```

Ou execute diretamente:
```bash
psql -U postgres -d habit_tracker -f backend/database.sql
```

## 🚀 Instalação do Backend

### 1. Navegar até a pasta do backend
```bash
cd backend
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

**Windows (PowerShell):**
```powershell
copy .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
PORT=5000
NODE_ENV=development

# Suas credenciais do PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=habit_tracker
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui

# Gere uma chave secreta aleatória (ou use esta)
JWT_SECRET=minha_chave_super_secreta_123456789
JWT_EXPIRE=7d

CLIENT_URL=http://localhost:5173
```

### 4. Iniciar o servidor
```bash
npm run dev
```

O backend estará rodando em: **http://localhost:5000**

Você deve ver:
```
🚀 Servidor rodando na porta 5000
📍 http://localhost:5000
🔗 Ambiente: development
✅ Conectado ao PostgreSQL
```

## 💻 Instalação do Frontend

### 1. Abrir um NOVO terminal e navegar até a pasta frontend
```bash
cd frontend
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

O conteúdo já está correto:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Iniciar o aplicativo
```bash
npm run dev
```

O frontend estará rodando em: **http://localhost:5173**

Abra seu navegador e acesse: **http://localhost:5173**

## 🎨 Usando o Aplicativo

### 1. Criar Conta
- Acesse http://localhost:5173
- Clique em "Criar conta"
- Preencha: Nome, Email, Senha
- Clique em "Criar Conta"

### 2. Fazer Login
- Use o email e senha que você criou
- Clique em "Entrar"

### 3. Dashboard Principal

#### Criar um Hábito
1. Clique no botão **"+ Novo Hábito"**
2. Preencha:
   - Nome (ex: "Exercícios")
   - Descrição (opcional)
   - Escolha um ícone (💪, 🏃, etc.)
   - Escolha uma cor
   - Frequência (Diário ou Semanal)
3. Clique em **"Criar Hábito"**

#### Marcar Hábito como Completo
- Na aba "Hoje", clique no card do hábito
- O círculo ficará preenchido e colorido
- Clique novamente para desmarcar

#### Visualizar Calendário
- Clique na aba **"Calendário"**
- Veja todos os dias que você completou hábitos
- Clique em um dia para ver detalhes

#### Visualizar Estatísticas
- Clique na aba **"Estatísticas"**
- Veja gráficos de:
  - Progresso dos últimos 30 dias
  - Hábitos mais consistentes
  - Taxa de conclusão

### 4. Métricas no Dashboard

- **🎯 Hábitos Ativos**: Total de hábitos que você criou
- **🔥 Dias Seguidos**: Sua sequência atual (streak)
- **✅ Total Completo**: Quantas vezes você completou hábitos
- **📈 Taxa de Sucesso**: Porcentagem de conclusão

## 🛠️ Comandos Úteis

### Backend
```bash
# Iniciar em desenvolvimento (com auto-reload)
npm run dev

# Iniciar em produção
npm start
```

### Frontend
```bash
# Iniciar em desenvolvimento
npm run dev

# Criar build de produção
npm run build

# Preview do build
npm run preview
```

## 🔧 Solução de Problemas

### Backend não conecta ao PostgreSQL
**Erro:** "Erro no PostgreSQL"

**Solução:**
1. Verifique se o PostgreSQL está rodando:
   ```bash
   # Linux/Mac
   sudo systemctl status postgresql
   
   # Windows - Abra "Services" e procure por PostgreSQL
   ```

2. Verifique as credenciais no `.env`:
   - `DB_USER` e `DB_PASSWORD` devem estar corretos
   - Teste a conexão com: `psql -U postgres -d habit_tracker`

### Porta 5000 ou 5173 já em uso
**Erro:** "Port 5000 is already in use"

**Solução:**
1. Mude a porta no arquivo `.env` (backend) ou `vite.config.js` (frontend)
2. Ou encerre o processo que está usando a porta:
   ```bash
   # Linux/Mac
   lsof -ti:5000 | xargs kill
   
   # Windows (PowerShell)
   Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process
   ```

### Erro ao criar tabelas
**Erro:** "relation already exists"

**Solução:**
1. As tabelas já existem! Você está pronto para usar
2. Se quiser recomeçar do zero:
   ```sql
   DROP DATABASE habit_tracker;
   CREATE DATABASE habit_tracker;
   \c habit_tracker
   -- Execute novamente o database.sql
   ```

### Frontend não se conecta ao backend
**Erro:** "Network Error" ou "Failed to fetch"

**Solução:**
1. Certifique-se que o backend está rodando (http://localhost:5000)
2. Verifique o `VITE_API_URL` no `.env` do frontend
3. Limpe o cache do navegador (Ctrl+Shift+R)

## 📱 Recursos do Sistema

### ✅ Completo
- ✅ Autenticação completa (Login/Registro)
- ✅ CRUD de hábitos
- ✅ Sistema de tracking diário
- ✅ Dashboard interativo com animações
- ✅ Gráficos de progresso
- ✅ Calendário visual
- ✅ Estatísticas detalhadas
- ✅ Cálculo de streaks
- ✅ Design moderno e responsivo
- ✅ Tema escuro com efeitos glass
- ✅ Animações suaves com Framer Motion

### 🎨 Design
- Interface moderna com glassmorphism
- Paleta de cores vibrante (vermelho/laranja)
- Tipografia customizada (Outfit + DM Sans)
- Animações e micro-interações
- Responsivo para mobile e desktop

## 📊 Estrutura de Dados

### Usuário
- Nome, email, senha (hash bcrypt)
- Avatar (URL)
- Data de criação

### Hábito
- Título, descrição
- Ícone emoji, cor
- Frequência (diário/semanal)
- Status ativo/inativo

### Registro (Log)
- Hábito relacionado
- Data de conclusão
- Notas opcionais

### Estatísticas
- Total de hábitos
- Hábitos ativos
- Total de conclusões
- Streak atual
- Maior streak
- Taxa de conclusão

## 🚀 Próximos Passos (Ideias para Expandir)

1. **Notificações Push**: Lembretes para completar hábitos
2. **Compartilhamento**: Compartilhar progresso nas redes sociais
3. **Gamificação**: Sistema de pontos, badges, níveis
4. **Grupos**: Criar grupos de hábitos com amigos
5. **Exportar Dados**: Download de relatórios em PDF
6. **Temas**: Modo claro, customização de cores
7. **Mobile App**: Versão nativa com React Native
8. **Widgets**: Widget para tela inicial do celular

## 📄 Licença

Este projeto é open source e está disponível para uso pessoal e educacional.

## 💡 Dicas

- Complete hábitos todo dia para aumentar seu streak! 🔥
- Use cores e ícones que te motivem
- Comece com poucos hábitos (3-5) e adicione gradualmente
- Revise suas estatísticas semanalmente
- Seja consistente, não perfeito!

---

**Desenvolvido com ❤️ usando React, Node.js, PostgreSQL e Tailwind CSS**

Bons hábitos! 🎯✨
