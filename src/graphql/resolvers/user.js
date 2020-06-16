import lodash from 'lodash';
import Sequelize from 'sequelize';

const debug = require('debug')('mobichat:user-resolve');


export default {
  Query: {
    me: async (_, __, {
      user,
    }) => {
      return user;
      /* db[dbname].User.schema(tenant).findOne({
              where: {
                username,
              },
            }).then((user) => {
              return user;
            });
            */
    },
    users: async (_, __, {
      db,
      user,
    }) => {
      const {
        dname,
        tenant,
      } = user;
      debug('dname', dname);
      const users = db[dname].User.schema(tenant).findAll({
        where: {
          is_active: {
            [Op.eq]: true,
          }
        }
      });
      return users;
    },
    searchUsers: async (_, {
      queryString,
    }, {
      db,
      user,
    }) => {
      const {
        dname,
        tenant,
      } = user;
      // return s
      const {
        Op,
      } = Sequelize;
      return db[dname].User.schema(tenant).findAll({
        where: {
          [Op.and]: [{
            is_active: {
              [Op.eq]: true,
            }

          }, {
            [Op.or]: [{
              name: {
                [Op.iLike]: `%${queryString}%`,
              },
            },
            {
              surname: {
                [Op.iLike]: `${queryString}%`,
              },
            },
            ],
          }
          ],
        },
      }).then((users) => {
        const jsusers = users.map((user) => {
          return lodash.pick(user.toJSON(), ['i_user', 'name', 'surname', 'username', 'email', 'is_active']);
        });
        debug('users,', jsusers);
        return jsusers;
      });
    },
  },
  User: {
    messages: async (_, __, {
      mModels,
      user,
    }) => {
      const message = await mModels.Message.find({
        user: user.i_user,
      });
      return message;
    },
    threads: async (_, __, {
      db,
      mModels,
      user,
    }) => {
      const { dname, tenant } = user;
      const threads = await mModels.Thread.find({
        members: {
          $all: user.i_user,
        },
      });
      debug('threads', threads);
      const nmembers = [];
      threads.forEach((thread) => {
        thread.members.forEach((member) => {
          db[dname].schema(tenant).find({
            i_user: member,
          }).then((user) => {
            nmembers.push(user.toJSON());
          });
        });
        thread.members = nmembers;
        nmember = [];
      });
      debug('threads', threads);
      return threads;
    },

  },
};
