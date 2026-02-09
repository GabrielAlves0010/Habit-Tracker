import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function ResetPassword() {
  const { token: tokenParam } = useParams();
  const [token, setToken] = useState(tokenParam || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (newPassword !== confirm) return setMessage('Senhas não conferem');
    setLoading(true);
    try {
      await authAPI.resetPassword({ token, newPassword });
      setMessage('Senha alterada com sucesso. Faça login com a nova senha.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setMessage(err.message || 'Erro ao resetar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Redefinir senha</h2>
        <form onSubmit={handleSubmit}>
          {!token && (
            <>
              <label className="block mb-2">Token</label>
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full p-2 border rounded mb-4"
                required
              />
            </>
          )}

          <label className="block mb-2">Nova senha</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            required
          />

          <label className="block mb-2">Confirmar senha</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            required
          />

          <button className="w-full bg-blue-600 text-white p-2 rounded" disabled={loading}>
            {loading ? 'Processando...' : 'Resetar senha'}
          </button>
        </form>
        {message && <p className="mt-4 text-sm">{message}</p>}
      </div>
    </div>
  );
}
