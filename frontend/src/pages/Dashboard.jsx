import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { habitsAPI, statsAPI } from '../services/api';
import { 
  Plus, Target, TrendingUp, Flame, Calendar,
  CheckCircle2, BarChart3, User, Settings
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import HabitCard from '../components/HabitCard';
import CreateHabitModal from '../components/CreateHabitModal';
import CalendarView from '../components/CalendarView';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [habits, setHabits] = useState([]);
  const [stats, setStats] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeView, setActiveView] = useState('today'); // today, calendar, stats
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, habitId: null, habitTitle: '' });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [habitsData, statsData, progressData] = await Promise.all([
        habitsAPI.getAll(),
        statsAPI.getStats(),
        statsAPI.getProgress(),
      ]);

      setHabits(habitsData.habits || []);
      setStats(statsData.stats || {});
      setProgress(progressData.progress || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleHabit = async (habitId) => {
    try {
      await habitsAPI.toggleComplete(habitId, { date: new Date().toISOString().split('T')[0] });
      loadData();
    } catch (error) {
      console.error('Erro ao marcar hábito:', error);
    }
  };

  const handleCreateHabit = async (habitData) => {
    try {
      await habitsAPI.create(habitData);
      setShowCreateModal(false);
      loadData();
    } catch (error) {
      console.error('Erro ao criar hábito:', error);
    }
  };

  const handleDeleteHabit = (habitId, habitTitle) => {
    setDeleteConfirm({ 
      isOpen: true, 
      habitId, 
      habitTitle 
    });
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await habitsAPI.delete(deleteConfirm.habitId);
      setDeleteConfirm({ isOpen: false, habitId: null, habitTitle: '' });
      loadData();
    } catch (error) {
      console.error('Erro ao deletar hábito:', error);
    } finally {
      setDeleting(false);
    }
  };

  const todayHabits = habits.filter(h => h.is_active);
  
  // Calcular hábitos completados hoje
  const todayDate = new Date().toISOString().split('T')[0];
  const completedToday = todayHabits.filter(h => 
    h.completions_last_7_days > 0 // Simplificado - idealmente verificaria logs
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Flame className="w-12 h-12 text-primary-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <Link to="/profile" className="relative group cursor-pointer">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary-500/30 group-hover:border-primary-500 flex items-center justify-center bg-gradient-to-br from-primary-500/20 to-accent-500/20 transition-colors"
              >
                {user?.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt="avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-primary-400" />
                )}
              </motion.div>
              <div className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <Settings className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>

            {/* Welcome Text */}
            <div>
              <h1 className="text-4xl font-display font-bold gradient-text mb-2">
                Olá, {user?.name}! 👋
              </h1>
              <p className="text-dark-300">
                {new Date().toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Hábito
          </motion.button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary-500/20 rounded-lg">
                <Target className="w-6 h-6 text-primary-400" />
              </div>
            </div>
            <p className="text-3xl font-bold">{stats?.activeHabits || 0}</p>
            <p className="text-sm text-dark-400">Hábitos Ativos</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-accent-500/20 rounded-lg">
                <Flame className="w-6 h-6 text-accent-400 flame" />
              </div>
            </div>
            <p className="text-3xl font-bold">{stats?.currentStreak || 0}</p>
            <p className="text-sm text-dark-400">Dias Seguidos</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold">{stats?.totalCompletions || 0}</p>
            <p className="text-sm text-dark-400">Total Completo</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold">{stats?.completionRate || 0}%</p>
            <p className="text-sm text-dark-400">Taxa de Sucesso</p>
          </motion.div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 mb-6">
          {['today', 'calendar', 'stats'].map((view) => (
            <motion.button
              key={view}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveView(view)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeView === view
                  ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                  : 'glass-hover'
              }`}
            >
              {view === 'today' && 'Hoje'}
              {view === 'calendar' && 'Calendário'}
              {view === 'stats' && 'Estatísticas'}
            </motion.button>
          ))}
        </div>

        {/* Content based on active view */}
        {activeView === 'today' && (
          <motion.div
            key="today"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* Progress Bar */}
            <div className="glass rounded-2xl p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Progresso de Hoje</h3>
                <span className="text-2xl font-bold gradient-text">
                  {todayHabits.length > 0 ? Math.round((completedToday / todayHabits.length) * 100) : 0}%
                </span>
              </div>
              <div className="h-4 bg-dark-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${todayHabits.length > 0 ? (completedToday / todayHabits.length) * 100 : 0}%` 
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                />
              </div>
              <p className="text-sm text-dark-400 mt-2">
                {completedToday} de {todayHabits.length} hábitos completados
              </p>
            </div>

            {/* Habits List */}
            <div className="grid gap-4">
              {todayHabits.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center">
                  <Target className="w-16 h-16 mx-auto mb-4 text-dark-600" />
                  <h3 className="text-xl font-bold mb-2">Nenhum hábito ainda</h3>
                  <p className="text-dark-400 mb-6">Comece criando seu primeiro hábito!</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary"
                  >
                    <Plus className="w-5 h-5 mr-2 inline" />
                    Criar Primeiro Hábito
                  </button>
                </div>
              ) : (
                todayHabits.map((habit, index) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onToggle={handleToggleHabit}
                    onDelete={handleDeleteHabit}
                    delay={index * 0.1}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}

        {activeView === 'calendar' && (
          <CalendarView habits={habits} />
        )}

        {activeView === 'stats' && (
          <div className="space-y-6">
            {/* Progress Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold mb-6">Progresso dos Últimos 30 Dias</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={progress}>
                  <defs>
                    <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b"
                    tickFormatter={(date) => new Date(date).getDate()}
                  />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '12px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="habitsCompleted" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCompletions)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Top Habits */}
            {stats?.topHabits && stats.topHabits.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-6"
              >
                <h3 className="text-xl font-bold mb-6">Hábitos Mais Consistentes</h3>
                <div className="space-y-4">
                  {stats.topHabits.map((habit, index) => (
                    <div key={habit.id} className="flex items-center gap-4">
                      <div className="text-2xl">{habit.icon}</div>
                      <div className="flex-1">
                        <p className="font-semibold">{habit.title}</p>
                        <p className="text-sm text-dark-400">
                          {habit.completions} completions
                        </p>
                      </div>
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold"
                        style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
                      >
                        #{index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Create Habit Modal */}
      {showCreateModal && (
        <CreateHabitModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateHabit}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal 
        isOpen={deleteConfirm.isOpen}
        habitTitle={deleteConfirm.habitTitle}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, habitId: null, habitTitle: '' })}
        loading={deleting}
      />
    </div>
  );
};

export default Dashboard;
