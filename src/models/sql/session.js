import Sequelize from 'sequelize';
import db from '../../clients/sequelize';

Object.keys(db).forEach((modelName) => {
  console.log('model', modelName);
  const sequelize = db[modelName];
  db[modelName].Session = sequelize.define('django_session', {
    session_key: Sequelize.STRING,
    session_data: Sequelize.STRING,
    expire_date: Sequelize.DATE,
  }, {
    timestamps: false,
  });
});

export default db;
