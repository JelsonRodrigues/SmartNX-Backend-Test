export default function commentTableFactory(sequelize, DataTypes) {
  return sequelize.define("Comment",
  {
    id : {
      type: DataTypes.UUID,
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
    like_count : {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  })};