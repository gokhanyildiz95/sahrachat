import config from '../config/config';

const Sequelize = require('sequelize');

const db = {};


const databases = Object.keys(config.databases);

databases.forEach((database) => {
  const dbPath = config.databases[database];

  db[database] = new Sequelize(dbPath);
  // db[database] = new Sequelize('postgres://postgres:ayk542msf572shr@212.58.23.116:5432/mobichat');
});
// export const sequelize
//
export default db;
