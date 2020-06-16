import Sequelize from 'sequelize';
import db from '../../clients/sequelize';

const debug = require('debug')('mobichat:db');

Object.keys(db).forEach((modelName) => {
  debug('model', modelName);
  if (modelName !== 'management') {
    const sequelize = db[modelName];
    db[modelName].User = sequelize.define('users', {
      i_user: {
        type: Sequelize.NUMBER,
        unique: true,
        primaryKey: true,
      },
      username: Sequelize.STRING,
      name: Sequelize.STRING,
      surname: Sequelize.STRING,
      email: Sequelize.STRING,
      password: Sequelize.STRING,
      // is_active: Sequelize.BOOLEAN,
      // i_role: Sequelize.BOOLEAN,
      // last_login: Sequelize.DATE,
    }, {
      timestamps: false,
    });


    db[modelName].Session = sequelize.define('django_session', {
      session_key: Sequelize.STRING,
      session_data: Sequelize.STRING,
      expire_date: Sequelize.DATE,
    }, {
      timestamps: false,
      freezeTableName: true,
      // define the table's name
      tableName: 'django_session',
    });
    db[modelName].Session.removeAttribute('id');
  }
});

export default db;
