import mongoose from 'mongoose';

const threadSchema = new mongoose.Schema({
  name: String,
  members: mongoose.Schema.Types.Mixed,
  tenant: String,
  isGroup: Boolean,
  groupInfo: {
    name: String,
    owners: mongoose.Schema.Types.Mixed,
    isPrivate: Boolean,
  },
  // messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
}, {
  toJSON: {
    virtuals: true,
  },
});

threadSchema.statics.getUserThread = async (userId, tenant) => {
  return await Thread.find({
    members: { $elemMatch: { userId } },
    tenant,
  });
};
const Thread = mongoose.model('Thread', threadSchema);

export default Thread;
