const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const Students = sequelize.define("Students", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  firstName: { type: DataTypes.STRING(60), allowNull: true },
  lastName: { type: DataTypes.STRING(60), allowNull: true },
  fullName: {
    type: DataTypes.VIRTUAL,
    get() {
      const firstName = (this.getDataValue("firstName") || "").trim();
      const lastName = (this.getDataValue("lastName") || "").trim();
      return [firstName, lastName].filter(Boolean).join(" ").trim();
    },
  },
  course: { type: DataTypes.STRING(80), allowNull: false },
  yearLevel: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
});


module.exports = Students;