// import pubsub, { EVENTS } from '../subscriptions';
import {
  withFilter,
} from 'apollo-server';
import Sequelize from 'sequelize';
import {
  flatten,
} from 'array-flatten';
const { fromPlainText, toJSON } = require('../../draftUtils');
import pubsub from '../subscriptions';
import sendNotification from '../../push-notification';

const toPlainText = (raw) => {
  return raw.blocks
    .filter((block) => block.type === 'unstyled')
    .map((block) => block.text)
    .join('\n');
};


const debug = require('debug')('mobichat:resolve-schema');

const NEW_THREAD_MESSAGE = 'NEW_THREAD_MESSAGE';
const THREAD_MESSAGE_UPDATED = 'THREAD_MESSAGE_UPDATED';
const NEW_MESSAGE_ADDED = 'NEW_MESSAGE_ADDED';
const THREAD_UPDATED = 'THREAD_UPDATED';

// TODO get this from shared folders
const messageTypeObj = {
  text: 'text',
  media: 'media',
  draftjs: 'draftjs',
  file: 'file',
};

export default {
  Query: {
    messages: async (
      parent, {
        threadId,
        cursor,
        searchedCursor,
        limit = 10,
      }, {
        mModels,
      }) => {
      debug('messages called');
      // fetching one more msg than defined.
      // if the list of messages is longer then the limit
      // there is a next page
      let messages;
      const thread = await mModels.Thread.findOne({
        _id: threadId,
      });
      if (!thread) {
        throw new Error('There is no thread for given ID!');
      }
      if (searchedCursor) {
        debug('searchedCusror', searchedCursor)
        const prevMessages = await mModels.Message.find({
          _id:  {
            $lte: searchedCursor,
          },
          thread
        }).sort({ _id: -1 }).limit(5).exec();
        debug(' prev messages', prevMessages);

        const nextMessages = await mModels.Message.find({
          _id: {
            $gt: searchedCursor,
          },
          thread
        }).sort({ _id: -1}).limit(5).exec();

        messages = [...prevMessages, ...nextMessages]
      } else {
        const params = cursor ? {
          _id: {
            $lt: cursor,
          },
          thread,
        } : {
          thread,
        };

        messages = await mModels.Message.find(params).sort({
          _id: -1,
        })
          .limit(limit + 1).exec();

      }

      const hasNextPage = messages.length > limit;
      const edges = hasNextPage ? messages.slice(0, -1) : messages;

      return {
        edges,
        pageInfo: {
          hasNextPage,
          endCursor: edges[edges.length - 1]._id,
        },
      };
    },

    message: async (parent, {
      id,
    }, {
        mModels,
      }) => {
      debug('message called');
      const message = await mModels.Message.find({
        _id: id,
      });
      return message[0];
    },
  },
  Mutation: {
    editMessage: async (parent, {
      id,
      content,
      messageType,
    }, {
        db,
        mModels,
        user,
        host,
      }) => {
      const {
        i_user,
        dname,
        tenant,
      } = user;
      // update
      await mModels.Message.updateOne({
        _id: id,
        user: i_user,
      }, {
        content,
        messageType,
        modifiedAt: new Date()
      })
      const message = await mModels.Message.findOne({
        _id: id,
        user: i_user,
      })

      await message.populate('thread');

      message.user = user;
      const jsonobj = message.toJSON();

      debug("edit result", jsonobj)
      await pubsub.publish([THREAD_MESSAGE_UPDATED], {
        threadId: message.thread,
        messageUpdated: jsonobj
      });

      return true;
    },
    deleteMessage: async (parent, {
      id,
    }, {
        db,
        mModels,
        user,
        host,
      }) => {
      const {
        i_user,
        dname,
        tenant,
      } = user;
      await mModels.Message.updateOne({
        _id: id,
        user: i_user,
      }, {
        content: JSON.stringify(toJSON(fromPlainText('Mesaj silindi!'))),
        isDeleted: true,
        messageType: 'draftjs'
      })

      const message = await mModels.Message.findOne({
        _id: id,
        user: i_user,
      })

      await message.populate('thread');
      message.user = user;
      const jsonobj = message.toJSON();


      debug("deletemessage result", message)
      await pubsub.publish([THREAD_MESSAGE_UPDATED], {
        threadId: message.thread,
        messageUpdated: jsonobj,
      });

      return true;
    },
    addMessage: async (parent, {
      message,
    }, {
        db,
        mModels,
        user,
        host,
        storeUpload,
      }) => {
      const {
        i_user,
        dname,
        tenant,
      } = user;
      let uploadedFile;
      if (message.file) {
        uploadedFile = await storeUpload(message.file);
      }

      const nmessage = new mModels.Message({
        content: message.file ? JSON.stringify(uploadedFile) : message.content,
        user: user.i_user,
        thread: message.threadId,
        messageType: message.messageType,
      });

      await nmessage.save();
      // await nmessage.populate('user');
      await nmessage.populate('thread');
      nmessage.user = user;
      const jsonobj = nmessage.toJSON();

      await pubsub.publish([NEW_THREAD_MESSAGE], {
        threadId: message.threadId,
        newThreadMessage: jsonobj,
      });

      const nthread = await mModels.Thread.findOne({
        _id: message.threadId,
      });
      // TODO send to other users -umut
      const otherUsers = nthread.members.filter((member) => member.userId !== i_user);
      debug("otherusers", otherUsers);
      const documents = await mModels.FirebaseTokens.find({
        tenant,
        user: { $in: otherUsers.map(user => user.userId)},
        dname,
      });
      const allRegIds = documents.map((document) => {
        return document.tokens.map((obj) => obj.token);
      });
      const uniqueRegIds = [...new Set(flatten(allRegIds))];
      if (uniqueRegIds.length > 0) {
        let action_url = `${host}`;
        action_url += '/webapp/messages/';
        debug("action url", action_url, "host", host)
        let body;
        let notifMsg;
        if (message.messageType === messageTypeObj.draftjs) {
          body = message.content;
          if (typeof body === 'string') body = JSON.parse(message.content);
          notifMsg = toPlainText(body);
        } else {
          switch (message.messageType) {
            case 'media':
              notifMsg = '📷 Resim';
              break;
            case 'file':
              notifMsg = '🗎 Dosya';
              body = JSON.parse(nmessage.content);
              if (body.mimetype.startsWith('media')) {
                notifMsg = '📷 Resim';
              }
              break;
            default:
              break;
          }
        }

        // const notifMsg = `${message.content.split(0, 96)}...`
        const notifData = {
          tokens: uniqueRegIds,
            notification: {
              title: `${user.name}`,
              body: notifMsg,
            },
          // for mobile
          // for web
          webpush: {
            fcm_options: {
              link: action_url,
            },
            notification: {
              title: `${user.name}`,
              body: notifMsg,
              // icon: 'https://850.net.tr/static/img/mobi_128.png',
              icon: 'https://mobikob.com/static/img/mobi_512.png',
              sound: 'https://mobikob.com/static/sound/new-mess-notif-on-focus.mp3',
              action_url: action_url,

              // with tags its prevent stacking notif
              tag: message.threadId.toString(),
              // notify mobile users on replacing existing notif
              renotify: true,
              // renotify dont work on desktop
              requireInteraction: true,
            },
          },
        };
        debug('notif data', notifData);
        sendNotification(notifData);
      }

      const {
        Op,
      } = Sequelize;
      const users = await db[dname].User.schema(tenant).findAll({
        where: {
          i_user: {
            [Op.in]: Array.from(nthread.members.map(member => member.userId)),
          },
        },
      });

      const snippet = await mModels.Message.find({
        thread: nthread,
      }).sort({
        _id: -1,
      }).limit(1);

      if (snippet[0]) {
        const mongoUserID = snippet[0].user;
        const postgreUser = users.filter((user) => {
          return user.i_user === mongoUserID;
        });
        snippet[0].user = postgreUser[0].dataValues;
      }

      if (nthread.isGroup) {
        nthread.groupInfo.owners = nthread.groupInfo.owners.map((owner) => {
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
          //qqq
          /* return {
            i_user: member,
            dname,
            tenant,
            lastSeen: null,
            name: 'qqq',
            surname: 'qqq',
          }; */
        });
      }

      nthread.members = nthread.members.map((member) => {
        const user = users.filter((user) => {
          return user.i_user == member.userId;
        });
        if (user.length > 0) {
          return {
            dname,
            tenant,
            lastSeen: member.lastSeen,
            ...user[0].dataValues,
          };
        }
        //qqq
        /* return {
          i_user: member.userId,
          lastSeen: member.lastSeen,
          dname,
          tenant,
          name: 'qqq',
          surname: 'qqq',
        }; */

      })
      const nthreadJson = nthread.toJSON();
      nthreadJson.msg_owner = snippet[0].toJSON();

      const pubdata = {
        members: nthread.members,
        threadUpdated: nthreadJson,
      };
      // get reg ids


      await pubsub.publish([THREAD_UPDATED], pubdata);

      return nmessage;
    },
  },

  Subscription: {
    messageAdded: {
      subscribe: () => pubsub.asyncIterator([NEW_MESSAGE_ADDED]),
    },
    messageUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([THREAD_MESSAGE_UPDATED]),
        (payload, args) => payload.threadId === args.threadId,
      ),
    },
    newThreadMessage: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([NEW_THREAD_MESSAGE]),
        (payload, args) => payload.threadId === args.threadId,
      ),
    },
  },
};
