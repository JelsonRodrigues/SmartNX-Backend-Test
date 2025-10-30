import Sequelize from 'sequelize';
import userTableFactory from './models/User.mjs';
import postTableFactory from './models/Post.mjs';
import commentTableFactory from './models/Comment.mjs';
import dotenv from 'dotenv';

dotenv.config();

const db_host = process.env.DATABASE_HOST || 'localhost';
const db_user = process.env.DATABASE_USER || 'postgres';
const db_password = process.env.DATABASE_PASSWORD || 'postgres';
const db_port = process.env.DATABASE_PORT || '5432';
const db_name = process.env.DATABASE_NAME || 'development';

const sequelize = new Sequelize(`postgres://${db_user}:${db_password}@${db_host}:${db_port}/${db_name}`);

const models = {};

export async function initDB() {
  try {
    await sequelize.authenticate();
    console.log('Connection to database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }

  models.User = userTableFactory(sequelize, Sequelize.DataTypes);
  models.Post = postTableFactory(sequelize, Sequelize.DataTypes);
  models.Comment = commentTableFactory(sequelize, Sequelize.DataTypes);

  // Setup relations between the tables
  // User and Post -> 1:M
  models.User.hasMany(models.Post, { foreignKey: 'user_id' });
  models.Post.belongsTo(models.User, { foreignKey: 'user_id' });
  
  // Post and Comment -> 1:M
  models.Post.hasMany(models.Comment, { foreignKey: 'post_id' });
  models.Comment.belongsTo(models.Post, { foreignKey: 'post_id' });

  // User and Comment -> 1:M
  models.User.hasMany(models.Comment, { foreignKey: 'user_id' });
  models.Comment.belongsTo(models.User, { foreignKey: 'user_id' });

  await sequelize.sync({alter: true});
  
  return { sequelize, models };
}

export { sequelize, models };
export default { initDB, sequelize, models };
