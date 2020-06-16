import mongoose from 'mongoose';

const userStatesSchema = new mongoose.Schema({
  user: mongoose.Schema.Types.Mixed,
  lastSeen: Date,
  lastActivity: Date,
  isOnline: Boolean,
  tenant: String,
}, {
  toJSON: {
    virtuals: true,
  },
});

/* eslint-disable */
userStatesSchema.statics.findOrCreate = async (conditions, optAttr) => {
    const document = await UserStates.findOne(conditions);
    return document || await new UserStates({
        ...conditions,
        ...optAttr
    }).save();
};

const UserStates = mongoose.model('UserStates', userStatesSchema);

export default UserStates;
