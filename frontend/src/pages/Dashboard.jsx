import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import ClubCard from '../components/ClubCard';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  
  const [clubs, setClubs] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false); // Create Club
  const [membersModalOpen, setMembersModalOpen] = useState(false); // View Members
  
  const [selectedClub, setSelectedClub] = useState(null);
  const [clubMembers, setClubMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [formData, setFormData] = useState({ name: '', description: '', category: 'Technology' });
  const [error, setError] = useState('');

  const isAdmin = user.role === 'superadmin' || user.role === 'clubAdmin';

  useEffect(() => {
    fetchClubs();
    if (isAdmin) {
      fetchRequests();
    }
  }, [isAdmin]);

  const fetchClubs = async () => {
    try {
      const { data } = await api.get('/clubs');
      setClubs(data.data);
    } catch (err) {
      console.error('Error fetching clubs', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/memberships/pending');
      setRequests(data.data);
    } catch (err) {
      console.error('Error fetching requests', err);
    }
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/clubs', { ...formData, adminId: user._id });
      setIsModalOpen(false);
      setFormData({ name: '', description: '', category: 'Technology' });
      fetchClubs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create club');
    }
  };

  const handleDeleteClub = async (id) => {
    if (window.confirm("Are you sure you want to delete this club? This action cannot be undone.")) {
      try {
        await api.delete(`/clubs/${id}`);
        setClubs(clubs.filter(club => club._id !== id)); // Remove from UI instantly
      } catch (err) {
        alert('Error deleting club');
      }
    }
  };

  const handleViewMembers = async (club) => {
    setSelectedClub(club);
    setMembersModalOpen(true);
    setLoadingMembers(true);
    try {
      const { data } = await api.get(`/clubs/${club._id}/members`);
      setClubMembers(data.data);
    } catch (err) {
      console.error('Error fetching members', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleUpdateRequest = async (id, status) => {
    try {
      await api.put(`/memberships/${id}`, { status });
      setRequests(requests.filter(req => req._id !== id));
    } catch (err) {
      alert('Error updating request');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Welcome, {user.name} 👋</h1>
          <p className="dashboard-subtitle">Role: <span style={{ color: 'var(--primary)' }}>{user.role}</span></p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {user.role === 'superadmin' && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsModalOpen(true)} className="btn-primary">
              + Create Club
            </motion.button>
          )}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={logout} className="btn-secondary danger">
            Logout
          </motion.button>
        </div>
      </div>

      {isAdmin && requests.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="section-title">📥 Pending Join Requests</h2>
          <div className="request-grid">
            <AnimatePresence>
              {requests.map((req) => (
                <motion.div 
                  key={req._id} 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="request-card"
                >
                  <div className="request-user">
                    <div className="member-avatar">
                      {req.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="request-user-info">
                      <h4>{req.user.name}</h4>
                      <p>{req.user.email}</p>
                    </div>
                  </div>
                  <p className="request-club">Wants to join: <strong>{req.club.name}</strong></p>
                  <div className="request-actions">
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleUpdateRequest(req._id, 'approved')} className="btn-secondary success">
                      Approve
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleUpdateRequest(req._id, 'rejected')} className="btn-secondary danger">
                      Reject
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      <h2 className="section-title">Explore Clubs</h2>
      
      {loading ? (
        <div className="empty-state">Loading clubs...</div>
      ) : (
        <motion.div layout className="grid-layout">
          <AnimatePresence>
            {clubs.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
                No clubs available yet. {user.role === 'superadmin' && 'Create one to get started!'}
              </motion.div>
            ) : (
              clubs.map((club, index) => (
                <ClubCard 
                  key={club._id} 
                  club={club} 
                  index={index} 
                  onDelete={handleDeleteClub}
                  onViewMembers={handleViewMembers}
                />
              ))
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── CREATE CLUB MODAL ── */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="modal-title">Create New Club</h2>
              {error && <div className="error-msg">{error}</div>}
              
              <form onSubmit={handleCreateClub}>
                <div className="form-group">
                  <label>Club Name</label>
                  <input type="text" className="form-input" placeholder="e.g., Coding Club" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                </div>
                
                <div className="form-group">
                  <label>Category</label>
                  <select className="form-select" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                    <option value="Technology">Technology</option>
                    <option value="Arts & Culture">Arts & Culture</option>
                    <option value="Sports">Sports</option>
                    <option value="Academic">Academic</option>
                    <option value="Social">Social</option>
                    <option value="Entrepreneurship">Entrepreneurship</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-input" rows="3" placeholder="What is this club about?" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Create Club</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── VIEW MEMBERS MODAL ── */}
      <AnimatePresence>
        {membersModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setMembersModalOpen(false)}>
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="modal-title">Members of {selectedClub?.name}</h2>
              
              <div className="member-list">
                {loadingMembers ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading members...</p>
                ) : clubMembers.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No approved members yet.</p>
                ) : (
                  clubMembers.map((membership) => (
                    <motion.div 
                      key={membership._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="member-item"
                    >
                      <div className="member-avatar">
                        {membership.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="member-info">
                        <h4>{membership.user.name}</h4>
                        <p>{membership.user.email}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setMembersModalOpen(false)} className="btn-primary">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default Dashboard;