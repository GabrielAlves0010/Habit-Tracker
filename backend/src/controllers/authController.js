const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const pool = require('../config/database');

const authController = {
  // Registro de novo usuário
  async register(req, res) {
    try {
      const { name, email, password } = req.body;

      // Validações
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
      }

      // Verificar se email já existe
      const userExists = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (userExists.rows.length > 0) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Inserir usuário
      const result = await pool.query(
        `INSERT INTO users (name, email, password) 
         VALUES ($1, $2, $3) 
         RETURNING id, name, email, created_at`,
        [name, email, hashedPassword]
      );

      const user = result.rows[0];

      // Criar estatísticas iniciais
      await pool.query(
        'INSERT INTO user_stats (user_id) VALUES ($1)',
        [user.id]
      );

      // Gerar token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar_url: null,
          avatarUrl: null,
        },
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  },

  // Login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      // Buscar usuário
      const result = await pool.query(
        'SELECT id, name, email, password, avatar_url FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const user = result.rows[0];

      // Verificar senha
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Gerar token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      res.json({
        message: 'Login realizado com sucesso',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar_url: user.avatar_url,
          avatarUrl: user.avatar_url,
        },
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro ao fazer login' });
    }
  },

  // Obter perfil do usuário
  async getProfile(req, res) {
    try {
      const result = await pool.query(
        'SELECT id, name, email, avatar_url, created_at FROM users WHERE id = $1',
        [req.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const user = result.rows[0];
      res.json({ 
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar_url: user.avatar_url,
          avatarUrl: user.avatar_url, // Para compatibilidade
          created_at: user.created_at
        }
      });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
  },

  // Atualizar perfil
  async updateProfile(req, res) {
    try {
      const { name, avatarUrl } = req.body;

      // Validações
      if (name && name.trim().length === 0) {
        return res.status(400).json({ error: 'Nome não pode estar vazio' });
      }

      // Validar tamanho do avatar se fornecido
      if (avatarUrl) {
        if (avatarUrl.length > 2000000) { // ~2MB em base64
          return res.status(400).json({ error: 'Imagem muito grande. Máximo 2MB.' });
        }
        if (!avatarUrl.startsWith('data:image/')) {
          return res.status(400).json({ error: 'Formato de imagem inválido' });
        }
      }

      console.log(`Atualizando perfil do usuário ${req.userId}: nome="${name}", avatar=${avatarUrl ? 'present' : 'vazio'}`);

      const result = await pool.query(
        `UPDATE users 
         SET name = COALESCE($1, name), 
             avatar_url = COALESCE($2, avatar_url),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3 
         RETURNING id, name, email, avatar_url, created_at, updated_at`,
        [name || null, avatarUrl || null, req.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const user = result.rows[0];
      console.log(`Perfil atualizado com sucesso`);
      
      res.json({
        message: 'Perfil atualizado com sucesso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar_url: user.avatar_url,
          avatarUrl: user.avatar_url,
          created_at: user.created_at,
          updated_at: user.updated_at
        },
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({ error: 'Erro ao atualizar perfil: ' + error.message });
    }
  },

  // Alterar senha
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Nova senha deve ter no mínimo 6 caracteres' });
      }

      // Buscar usuário
      const result = await pool.query('SELECT id, password FROM users WHERE id = $1', [req.userId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const user = result.rows[0];

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Senha atual incorreta' });
      }

      const hashed = await bcrypt.hash(newPassword, 10);

      await pool.query('UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [hashed, req.userId]);

      res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      res.status(500).json({ error: 'Erro ao alterar senha' });
    }
  },

  // Solicitar reset de senha (envia email com token)
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email é obrigatório' });

      const userRes = await pool.query('SELECT id, email, name FROM users WHERE email = $1', [email]);
      if (userRes.rows.length === 0) {
        // Para não vazar existência, retornar mensagem genérica
        return res.json({ message: 'Se o email existir, um link de reset foi enviado' });
      }

      const user = userRes.rows[0];
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

      await pool.query(
        'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, token, expiresAt]
      );

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
      const resetLink = `${frontendUrl}/reset/${token}`;

      // Enviar email se SMTP configurado
      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        try {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: user.email,
            subject: 'Reset de senha - Habit Tracker',
            html: `<p>Olá ${user.name},</p>
                   <p>Recebemos uma solicitação para redefinir sua senha. Clique no link abaixo para criar uma nova senha (válido por 1 hora):</p>
                   <p><a href="${resetLink}">${resetLink}</a></p>
                   <p>Se você não solicitou, ignore esta mensagem.</p>`
          });

          return res.json({ message: 'Se o email existir, um link de reset foi enviado' });
        } catch (mailErr) {
          console.error('Erro ao enviar email de reset:', mailErr);
          // cair para comportamento dev (retornar token) abaixo
        }
      }

      // Ambiente de desenvolvimento: retornar token para testes quando SMTP não configurado
      return res.json({ message: 'DEV_TOKEN', token });
    } catch (error) {
      console.error('Erro forgotPassword:', error);
      res.status(500).json({ error: 'Erro ao solicitar reset de senha' });
    }
  },

  // Resetar senha usando token
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) return res.status(400).json({ error: 'Token e nova senha são obrigatórios' });
      if (newPassword.length < 6) return res.status(400).json({ error: 'Nova senha deve ter no mínimo 6 caracteres' });

      const tokenRes = await pool.query('SELECT id, user_id, expires_at FROM password_resets WHERE token = $1', [token]);
      if (tokenRes.rows.length === 0) return res.status(400).json({ error: 'Token inválido ou expirado' });

      const row = tokenRes.rows[0];
      if (new Date(row.expires_at) < new Date()) {
        return res.status(400).json({ error: 'Token expirado' });
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      await pool.query('UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [hashed, row.user_id]);
      await pool.query('DELETE FROM password_resets WHERE id = $1', [row.id]);

      res.json({ message: 'Senha resetada com sucesso' });
    } catch (error) {
      console.error('Erro resetPassword:', error);
      res.status(500).json({ error: 'Erro ao resetar senha' });
    }
  },
};

module.exports = authController;
