import { DataTypes } from 'sequelize';
import { sequelize } from "../config/db";

export const DeviceTelemetry = sequelize.define('DeviceTelemetries', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  deviceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Device',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.STRING,
  },
  temperature: DataTypes.FLOAT,
  cpu: DataTypes.FLOAT,
},
  {
    freezeTableName: true,
  }
);
