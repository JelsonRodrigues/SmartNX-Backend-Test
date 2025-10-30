export default function commentTableFactory(sequelize, DataTypes) {
  return sequelize.define("Comment",
  {
    id : {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    content : {
      type: DataTypes.STRING,
      allowNull: false
    },
    is_active : {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    last_edited: {
      type: DataTypes.TIME,
    },
  })};