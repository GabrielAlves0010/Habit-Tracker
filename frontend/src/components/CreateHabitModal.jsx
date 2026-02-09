import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

const EMOJI_OPTIONS = ['🎯', '💪', '📚', '🏃', '🧘', '💤', '💧', '🍎', '✍️', '🎨', '🎵', '📱', '🧹', '💼'];
const COLOR_OPTIONS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
];

const CreateHabitModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '🎯',
    color: '#6366f1',
    frequency: 'daily',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="glass rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Criar Novo Hábito</h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Nome do Hábito *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                placeholder="Ex: Ler 30 minutos"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Descrição (opcional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field resize-none"
                rows="3"
                placeholder="Adicione detalhes sobre seu hábito..."
              />
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Escolha um Ícone
              </label>
              <div className="grid grid-cols-7 gap-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <motion.button
                    key={emoji}
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setFormData({ ...formData, icon: emoji })}
                    className={`p-3 text-2xl rounded-xl transition-all ${
                      formData.icon === emoji
                        ? 'bg-primary-500/20 ring-2 ring-primary-500'
                        : 'glass-hover'
                    }`}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Escolha uma Cor
              </label>
              <div className="grid grid-cols-8 gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <motion.button
                    key={color}
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-10 h-10 rounded-xl transition-all ${
                      formData.color === color
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-900'
                        : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Frequência
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['daily', 'weekly'].map((freq) => (
                  <motion.button
                    key={freq}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData({ ...formData, frequency: freq })}
                    className={`p-4 rounded-xl font-semibold transition-all ${
                      formData.frequency === freq
                        ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white'
                        : 'glass-hover'
                    }`}
                  >
                    {freq === 'daily' ? '📅 Diário' : '📆 Semanal'}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="glass-hover p-4 rounded-2xl">
              <p className="text-sm text-dark-400 mb-3">Preview:</p>
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: formData.color + '30' }}
                >
                  {formData.icon}
                </div>
                <div>
                  <p className="font-bold">{formData.title || 'Nome do Hábito'}</p>
                  <p className="text-sm text-dark-400">
                    {formData.description || 'Sem descrição'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Cancelar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="btn-primary flex-1"
              >
                Criar Hábito
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateHabitModal;
