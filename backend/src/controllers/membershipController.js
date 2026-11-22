const Membership = require('../models/Membership');
const Club = require('../models/Club');

// @desc    Request to join a club
// @route   POST /api/memberships
const requestMembership = async (req, res, next) => {
  try {
    const { clubId } = req.body;

    const existingRequest = await Membership.findOne({ user: req.user._id, club: clubId });
    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'You have already requested to join this club' });
    }

    const membership = await Membership.create({
      user: req.user._id,
      club: clubId,
    });

    res.status(201).json({ success: true, data: membership });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending memberships (Admin/Superadmin only)
// @route   GET /api/memberships/pending
const getPendingMemberships = async (req, res, next) => {
  try {
    let query = { status: 'pending' };

    // If the user is a club admin, only show requests for their specific club
    if (req.user.role === 'clubAdmin' && req.user.club) {
      query.club = req.user.club;
    }
    // If superadmin, the query stays { status: 'pending' } and fetches ALL requests

    const memberships = await Membership.find(query)
      .populate('user', 'name email avatar')
      .populate('club', 'name logo');

    res.status(200).json({ success: true, count: memberships.length, data: memberships });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or Reject membership
// @route   PUT /api/memberships/:id
const updateMembershipStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status update' });
    }

    const membership = await Membership.findById(req.params.id);
    if (!membership) {
      return res.status(404).json({ success: false, message: 'Membership request not found' });
    }

    membership.status = status;
    await membership.save();

    res.status(200).json({ success: true, data: membership });
  } catch (error) {
    next(error);
  }
};

module.exports = { requestMembership, getPendingMemberships, updateMembershipStatus };