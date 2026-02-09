import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Mail, User, Save, AlertCircle, Key } from 'lucide-react';
import { authAPI } from '../services/api';

const Profile = () => {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    avatarUrl: user?.avatar_url || '',
  });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  // Comprimir imagem
  const compressImage = (base64String, callback) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Redimensionar se maior que 400x400
      if (width > 400 || height > 400) {
        if (width > height) {
          height *= 400 / width;
          width = 400;
        } else {
          width *= 400 / height;
          height = 400;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Converter para base64 com qualidade reduzida
      callback(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.src = base64String;
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      compressImage(reader.result, (compressedImage) => {
        setFormData(prev => ({
          ...prev,
          avatarUrl: compressedImage
        }));
        setSuccess('Imagem selecionada e comprimida!');
        setTimeout(() => setSuccess(''), 2000);
      });
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePwdChange = (e) => {
    const { name, value } = e.target;
    setPwdForm(prev => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!pwdForm.currentPassword || !pwdForm.newPassword) {
      setPwdError('Preencha as senhas');
      return;
    }

    if (pwdForm.newPassword.length < 6) {
      setPwdError('Nova senha deve ter ao menos 6 caracteres');
      return;
    }

    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError('As senhas não coincidem');
      return;
    }

    setPwdLoading(true);
    try {
      const res = await authAPI.changePassword({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      setPwdSuccess(res.message || 'Senha alterada com sucesso');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      // Forçar logout após alteração de senha por segurança
      setTimeout(() => setPwdSuccess(''), 3000);
      await logout();
      navigate('/login');
    } catch (err) {
      setPwdError(err.message || 'Erro ao alterar senha');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validar que o nome não está vazio
      if (!formData.name.trim()) {
        setError('Nome não pode estar vazio');
        setLoading(false);
        return;
      }

      console.log('Atualizando perfil...');
      console.log('Nome:', formData.name);
      console.log('Avatar tamanho:', formData.avatarUrl?.length);

      const updateData = {
        name: formData.name,
      };

      // Só enviar avatar se foi modificado e é uma string válida
      if (formData.avatarUrl && formData.avatarUrl.startsWith('data:')) {
        updateData.avatarUrl = formData.avatarUrl;
      }

      console.log('Enviando:', { ...updateData, avatarUrl: updateData.avatarUrl ? 'presente' : 'vazio' });

      const response = await authAPI.updateProfile(updateData);

      console.log('Resposta do servidor:', response);
      
      if (response && response.user) {
        setUser(response.user);
        setSuccess('Perfil atualizado com sucesso! 🎉');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      let mensagem = 'Erro ao atualizar perfil';
      
      if (err.message.includes('JSON')) {
        mensagem = 'Erro ao processar dados. Tente com uma imagem menor.';
      } else if (err.message.includes('413')) {
        mensagem = 'Arquivo muito grande. Tente uma imagem menor.';
      } else if (err.message) {
        mensagem = err.message;
      }
      
      setError(mensagem);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.button
          onClick={() => navigate('/dashboard')}
          whileHover={{ x: -4 }}
          className="flex items-center gap-2 text-dark-300 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar ao Dashboard
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8"
        >
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold gradient-text">Meu Perfil</h1>
            <p className="text-dark-400 mt-2">Gerencie suas informações pessoais</p>
          </div>

          {/* Alerts */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300">{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-start gap-3"
            >
              <Save className="w-5 h-5 text-green-400" />
              <p className="text-green-300">{success}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Avatar Section */}
            <div>
              <label className="block text-sm font-medium mb-4">Foto de Perfil</label>
              <div className="flex items-center gap-8">
                {/* Avatar Display */}
                <div className="relative">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-primary-500/30 flex items-center justify-center bg-gradient-to-br from-primary-500/20 to-accent-500/20"
                  >
                    {formData.avatarUrl ? (
                      <img 
                        src={formData.avatarUrl} 
                        alt="avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-primary-400" />
                    )}
                  </motion.div>
                  <label htmlFor="avatar-input" className="absolute bottom-2 right-2 cursor-pointer">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl shadow-lg"
                    >
                      <Camera className="w-5 h-5 text-white" />
                    </motion.div>
                  </label>
                </div>

                {/* Upload Info */}
                <div>
                  <h3 className="font-semibold mb-2">Alterar foto</h3>
                  <p className="text-dark-400 text-sm mb-4">
                    Clique no ícone de câmera para escolher uma imagem. Máximo 5MB.
                  </p>
                  <input
                    id="avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium mb-3">Nome</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field pl-12"
                  placeholder="Seu nome completo"
                />
              </div>
            </div>

            {/* Email Field (Read-only) */}
            <div>
              <label className="block text-sm font-medium mb-3">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input-field pl-12 opacity-60 cursor-not-allowed"
                />
              </div>
              <p className="text-dark-400 text-sm mt-2">O email não pode ser alterado</p>
            </div>

            {/* Member Since */}
            <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/30">
              <p className="text-sm text-dark-400">Membro desde</p>
              <p className="text-lg font-semibold text-primary-300 mt-1">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Carregando...'}
              </p>
            </div>

            {/* Change Password */}
            <div className="p-6 rounded-xl bg-dark-800 border border-dark-700">
              <h3 className="font-semibold mb-3 flex items-center gap-2">Alterar Senha <Key className="w-4 h-4 text-dark-300" /></h3>

              {pwdError && <p className="text-red-400 text-sm mb-2">{pwdError}</p>}
              {pwdSuccess && <p className="text-green-400 text-sm mb-2">{pwdSuccess}</p>}

              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="block text-sm text-dark-400 mb-1">Senha Atual</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={pwdForm.currentPassword}
                    onChange={handlePwdChange}
                    className="input-field"
                    placeholder="Digite sua senha atual"
                  />
                </div>

                <div>
                  <label className="block text-sm text-dark-400 mb-1">Nova Senha</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={pwdForm.newPassword}
                    onChange={handlePwdChange}
                    className="input-field"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div>
                  <label className="block text-sm text-dark-400 mb-1">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={pwdForm.confirmPassword}
                    onChange={handlePwdChange}
                    className="input-field"
                    placeholder="Repita a nova senha"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button
                    type="submit"
                    disabled={pwdLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary flex-1"
                  >
                    {pwdLoading ? 'Alterando...' : 'Alterar Senha'}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' })}
                    className="btn-secondary flex-1"
                  >
                    Limpar
                  </motion.button>
                </div>
              </form>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </motion.button>
              <motion.button
                type="button"
                onClick={async () => {
                  await logout();
                  navigate('/login');
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 btn-secondary"
              >
                Logout
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
