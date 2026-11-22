const Club = require('../models/Club');
const User = require('../models/User');
const Membership = require('../models/Membership');
const Event = require('../models/Event');

// @desc    Get all clubs
// @route   GET /api/clubs
const getClubs = async (req, res, next) => {
  try {
    const clubs = await Club.find().populate('admin', 'name email');
    res.status(200).json({ success: true, count: clubs.length, data: clubs });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a club (Superadmin only)
// @route   POST /api/clubs
const createClub = async (req, res, next) => {
  try {
    const { name, description, category, adminId } = req.body;

    const adminUser = await User.findById(adminId);
    if (!adminUser) {
      return res.status(404).json({ success: false, message: 'Admin user not found' });
    }

    const club = await Club.create({
      name,
      description,
      category,
      admin: adminId,
    });

    if (adminUser.role !== 'superadmin') {
      adminUser.role = 'clubAdmin';
      adminUser.club = club._id;
      await adminUser.save();
    }

    res.status(201).json({ success: true, data: club });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single club by slug
// @route   GET /api/clubs/:slug
const getClubBySlug = async (req, res, next) => {
  try {
    const club = await Club.findOne({ slug: req.params.slug }).populate('admin', 'name email');
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }
    res.status(200).json({ success: true, data: club });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a club (Superadmin only)
// @route   DELETE /api/clubs/:id
const deleteClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    // Clean up related data (Memberships and Events)
    await Membership.deleteMany({ club: club._id });
    await Event.deleteMany({ club: club._id });

    // Delete the club
    await club.deleteOne();

    res.status(200).json({ success: true, message: 'Club deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all approved members of a club
// @route   GET /api/clubs/:id/members
const getClubMembers = async (req, res, next) => {
  try {
    // Find all memberships for this club with 'approved' status
    const memberships = await Membership.find({ 
      club: req.params.id, 
      status: 'approved' 
    }).populate('user', 'name email avatar');

    res.status(200).json({ success: true, count: memberships.length, data: memberships });
  } catch (error) {
    next(error);
  }
};

module.exports = { getClubs, createClub, getClubBySlug, deleteClub, getClubMembers };