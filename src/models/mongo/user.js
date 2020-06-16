import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
  },
  i_user: {
    type: Number,
    unique: true,
  },
  name: String,
  surname: String,
  email: String,
  dname: String,
  tenant: String,
  lastSeen: String,
  is_active: Boolean,
}, {
  toJSON: {
    virtuals: true,
  },
});

userSchema.statics.findOrCreate = async (conditions, optAttr) => {
  const document = await User.findOne(conditions);

  return document || await new User({ ...conditions, ...optAttr }).save();
};

const User = mongoose.model('User', userSchema);

export default User;
