import {
  withFilter,
} from 'apollo-server';
import Sequelize from 'sequelize';
import pubsub from '../subscriptions';
var _ = require('lodash');

const debug = require('debug')('mobichat:resolve-thread');

const THREAD_UPDATED = 'THREAD_UPDATED';
const THREAD_UPDATED_USER = 'THREAD_UPDATED_USER';

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

// convert mongo id to ts
// const toTimestamp = (id) => new Date(parseInt(id.substring(0, 8), 16) * 1000)
const toTimestamp = (createdAt) => new Date(createdAt).getTime();


export default {
  Query: {
    threads: async (
      parent, {
        _,
      }, {
        db,
        mModels,
        user,
      }) => {
      const {
        i_user,
        dname,
        tenant,
      } = user;
      /*
      const threads = await mModels.Thread.find({
        members: {
          $all: [i_user],
        },
        tenant,
      });
      */
      const threads = await mModels.Thread.getUserThread(i_user, tenant);
      // find the users from threads
      const allUsers = threads.reduce((acc, val) => acc.concat(val.members.map(member => member.userId)), []);
      const allUniqueUsers = [...new Set(allUsers)];
      const {
        Op,
      } = Sequelize;

      // retrieve user data for this thread
      const users = await db[dname].User.schema(tenant).findAll({
        where: {
          i_user: {
            [Op.in]: Array.from(allUniqueUsers),
          },
        },
        attributes: ['i_user', 'username', 'name', 'surname', 'email', 'is_active']
      });
      // populate member with user data
      const convoIdsHide = [];
      threads.map((thread) => {
        let shouldShow = true;
        thread.members = thread.members.map((member) => {
          const user = users.filter((user) => {
            return user.i_user === member.userId;
          });
          if (thread._id.toString() === "5e85cccfd722c4049866258a") {
            debug('member', member);
            debug('user', user)
          }
          if (user.length > 0) {
            if (!user[0].dataValues.is_active) {
              //  is the user not active and thread is not group
              if (!thread.isGroup) {
                convoIdsHide.push(thread._id)
                shouldShow = false;
              }
              //pasif kullanıcılar gizlenip gizlenmediği test edilecek işe yaramazsa sil (1)
              convoIdsHide.push(thread._id)
              return {
                dname,
                tenant,
                i_user: user[0].i_user,
                lastSeen: null,
                name: 'Pasif',
                surname: 'Kullanıcı',
              };
            }
            return {
              dname,
              tenant,
              lastSeen: member.lastSeen ? member.lastSeen : null,
              ...user[0].dataValues
            };
          }
          // if user not in the pgsql query result it means 
          // the user deleted
            // silinmiş kullanıcıları gizler (1)
            convoIdsHide.push(thread._id)
            return {
            i_user: member.userId,
            lastSeen: member.lastSeen ? member.lastSeen : null,
            dname,
            tenant,
            name: 'Silinmiş',
            surname: 'Kullanıcı',
          }; 
        });
        // dont run after that will hide if false
        if (!shouldShow) return;
        if (thread.isGroup) {
          thread.groupInfo.owners = thread.groupInfo.owners.map((owner) => {
            const user = users.filter((user) => {
              return user.i_user === owner;
            });
            // dont run after that will hide if false
            if (user.length > 0) {
              if (!user[0].dataValues.is_active) {
                //  is the user not active and thread is not group
                debug('is active', user[0].dataValues);
                return {
                  dname,
                  tenant,
                  i_user: user[0].i_user,
                  lastSeen: null,
                  name: 'Pasif',
                  surname: 'Kullanıcı',
                };
              }
              return {
                dname,
                tenant,
                ...user[0].dataValues,
              };
            }
            return {
              i_user: owner,
            };
          });
        }
      });
      return threads.filter(thread => !convoIdsHide.includes(thread._id));
    },
    searchMessage: async (
      parent, {
        queryString,
      }, {
        db,
        mModels,
        user,
      }) => {
      const {
        i_user,
        dname,
        tenant,
      } = user;
      const {
        Op,
      } = Sequelize;
      const messages = await mModels.Message.find({ content: { $regex: queryString, $options: 'i' } }).populate('thread')
      if (!messages) return []; // not found
      const searchConnection = []
      const threads = _.uniqBy(messages, "thread._id")
      // threads.filter(thread => console.log("ids", thread._id))
      const results = threads.map(async (message) => {
        console.log("threads", message)
        let thread = message.thread;
        let members = thread.members.map(member => {
          return member.userId
        })
        console.log("members,", members, "iseR_", i_user)


        const users = await db[dname].User.schema(tenant).findAll({
          where: {
            i_user: {
              [Op.in]: Array.from(thread.members.map(member => member.userId)),
            },
          },
          attributes: ['i_user', 'username', 'name', 'surname', 'email', 'is_active']
        });

        thread.members = thread.members.map((member) => {
          const user = users.filter((user) => {
            return user.i_user == member.userId;
          });
          if (user.length > 0) {
            if (!user[0].dataValues.is_active) {
              return {
                dname,
                tenant,
                i_user: user[0].i_user,
                lastSeen: null,
                name: 'Pasif',
                surname: 'Kullanıcı',
              };

            }
            return {
              dname,
              tenant,
              lastSeen: member.lastSeen ? member.lastSeen : null,
              ...user[0].dataValues,
            };
          }
          return {
            i_user: member.userId,
            lastSeen: member.lastSeen ? member.lastSeen : null,
            dname,
            tenant,
            name: 'Silinmiş',
            surname: 'Kullanıcı',
          };
        });



        if (thread.tenant === tenant && members.includes(i_user))
          searchConnection.push({
            thread: thread,
            matchedMessages: messages.filter(message => message.thread._id === thread._id)
          })
      })
      // console.log("searchConn", searchConnection)
      return Promise.all(results).then((completed) => {
        return searchConnection
      })
    },
    thread: async (
      parent, {
        id,
      }, {
        db,
        mModels,
        user,
      }) => {
      const {
        dname,
        tenant,
      } = user;
      const {
        Op,
      } = Sequelize;
      const thread = await mModels.Thread.findOne({
        _id: id,
      });
      if (!thread) {
        throw new Error('There is no thread for given ID!');
      }
      debug("thread members", thread.members.map(member => member.userId));
      const users = await db[dname].User.schema(tenant).findAll({
        where: {
          i_user: {
            [Op.in]: Array.from(thread.members.map(member => member.userId)),
          },
        },
        attributes: ['i_user', 'username', 'name', 'surname', 'email', 'is_active']
      });
      thread.members = thread.members.map((member) => {
        const user = users.filter((user) => {
          return user.i_user == member.userId;
        });
        if (user.length > 0) {
          if (!user[0].dataValues.is_active) {
            //  is the user not active and thread is not group
            return {
              dname,
              tenant,
              i_user: user[0].i_user,
              lastSeen: null,
              name: 'Pasif',
              surname: 'Kullanıcı',
            };
          }
          return {
            dname,
            tenant,
            lastSeen: member.lastSeen ? member.lastSeen : null,
            ...user[0].dataValues,
          };
        }
        return {
          i_user: member.userId,
          lastSeen: member.lastSeen ? member.lastSeen : null,
          dname,
          tenant,
          name: 'Silinmiş',
          surname: 'Kullanıcı',
        };
      });
      debug('isGroup', thread.isGroup);
      if (thread.isGroup) {
        thread.groupInfo.owners = thread.groupInfo.owners.map((owner) => {
          const user = users.filter((user) => {
            return user.i_user === owner;
          });
          if (user.length > 0) {
            if (!user[0].dataValues.is_active) {
              //  is the user not active and thread is not group
              return {
                dname,
                tenant,
                i_user: user[0].i_user,
                lastSeen: null,
                name: 'Pasif',
                surname: 'Kullanıcı',
              };
            }
            return {
              dname,
              tenant,
              ...user[0].dataValues,
            };
          }
          return {
            i_user: owner,
          };
        });
      }
      return thread;
    },
  },
  Thread: {
    messages: async (
      parent, {
        cursor,
        searchedCursor,
        limit = 25,
      }, {
        db,
        mModels,
        user,
      }) => {
      const {
        dname,
        tenant,
      } = user;

      // const messages = await mModels.Message.find({ thread: parent});
      let messages;

      if (searchedCursor) {
        const prevMessages = await mModels.Message.find({
          _id: {
            $lte: searchedCursor,
          },
          thread: parent,
        }).sort({ _id: -1 }).limit(5).exec();

        const nextMessages = await mModels.Message.find({
          _id: {
            $gt: searchedCursor,
          },
          thread: parent,
        }).limit(7).exec();

        messages = [...prevMessages, ...nextMessages]
      } else {
        const params = cursor ? {
          _id: {
            $lt: cursor,
          },
          thread: parent,
        } : {
            thread: parent,
          };
        messages = await mModels.Message.find(params).sort({
          createdAt: -1,
        })
          .limit(limit + 1).exec();
      }

      const hasNextPage = messages.length > limit;

      const {
        Op,
      } = Sequelize;
      const allUsers = messages.map((message) => message.user);
      const allUniqueUsers = [...new Set(allUsers)];
      const users = await db[dname].User.schema(tenant).findAll({
        where: {
          i_user: {
            [Op.in]: Array.from(allUniqueUsers),
          },
        },
      });

      messages.map((message) => {
        const nuser = users.filter((user) => {
          return user.i_user === message.user;
        });
        if (nuser.length > 0) {
          message.user = {
            dname,
            tenant,
            ...nuser[0].dataValues,
          };
        } else {
          message.user = {
            i_user: message.user,
            dname,
            tenant,
            lastSeen: null,
            name: 'Silinmiş',
            surname: 'Kullanıcı',
          };
        }
      });

      // sort last to first
      let edges = hasNextPage ? messages.slice(0, -1) : messages;
      edges = edges.sort((a, b) => toTimestamp(a.createdAt) < toTimestamp(b.createdAt));

      return {
        edges,
        pageInfo: {
          hasNextPage,
          endCursor: edges.length > 0 ? edges[edges.length - 1]._id : '',
        },
      };
      // return messages;
    },
    snippet: async (
      parent, args, {
        db,
        mModels,
        user,
      }) => {
      const {
        dname,
        tenant,
      } = user;
      const snippet = await mModels.Message.find({
        thread: parent,
      }).sort({
        createdAt: -1,
      }).limit(1);
      if (snippet[0]) {
        const mongo_user_id = snippet[0].user;
        const objIndex = parent.members.findIndex(member => member.i_user === mongo_user_id);

        // assume the user is deleted
        let postgre_user = {
          i_user: mongo_user_id,
          dname,
          tenant,
          lastSeen: null,
          name: 'Silinmiş',
          surname: 'Kullanıcı',
        };

        // if user found from parent
        if (objIndex) {
          postgre_user = parent.members[objIndex];
        }

        // set to gql response
        snippet[0].user = postgre_user;
      }
      return snippet[0];
    },
  },
  Mutation: {
    updateUserLastSeen: async (
      parent, {
        input,
      }, {
        db,
        mModels,
        user,
      }) => {
      const {
        i_user,
        dname,
        tenant,
      } = user;
      const {
        Op,
      } = Sequelize;
      const thread = await mModels.Thread.findById(input.threadId);
      if (!thread) {
        throw new Error('There is no thread for given ID!');
      }
      const userId = parseInt(input.userId, 10);

      const objIndex = thread.members.findIndex(member => member.userId === userId);

      if (objIndex < 0)
        throw new Error('User does not exists');

      const updatedObj = { userId: userId, lastSeen: new Date() };
      debug("members", thread.members);
      debug("index", objIndex, "upıbj", updatedObj);
      thread.members[objIndex] = updatedObj;
      thread.markModified('members');
      debug("members", thread.members);
      await thread.save();
      const users = await db[dname].User.schema(tenant).findAll({
        where: {
          i_user: {
            [Op.in]: Array.from(thread.members.map(member => member.userId)),
          },
        },
      });
      thread.members = thread.members.map((member) => {
        const user = users.filter((user) => {
          return user.i_user === member.userId;
        });
        if (user.length > 0) {
          return {
            dname,
            tenant,
            lastSeen: member.lastSeen ? member.lastSeen : null,
            ...user[0].dataValues,
          };
        }

        return {
          i_user: member.userId,
          lastSeen: member.lastSeen ? member.lastSeen : null,
          dname,
          tenant,
          name: 'Silinmiş',
          surname: 'Kullanıcı',
        };
      });


      const pubmsg = {
        threadId: thread._id,
        threadUpdatedUser: thread.toJSON(),
      };
      await pubsub.publish([THREAD_UPDATED_USER], pubmsg);
      return thread;
    },
    updateThread: async (
      parent, {
        input,
      }, {
        mModels,
        user,
      }) => {
      const thread = await mModels.Thread.findById(input.threadId);

      if (!thread) {
        throw new Error('There is no thread for given ID!');
      }
      if (!thread.isGroup) {
        // dont delete user from directMessage
        throw new Error('This thread type is not group!');
      }
      // ensure id is int
      if (!thread.groupInfo.owners.includes(parseInt(user.i_user, 10))) {
        throw new Error('You dont have permission!');
      }

      if (input.name) thread.groupInfo.name = input.name;
      if (input.isPrivate) thread.groupInfo.isPrivate = input.isPrivate;
      thread.markModified('groupInfo');
      await thread.save();
      return thread;

    },
    deleteUserFromThread: async (
      parent, {
        input,
      }, {
        mModels,
        user,
      }) => {
      const thread = await mModels.Thread.findById(input.threadId);

      if (!thread) {
        throw new Error('There is no thread for given ID!');
      }
      if (!thread.isGroup) {
        // dont delete user from directMessage
        throw new Error('This thread type is not group!');
      }
      // ensure id is int
      if (!thread.groupInfo.owners.includes(parseInt(user.i_user, 10))) {
        throw new Error('You dont have permission!');
      }
      if (!thread.members.map(member => member.userId).includes(parseInt(input.memberId, 10))) {
        throw new Error('The user is not in this thread!');
      }
      thread.members = thread.members.filter((member) => member.userId !== parseInt(input.memberId, 10));
      await thread.save();
      return thread;
    },
    addUserToThread: async (
      parent, {
        input,
      }, {
        db,
        mModels,
        user,
      }) => {
      const {
        i_user,
      } = user;
      const thread = await mModels.Thread.findById(input.threadId);
      if (!thread) {
        throw new Error('There is no thread for given ID!');
      }
      if (!thread.isGroup) {
        throw new Error('This thread type is not group!');
      }
      if (!thread.groupInfo.owners.includes(i_user)) {
        throw new Error('You dont have permission for this operation!');
      }
      const arrayIncludes = (e) => thread.members.map(member => member.userId).includes(e);
      debug("members", thread.members.map(member => member.userId), "reqmember", input.newMembers);
      if (input.newMembers.map((member) => parseInt(member, 10)).some(arrayIncludes)) {
        throw new Error('User already in this thread!');
      }
      // add new members to thread
      // keep id as int on backend
      thread.members = [...thread.members, ...input.newMembers.map((member) => { return { userId: parseInt(member, 10) } })];
      thread.markModified('members');
      await thread.save();
      return thread;
    },
    createThread: async (
      parent, {
        input,
      }, {
        db,
        mModels,
        user,
      }) => {
      const {
        dname,
        tenant,
      } = user;
      const {
        Op,
      } = Sequelize;
      const threadParams = {
        tenant,
      };
      // populate members should be int
      const members = [];
      const owners = [];
      const groupInfo = {};
      input.members.forEach((member) => {
        members.push({
          userId: parseInt(member, 10)
        });
      });
      // add user itself
      members.push({ userId: parseInt(user.i_user, 10) });
      const {
        isGroup,
        groupName,
        ownersParam,
        isPrivate,
      } = input;
      // TODO send from frontend
      if (isGroup === undefined) {
        isGroup = false;
      }
      // group thread
      if (isGroup) {
        if (!groupName || !owners) {
          throw new Error('Check your input: name, owners, cant be empty');
        }
        ownersParam.forEach((owner) => {
          owners.push(parseInt(owner, 10));
        });
        groupInfo.name = groupName;
        groupInfo.owners = owners;
        groupInfo.isPrivate = isPrivate;
      }
      threadParams.members = members;
      threadParams.groupInfo = groupInfo;
      threadParams.isPrivate = isPrivate;

      threadParams.isGroup = isGroup;
      const queryMembers = members.map(member => member.userId);
      const query = {
        tenant,
        isGroup,
        "members.userId": { $all: queryMembers },
        members: { $size: queryMembers.length }
      }
      if (isGroup) {
        query["groupInfo.name"] = threadParams.groupInfo.name;
        const name_exists = await mModels.Thread.findOne({ tenant, "groupInfo.name": threadParams.groupInfo.name });
        if (name_exists) {
          debug('cannot create new thread name', exists);
          throw new Error('Group Name Already Exists');
        }

      }

      debug("query if extsis", query);

      const exists = await mModels.Thread.findOne(query);
      if (exists) {
        debug('cannot create new thread group', exists);
        throw new Error('Already Exists');
      }

      const thread = new mModels.Thread(threadParams);
      await thread.save();

      const users = await db[dname].User.schema(tenant).findAll({
        where: {
          i_user: {
            [Op.in]: Array.from(thread.members.map(member => member.userId)),
          },
        },
      });
      thread.members = thread.members.map((member) => {
        const user = users.filter((user) => {
          return user.i_user === member.userId;
        });
        if (user.length > 0) {
          return {
            dname,
            tenant,
            lastSeen: member.lastSeen ? member.lastSeen : null,
            ...user[0].dataValues,
          };
        }
        return {
          i_user: member.userId,
          lastSeen: member.lastSeen ? member.lastSeen : null,
          dname,
          tenant,
          name: 'Silinmiş',
          surname: 'Kullanıcı',
        };
      });

      if (thread.isGroup) {
        thread.groupInfo.owners = thread.groupInfo.owners.map((owner) => {
          const user = users.filter((user) => {
            return user.i_user === owner;
          });
          if (user.length > 0) {
            return {
              dname,
              tenant,
              ...user[0].dataValues,
            };
          }
          return {
            i_user: member.userId,
          };
        });
      }

      const pubmsg = {
        members: thread.members,
        threadUpdated: thread.toJSON(),
      };

      await pubsub.publish([THREAD_UPDATED], pubmsg);
      return thread;
    },
  },
  Subscription: {
    threadUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([THREAD_UPDATED]),
        (payload, args) => {
          return payload.members.map(member => member.i_user).includes(parseInt(args.userId, 10));
        },
      ),
    },
    threadUpdatedUser: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([THREAD_UPDATED_USER]),
        (payload, args) => {
          return payload.threadId === args.threadId
        },
      ),
    },
  },
};
