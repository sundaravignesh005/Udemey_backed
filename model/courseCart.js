  const mongoose = require('mongoose');
  const Schema = mongoose.Schema;

  const cartSchema = new Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Course',
        required: true,
      }
    ]
  }, {
    timestamps: true
  });

  module.exports = mongoose.model('Cart', cartSchema);
