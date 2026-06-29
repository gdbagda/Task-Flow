const mongoose = require('mongoose');

const PRIORITY_LEVELS = ['low', 'medium', 'high', 'critical'];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    status: {
      type: String,
      required: [true, 'Task status is required'],
      trim: true,
    },
    priority: {
      type: String,
      enum: {
        values: PRIORITY_LEVELS,
        message: 'Priority must be one of: low, medium, high, critical',
      },
      default: 'medium',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    estimatedHours: {
      type: Number,
      min: [0, 'Estimated hours cannot be negative'],
      max: [1000, 'Estimated hours cannot exceed 1000'],
      default: null,
    },
    aiSuggestion: {
      estimatedHours: { type: Number, default: null },
      suggestedDueDate: { type: Date, default: null },
      reason: { type: String, default: '' },
      generatedAt: { type: Date, default: null },
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: [true, 'Task must belong to a board'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must have an owner'],
    },
    order: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags) {
          return tags.length <= 10;
        },
        message: 'Task cannot have more than 10 tags',
      },
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common query patterns
taskSchema.index({ board: 1, status: 1, order: 1 });
taskSchema.index({ board: 1, priority: 1 });
taskSchema.index({ board: 1, dueDate: 1 });
taskSchema.index({ owner: 1, isArchived: 1 });
taskSchema.index({ board: 1, isArchived: 1, status: 1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;