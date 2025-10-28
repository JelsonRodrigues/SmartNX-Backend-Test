import Sequelize from 'sequelize';

const db_host = process.env.DATABASE_HOST || 'localhost';
const db_user = process.env.DATABASE_USER || 'postgres';
const db_password = process.env.DATABASE_PASSWORD || 'postgres';
const db_port = process.env.DATABASE_PORT || '5432';
const db_name = process.env.DATABASE_NAME || 'development';

const sequelize = new Sequelize(`postgres://${db_user}:${db_password}@${db_host}:${db_port}/${db_name}`);

try {
  await sequelize.authenticate();
  console.log('Connection to database has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

export default sequelize;