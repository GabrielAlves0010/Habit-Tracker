const pool = require('../config/database');

const habitController = {
  // Listar todos os hábitos do usuário
  async getAll(req, res) {
    try {
      const result = await pool.query(
        `SELECT h.*, 
         COUNT(hl.id) as total_completions,
         COUNT(CASE WHEN hl.completed_date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as completions_last_7_days
         FROM habits h
         LEFT JOIN habit_logs hl ON h.id = hl.habit_id
         WHERE h.user_id = $1
         GROUP BY h.id
         ORDER BY h.created_at DESC`,
        [req.userId]
      );

      res.json({ habits: result.rows });
    } catch (error) {
      console.error('Erro ao buscar hábitos:', error);
      res.status(500).json({ error: 'Erro ao buscar hábitos' });
    }
  },

  // Criar novo hábito
  async create(req, res) {
    try {
      const { title, description, color, icon, frequency, goalDays, reminderTime } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Título é obrigatório' });
      }

      const result = await pool.query(
        `INSERT INTO habits (user_id, title, description, color, icon, frequency, goal_days, reminder_time)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          req.userId,
          title,
          description || null,
          color || '#6366f1',
          icon || '🎯',
          frequency || 'daily',
          JSON.stringify(goalDays || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
          reminderTime || null,
        ]
      );

      // Atualizar estatísticas
      await pool.query(
        `UPDATE user_stats 
         SET total_habits = total_habits + 1,
             active_habits = active_habits + 1,
             last_updated = CURRENT_TIMESTAMP
         WHERE user_id = $1`,
        [req.userId]
      );

      res.status(201).json({
        message: 'Hábito criado com sucesso',
        habit: result.rows[0],
      });
    } catch (error) {
      console.error('Erro ao criar hábito:', error);
      res.status(500).json({ error: 'Erro ao criar hábito' });
    }
  },

  // Atualizar hábito
  async update(req, res) {
    try {
      const { id } = req.params;
      const { title, description, color, icon, frequency, goalDays, reminderTime, isActive } = req.body;

      const result = await pool.query(
        `UPDATE habits 
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             color = COALESCE($3, color),
             icon = COALESCE($4, icon),
             frequency = COALESCE($5, frequency),
             goal_days = COALESCE($6, goal_days),
             reminder_time = COALESCE($7, reminder_time),
             is_active = COALESCE($8, is_active)
         WHERE id = $9 AND user_id = $10
         RETURNING *`,
        [
          title,
          description,
          color,
          icon,
          frequency,
          goalDays ? JSON.stringify(goalDays) : null,
          reminderTime,
          isActive,
          id,
          req.userId,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Hábito não encontrado' });
      }

      res.json({
        message: 'Hábito atualizado com sucesso',
        habit: result.rows[0],
      });
    } catch (error) {
      console.error('Erro ao atualizar hábito:', error);
      res.status(500).json({ error: 'Erro ao atualizar hábito' });
    }
  },

  // Deletar hábito
  async delete(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM habits WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, req.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Hábito não encontrado' });
      }

      // Atualizar estatísticas
      await pool.query(
        `UPDATE user_stats 
         SET total_habits = total_habits - 1,
             active_habits = GREATEST(active_habits - 1, 0),
             last_updated = CURRENT_TIMESTAMP
         WHERE user_id = $1`,
        [req.userId]
      );

      res.json({ message: 'Hábito deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar hábito:', error);
      res.status(500).json({ error: 'Erro ao deletar hábito' });
    }
  },

  // Marcar hábito como completo em uma data
  async toggleComplete(req, res) {
    try {
      const { id } = req.params;
      const { date, notes } = req.body;

      const completedDate = date || new Date().toISOString().split('T')[0];

      // Verificar se já existe registro
      const existing = await pool.query(
        'SELECT id FROM habit_logs WHERE habit_id = $1 AND completed_date = $2',
        [id, completedDate]
      );

      if (existing.rows.length > 0) {
        // Remover registro (desmarcar)
        await pool.query(
          'DELETE FROM habit_logs WHERE habit_id = $1 AND completed_date = $2',
          [id, completedDate]
        );

        await pool.query(
          `UPDATE user_stats 
           SET total_completions = GREATEST(total_completions - 1, 0),
               last_updated = CURRENT_TIMESTAMP
           WHERE user_id = $1`,
          [req.userId]
        );

        return res.json({ message: 'Hábito desmarcado', completed: false });
      } else {
        // Criar registro (marcar)
        await pool.query(
          'INSERT INTO habit_logs (habit_id, user_id, completed_date, notes) VALUES ($1, $2, $3, $4)',
          [id, req.userId, completedDate, notes || null]
        );

        await pool.query(
          `UPDATE user_stats 
           SET total_completions = total_completions + 1,
               last_updated = CURRENT_TIMESTAMP
           WHERE user_id = $1`,
          [req.userId]
        );

        return res.json({ message: 'Hábito completado', completed: true });
      }
    } catch (error) {
      console.error('Erro ao marcar hábito:', error);
      res.status(500).json({ error: 'Erro ao marcar hábito' });
    }
  },

  // Obter histórico de um hábito
  async getHistory(req, res) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      let query = `
        SELECT hl.*, h.title, h.color, h.icon
        FROM habit_logs hl
        JOIN habits h ON hl.habit_id = h.id
        WHERE hl.habit_id = $1 AND hl.user_id = $2
      `;

      const params = [id, req.userId];

      if (startDate) {
        query += ` AND hl.completed_date >= $${params.length + 1}`;
        params.push(startDate);
      }

      if (endDate) {
        query += ` AND hl.completed_date <= $${params.length + 1}`;
        params.push(endDate);
      }

      query += ' ORDER BY hl.completed_date DESC';

      const result = await pool.query(query, params);

      res.json({ history: result.rows });
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
  },

  // Obter calendário de todos os hábitos (últimos 90 dias)
  async getCalendar(req, res) {
    try {
      const result = await pool.query(
        `SELECT h.id, h.title, h.color, h.icon, hl.completed_date
         FROM habits h
         LEFT JOIN habit_logs hl ON h.id = hl.habit_id 
           AND hl.completed_date >= CURRENT_DATE - INTERVAL '90 days'
         WHERE h.user_id = $1 AND h.is_active = true
         ORDER BY hl.completed_date DESC`,
        [req.userId]
      );

      // Agrupar por hábito
      const calendar = {};
      result.rows.forEach((row) => {
        if (!calendar[row.id]) {
          calendar[row.id] = {
            id: row.id,
            title: row.title,
            color: row.color,
            icon: row.icon,
            completedDates: [],
          };
        }
        if (row.completed_date) {
          calendar[row.id].completedDates.push(row.completed_date);
        }
      });

      res.json({ calendar: Object.values(calendar) });
    } catch (error) {
      console.error('Erro ao buscar calendário:', error);
      res.status(500).json({ error: 'Erro ao buscar calendário' });
    }
  },
};

module.exports = habitController;
