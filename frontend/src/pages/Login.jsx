import { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        layout
      >
        <motion.h2 layout="position" className="auth-title">
          {isLogin ? 'Welcome Back' : 'Join CCMS'}
        </motion.h2>
        <motion.p layout="position" className="auth-subtitle">
          {isLogin ? 'Log in to manage your college clubs' : 'Create an account to start joining clubs'}
        </motion.p>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="error-msg"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div
                key="name-field"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="form-group"
              >
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div layout className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="admin@ccms.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </motion.div>

          <motion.div layout className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </motion.div>

          <motion.button
            layout
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Processing...' : isLogin ? 'Log In' : 'Create Account'}
          </motion.button>
        </form>

        <motion.div layout className="auth-toggle">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign up' : 'Log in'}
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;