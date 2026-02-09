
# 🚀 GUIA RÁPIDO DE CONFIGURAÇÃO - Habit Tracker

## ✅ Já Configurado
- ✅ Arquivo .env criado em `backend/.env`
- ✅ Dependências do backend instaladas
- ✅ Dependências do frontend instaladas

## 🗄️ PRÓXIMO PASSO: Configurar Banco de Dados

### Opção 1: Usando pgAdmin (Mais Fácil)
1. Abra pgAdmin (aplicativo que veio com PostgreSQL)
2. Conecte ao servidor `localhost` 
3. Crie um novo banco chamado `habit_tracker`
4. Abra o Query Tool e copie/cole o conteúdo de `backend/database.sql`
5. Execute (F5 ou Ctrl+Enter)

### Opção 2: Usando SQL Shell (psql)
1. Abra "SQL Shell (psql)" do menu Iniciar
2. Pressione Enter para aceitar os padrões até pedir a senha
3. Digite sua senha (1234577)
4. Execute estes comandos:

\`\`\`sql
CREATE DATABASE habit_tracker;
\c habit_tracker
-- Cole o conteúdo do arquivo backend/database.sql aqui
\`\`\`

## 🎯 Depois do Banco de Dados Pronto

### Terminal 1 - Iniciar Backend:
\`\`\`bash
cd backend
npm run dev
\`\`\`

Você deve ver: "Servidor rodando na porta 5000"

### Terminal 2 - Iniciar Frontend:
\`\`\`bash
cd frontend
npm run dev
\`\`\`

Você deve ver: "VITE v5... ready in ... ms"

### 🌐 Acessar a Aplicação
Abra: http://localhost:5173

## ⚙️ Informações Importantes

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173
- **Banco de Dados**: habit_tracker
- **Usuário PostgreSQL**: postgres
- **Senha**: 1234577

## 🆘 Se Algo Não Funcionar

1. **Erro de conexão com banco**: Verifique se PostgreSQL está rodando e se a senha está correta
2. **Porta 5000 já em uso**: Mude `PORT` em `backend/.env`
3. **Porta 5173 já em uso**: já é tratado automaticamente pelo Vite

