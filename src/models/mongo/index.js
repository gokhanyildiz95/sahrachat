import mongoose from 'mongoose';
import Message from './message';
import FirebaseTokens from './firebasetokens';
import User from './user';
import UserStates from './userStates';
import Thread from './thread';
import ChatFiles from './chatFiles';

const connectMDb = () => {
  return mongoose.connect('mongodb://root:ayk542msf572shr@212.58.23.115:27017/mobikob?authSource=admin');
};

const mModels = {
  User, UserStates, Message, Thread, FirebaseTokens, ChatFiles,
};

export { connectMDb };

export default mModels;
