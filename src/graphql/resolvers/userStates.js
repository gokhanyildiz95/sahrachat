
const debug = require('debug')('mobichat:user_states-resolve');

export default {
  Query: {
    userState: async (parent, {
      i_user,
    }, {
        mModels,
      }) => {
      debug('message called', i_user);
      const userStates = await mModels.UserStates.find({
        user: parseInt(i_user, 10),
      });
      return userStates[0];
    },
  },
  Mutation: {
    updateLastSeenUser: async (
      parent, {
        _,
      }, {
        mModels,
        user,
      }) => {
      /* eslint-disable-next-line */
      const { i_user } = user;
      const userState = await mModels.UserStates.findOne({
        user: parseInt(i_user, 10),
      });
      if (!userState) {
        debug('userS', userState);
        throw new Error('No user defined');
      }
      userState.lastSeen = new Date();
      await userState.save();
      return userState.toJSON();
    },
    updateOnlineStatusUser: async (
      parent, {
        isOnline,
      }, {
        mModels,
        user,
      }) => {
      /* eslint-disable-next-line */
      const { i_user } = user;
      const userState = await mModels.UserStates.findOne({
        user: i_user,
      });
      userState.isOnline = isOnline;
      await userState.save();
      return userState.toJSON();
    },
  },
};
