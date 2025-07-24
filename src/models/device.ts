import { DataTypes } from "sequelize";
import { sequelize } from "../config/db";

export const Device = sequelize.define("Device", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    type: DataTypes.STRING,
    location: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },

    manufacturer: DataTypes.STRING,
    macAddress: {
        type: DataTypes.STRING,
        unique: true,
    },
    firmwareVersion: DataTypes.STRING,
    status: {
        type: DataTypes.ENUM("active", "inactive", "decommissioned", "deployed", "manufacturing"),
        defaultValue: "active",
    },
    registeredAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
},
    {
        freezeTableName: true,
    }
)



