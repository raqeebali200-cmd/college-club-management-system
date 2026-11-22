const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a club name'],
      unique: true,
      trim: true,
      maxlength: [100, 'Club name cannot be more than 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a club description'],
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: [
        'Technology',
        'Arts & Culture',
        'Sports',
        'Academic',
        'Social',
        'Entrepreneurship',
        'Other',
      ],
    },
    logo: {
      type: String,
      default: 'https://cdn-icons-png.flaticon.com/512/2830/2830305.png',
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A club must have an admin'],
    },
  },
  { timestamps: true }
);

clubSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

module.exports = mongoose.model('Club', clubSchema);