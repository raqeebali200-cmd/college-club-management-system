const express = require('express');
const router = express.Router();
const { getEvents, createEvent, rsvpEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', getEvents);
router.post('/', protect, authorize('clubAdmin', 'superadmin'), createEvent);
router.put('/:id/rsvp', protect, rsvpEvent); // Any logged-in user can RSVP

module.exports = router;