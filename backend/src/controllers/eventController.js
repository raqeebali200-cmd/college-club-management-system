const Event = require('../models/Event');

// @desc    Get all events (optionally filter by club)
// @route   GET /api/events
const getEvents = async (req, res, next) => {
  try {
    const query = req.query.club ? { club: req.query.club } : {};
    const events = await Event.find(query).populate('club', 'name logo');
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    next(error);
  }
};

// @desc    Create an event (Club Admin only)
// @route   POST /api/events
const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, venue, capacity, clubId } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      venue,
      capacity,
      club: clubId,
    });

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// @desc    RSVP to an event
// @route   PUT /api/events/:id/rsvp
const rsvpEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.availableSeats <= 0) {
      return res.status(400).json({ success: false, message: 'Event is full' });
    }

    if (event.attendees.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You have already RSVPed to this event' });
    }

    event.attendees.push(req.user._id);
    await event.save();

    res.status(200).json({ success: true, message: 'RSVP Successful', data: event });
  } catch (error) {
    next(error);
  }
};

module.exports = { getEvents, createEvent, rsvpEvent };