const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Board title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    color: {
      type: String,
      default: '#6366f1',
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Board must have an owner'],
    },
    columns: {
      type: [String],
      default: ['To Do', 'In Progress', 'In Review', 'Done'],
      validate: {
        validator: function (cols) {
          return cols.length >= 1 && cols.length <= 10;
        },
        message: 'Board must have between 1 and 10 columns',
      },
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: task count (populated on demand)
boardSchema.virtual('taskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'board',
  count: true,
});

// Indexes
boardSchema.index({ owner: 1, createdAt: -1 });
boardSchema.index({ owner: 1, isArchived: 1 });

const Board = mongoose.model('Board', boardSchema);

module.exports = Board;