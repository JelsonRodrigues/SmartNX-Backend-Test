import { DataTypes } from "sequelize";
import db from "./db.mjs"

const User = db.define("User",
{
  id : {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  display_name : {
    type: DataTypes.STRING,
  },
  user_name : {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password : {
    type: DataTypes.STRING(64),
    allowNull: false
  },
  is_active : {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

await User.sync({alter: true});

export default User;