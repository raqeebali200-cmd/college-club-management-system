const express = require('express');
const router = express.Router();
const { 
  getClubs, 
  createClub, 
  getClubBySlug, 
  deleteClub, 
  getClubMembers 
} = require('../controllers/clubController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', getClubs);
router.get('/:slug', getClubBySlug);
router.post('/', protect, authorize('superadmin'), createClub);
router.delete('/:id', protect, authorize('superadmin'), deleteClub);
router.get('/:id/members', protect, authorize('superadmin', 'clubAdmin'), getClubMembers);

module.exports = router;