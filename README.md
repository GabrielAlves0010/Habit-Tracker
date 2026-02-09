# 🎯 Habit Tracker - Controle Inteligente de Hábitos

Sistema completo de rastreamento de hábitos com autenticação, dashboard interativo, gráficos e calendário.

## 🚀 Tecnologias

**Backend:**
- Node.js + Express
- PostgreSQL
- JWT Authentication
- bcrypt

**Frontend:**
- React 18
- Tailwind CSS
- Recharts (gráficos)
- Framer Motion (animações)
- React Router

## 📁 Estrutura do Projeto

```
habit-tracker/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── utils/
│   │   └── App.jsx
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## 🎨 Features

- ✅ Autenticação completa (Login/Registro)
- ✅ Dashboard interativo
- ✅ Criação e gerenciamento de hábitos
- ✅ Calendário de visualização
- ✅ Gráficos de progresso
- ✅ Estatísticas detalhadas
- ✅ Sistema de streaks (sequências)
- ✅ Temas e personalização

## 🏃 Como Executar

### Backend
```bash
cd backend
npm install
# Configure o .env com suas credenciais PostgreSQL
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🗄️ Banco de Dados

Execute os scripts SQL em `backend/database.sql` para criar as tabelas necessárias.

## 🔐 Recuperação de senha por email

- O backend oferece endpoints para solicitar reset (`POST /api/auth/forgot`) e para aplicar o reset (`POST /api/auth/reset`).
- Para envio de emails, configure variáveis SMTP no arquivo `backend/.env` (ex.: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`).
- Se o SMTP não estiver configurado em desenvolvimento, o endpoint de `forgot` retorna um `token` no corpo da resposta para testes locais.

Exemplo rápido (desenvolvimento):

1. Solicitar token:
```
curl -X POST http://localhost:3000/api/auth/forgot -H "Content-Type: application/json" -d '{"email":"your@example.com"}'
```
2. Usar token retornado para resetar senha:
```
curl -X POST http://localhost:3000/api/auth/reset -H "Content-Type: application/json" -d '{"token":"<TOKEN>","newPassword":"123456"}'
```

## 📦 Deploy (GitHub Pages)

O frontend pode ser publicado diretamente no GitHub Pages. Existe uma GitHub Action que compila `frontend` e publica o conteúdo de `frontend/dist` automaticamente sempre que você der push na branch `main`.

- Live demo (após deploy): https://GabrielAlves0010.github.io/Habit-Tracker

Se preferir usar Vercel/Netlify a integração também é rápida (basta apontar para a pasta `frontend` e usar `npm run build` como comando de build).

