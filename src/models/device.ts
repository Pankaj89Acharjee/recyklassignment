import { DataTypes } from "sequelize";
import { sequelize } from "../config/db";

export const Device = sequelize.define("Device", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    type: DataTypes.STRING,
    location: DataTypes.STRING,
    status: {
        type: DataTypes.ENUM("active", "inactive", "decommissioned"),
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



