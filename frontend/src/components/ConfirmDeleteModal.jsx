import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Trash2, X } from 'lucide-react';

const ConfirmDeleteModal = ({ 
  isOpen, 
  habitTitle, 
  onConfirm, 
  onCancel, 
  loading 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onCancel}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm p-6"
          >
            <div className="glass rounded-2xl p-6">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                  className="p-4 rounded-full bg-red-500/20 border border-red-500/30"
                >
                  <Trash2 className="w-6 h-6 text-red-400" />
                </motion.div>
              </div>

              {/* Text */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Deletar Hábito?</h2>
                <p className="text-dark-300">
                  Tem certeza que deseja deletar <span className="font-semibold text-white">"{habitTitle}"</span>?
                </p>
                <p className="text-dark-400 text-sm mt-2">Esta ação não pode ser desfeita.</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onCancel}
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-xl glass hover:bg-white/10 transition-colors font-semibold disabled:opacity-50"
                >
                  Cancelar
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/50 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Deletando...' : 'Deletar'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDeleteModal;
