const pool = require('../config/database');

const statsController = {
  // Obter estatísticas gerais do usuário
  async getStats(req, res) {
    try {
      // Estatísticas básicas
      const statsResult = await pool.query(
        'SELECT * FROM user_stats WHERE user_id = $1',
        [req.userId]
      );

      // Calcular streak atual
      const streakResult = await pool.query(
        `WITH RECURSIVE date_series AS (
          SELECT CURRENT_DATE::date as check_date, 0 as streak
          UNION ALL
          SELECT (check_date - INTERVAL '1 day')::date, streak + 1
          FROM date_series
          WHERE (check_date - INTERVAL '1 day')::date IN (
            SELECT DISTINCT completed_date::date 
            FROM habit_logs 
            WHERE user_id = $1
          )
          AND streak < 365
        )
        SELECT COALESCE(MAX(streak), 0) as current_streak FROM date_series`,
        [req.userId]
      );

      // Calcular maior streak
      const longestStreakResult = await pool.query(
        `WITH date_groups AS (
          SELECT 
            completed_date,
            completed_date - (ROW_NUMBER() OVER (ORDER BY completed_date))::integer AS grp
          FROM (
            SELECT DISTINCT completed_date
            FROM habit_logs
            WHERE user_id = $1
            ORDER BY completed_date
          ) t
        )
        SELECT MAX(days) as longest_streak
        FROM (
          SELECT COUNT(*) as days
          FROM date_groups
          GROUP BY grp
        ) streaks`,
        [req.userId]
      );

      // Taxa de conclusão nos últimos 30 dias
      const completionRateResult = await pool.query(
        `SELECT 
          COUNT(DISTINCT hl.completed_date) * 100.0 / 
          NULLIF(COUNT(DISTINCT h.id) * 30, 0) as completion_rate_30d
         FROM habits h
         LEFT JOIN habit_logs hl ON h.id = hl.habit_id 
           AND hl.completed_date >= CURRENT_DATE - INTERVAL '30 days'
         WHERE h.user_id = $1 AND h.is_active = true`,
        [req.userId]
      );

      // Hábitos mais consistentes
      const topHabitsResult = await pool.query(
        `SELECT 
          h.id, h.title, h.color, h.icon,
          COUNT(hl.id) as completions,
          COUNT(CASE WHEN hl.completed_date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as last_week
         FROM habits h
         LEFT JOIN habit_logs hl ON h.id = hl.habit_id
         WHERE h.user_id = $1 AND h.is_active = true
         GROUP BY h.id
         ORDER BY completions DESC
         LIMIT 5`,
        [req.userId]
      );

      // Completions por dia da semana
      const weekdayResult = await pool.query(
        `SELECT 
          EXTRACT(DOW FROM completed_date) as day_of_week,
          COUNT(*) as completions
         FROM habit_logs
         WHERE user_id = $1
         GROUP BY day_of_week
         ORDER BY day_of_week`,
        [req.userId]
      );

      const stats = statsResult.rows[0] || {};
      const currentStreak = streakResult.rows[0]?.current_streak || 0;
      const longestStreak = longestStreakResult.rows[0]?.longest_streak || 0;
      const completionRate30d = parseFloat(completionRateResult.rows[0]?.completion_rate_30d || 0).toFixed(2);

      res.json({
        stats: {
          totalHabits: stats.total_habits || 0,
          activeHabits: stats.active_habits || 0,
          totalCompletions: stats.total_completions || 0,
          currentStreak,
          longestStreak,
          completionRate: completionRate30d,
        },
        topHabits: topHabitsResult.rows,
        weekdayDistribution: weekdayResult.rows,
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  },

  // Gráfico de progresso (últimos 30 dias)
  async getProgress(req, res) {
    try {
      const result = await pool.query(
        `SELECT 
          completed_date::date as date,
          COUNT(DISTINCT habit_id) as habits_completed,
          COUNT(*) as total_completions
         FROM habit_logs
         WHERE user_id = $1 
           AND completed_date >= CURRENT_DATE - INTERVAL '30 days'
         GROUP BY completed_date::date
         ORDER BY date ASC`,
        [req.userId]
      );

      // Preencher dias faltantes com zero
      const progress = [];
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayData = result.rows.find(row => row.date.toISOString().split('T')[0] === dateStr);
        
        progress.push({
          date: dateStr,
          habitsCompleted: dayData ? parseInt(dayData.habits_completed) : 0,
          totalCompletions: dayData ? parseInt(dayData.total_completions) : 0,
        });
      }

      res.json({ progress });
    } catch (error) {
      console.error('Erro ao buscar progresso:', error);
      res.status(500).json({ error: 'Erro ao buscar progresso' });
    }
  },

  // Heatmap de atividade (últimos 365 dias)
  async getHeatmap(req, res) {
    try {
      const result = await pool.query(
        `SELECT 
          completed_date::date as date,
          COUNT(*) as count
         FROM habit_logs
         WHERE user_id = $1 
           AND completed_date >= CURRENT_DATE - INTERVAL '365 days'
         GROUP BY completed_date::date
         ORDER BY date ASC`,
        [req.userId]
      );

      res.json({ heatmap: result.rows });
    } catch (error) {
      console.error('Erro ao buscar heatmap:', error);
      res.status(500).json({ error: 'Erro ao buscar heatmap' });
    }
  },
};

module.exports = statsController;
