import Sequelize from "sequelize";
import userTableFactory from "./models/User.mjs";
import postTableFactory from "./models/Post.mjs";
import commentTableFactory from "./models/Comment.mjs";
import dotenv from "dotenv";

dotenv.config();

const dbHost = process.env.DATABASE_HOST || "localhost";
const dbUser = process.env.DATABASE_USER || "postgres";
const dbPassword = process.env.DATABASE_PASSWORD || "postgres";
const dbPort = process.env.DATABASE_PORT || "5432";
const dbName = process.env.DATABASE_NAME || "development";

const sequelize = new Sequelize(
  `postgres://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`
);

const models = {};

export async function initDB() {
  try {
    await sequelize.authenticate();
    console.log("Connection to database has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  }

  models.User = userTableFactory(sequelize, Sequelize.DataTypes);
  models.Post = postTableFactory(sequelize, Sequelize.DataTypes);
  models.Comment = commentTableFactory(sequelize, Sequelize.DataTypes);

  // Setup relations between the tables
  // User and Post -> 1:M
  models.User.hasMany(models.Post, { foreignKey: "userId" });
  models.Post.belongsTo(models.User, { foreignKey: "userId" });

  // Post and Comment -> 1:M
  models.Post.hasMany(models.Comment, { foreignKey: "postId" });
  models.Comment.belongsTo(models.Post, { foreignKey: "postId" });

  // User and Comment -> 1:M
  models.User.hasMany(models.Comment, { foreignKey: "userId" });
  models.Comment.belongsTo(models.User, { foreignKey: "userId" });

  await sequelize.sync({ alter: true });

  return { sequelize, models };
}

export { sequelize, models };
export default { initDB, sequelize, models };
