import mongoose from 'mongoose';


const filesSchema = new mongoose.Schema({
  filename: String,
  filesize: Number,
  localname: String,
}, {
  toJSON: {
    virtuals: true,
  },
});


filesSchema.statics.create = async (params) => {
  return await new ChatFiles({ ...params }).save();
};

const ChatFiles = mongoose.model('ChatFiles', filesSchema);


export default ChatFiles;
