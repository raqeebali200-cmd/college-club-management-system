const express = require('express');
const router = express.Router();
const { requestMembership, getPendingMemberships, updateMembershipStatus } = require('../controllers/membershipController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, requestMembership);
router.get('/pending', protect, authorize('clubAdmin', 'superadmin'), getPendingMemberships);
router.put('/:id', protect, authorize('clubAdmin', 'superadmin'), updateMembershipStatus);

module.exports = router;