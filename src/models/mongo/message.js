import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  // user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  messageType: {
    type: String,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    required: false
  },
  user: mongoose.Schema.Types.Mixed,
  thread: { type: mongoose.Schema.Types.ObjectId, ref: 'Thread' },
  modifiedAt: { type: Date, default: null },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  /*
  i_user: Number,
  name: String,
  username: String,
  email: String,
  tenant: String,
  dname: String,
  */
}, {
  toJSON: {
    virtuals: true,
  },
  timestamps: {
    createdAt: 'createdAt',
  },
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
