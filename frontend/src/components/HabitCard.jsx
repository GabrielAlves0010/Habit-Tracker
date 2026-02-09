import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Trash2, Edit } from 'lucide-react';

const HabitCard = ({ habit, onToggle, onDelete, delay = 0 }) => {
  const isCompleted = habit.completions_last_7_days > 0; // Simplificado

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02 }}
      className="glass rounded-2xl p-6 cursor-pointer group"
      onClick={() => onToggle(habit.id)}
    >
      <div className="flex items-center gap-4">
        {/* Checkbox */}
        <motion.div
          whileTap={{ scale: 0.9 }}
          className="flex-shrink-0"
        >
          {isCompleted ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center glow"
            >
              <CheckCircle2 className="w-7 h-7 text-white" />
            </motion.div>
          ) : (
            <div 
              className="w-12 h-12 rounded-xl border-2 flex items-center justify-center hover:border-primary-500 transition-colors"
              style={{ borderColor: habit.color + '40' }}
            >
              <Circle className="w-7 h-7" style={{ color: habit.color }} />
            </div>
          )}
        </motion.div>

        {/* Habit Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">{habit.icon}</span>
            <h3 className="text-lg font-bold truncate">
              {habit.title}
            </h3>
          </div>
          {habit.description && (
            <p className="text-sm text-dark-400 truncate">
              {habit.description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-dark-500">
            <span className="flex items-center gap-1">
              🔥 {habit.total_completions || 0} vezes
            </span>
            <span className="flex items-center gap-1">
              📅 {habit.completions_last_7_days || 0} esta semana
            </span>
          </div>
        </div>

        {/* Actions */}
        <div 
          className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(habit.id, habit.title);
            }}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5 text-red-400" />
          </motion.button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 h-2 bg-dark-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ 
            width: `${Math.min((habit.completions_last_7_days / 7) * 100, 100)}%` 
          }}
          transition={{ duration: 1, delay: delay + 0.2 }}
          className="h-full rounded-full"
          style={{ 
            background: `linear-gradient(90deg, ${habit.color}80, ${habit.color})` 
          }}
        />
      </div>
    </motion.div>
  );
};

export default HabitCard;
