import { motion } from 'framer-motion';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';

const universalLogo = `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='24' fill='%236366f1'/%3E%3Cpath d='M50 25a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM30 50a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM70 50a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM50 45c-8 0-14 6-14 14v15h28V59c0-8-6-14-14-14zM22 60c-6 0-10 4-10 10v10h16V70c0-4 2-8 5-10h-11zM78 60h-11c3 2 5 6 5 10v10h16V70c0-6-4-10-10-10z' fill='white'/%3E%3C/svg%3E`;

const ClubCard = ({ club, index, onDelete, onViewMembers }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);

  const handleJoin = async () => {
    setLoading(true);
    try {
      await api.post('/memberships', { clubId: club._id });
      setJoined(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Error joining club');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, delay: index * 0.05 }}
      whileHover={{ y: -6, boxShadow: '0 20px 40px -10px rgba(99, 102, 241, 0.3)' }}
      className="card"
    >
      {user.role === 'superadmin' && <div className="badge admin">Superadmin</div>}
      
      <div className="club-header">
        <img src={universalLogo} alt="Club Logo" className="club-logo" />
        <div>
          <h3 className="club-name">{club.name}</h3>
          <div className="club-category">{club.category}</div>
        </div>
      </div>
      
      <p className="club-desc">{club.description}</p>
      
      <div className="card-actions">
        {user.role !== 'superadmin' ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleJoin}
            disabled={loading || joined}
            className="btn-primary"
            style={{ background: joined ? 'var(--success)' : undefined }}
          >
            {loading ? 'Requesting...' : joined ? 'Request Sent ✓' : 'Join Club'}
          </motion.button>
        ) : (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onViewMembers(club)}
              className="btn-secondary"
            >
              👥 Members
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onDelete(club._id)}
              className="btn-secondary danger"
            >
              🗑️ Delete
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ClubCard;