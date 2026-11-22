const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an event title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide an event description'],
    },
    date: {
      type: Date,
      required: [true, 'Please provide an event date'],
    },
    venue: {
      type: String,
      required: [true, 'Please provide a venue'],
    },
    capacity: {
      type: Number,
      required: [true, 'Please provide event capacity'],
      min: [1, 'Capacity must be at least 1'],
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

eventSchema.virtual('availableSeats').get(function () {
  return this.capacity - this.attendees.length;
});

module.exports = mongoose.model('Event', eventSchema);