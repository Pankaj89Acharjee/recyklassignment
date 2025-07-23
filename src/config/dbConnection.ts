import { Device } from "../models/device";
import { DeviceTelemetry } from "../models/telemetry";
import { sequelize } from "./db";


export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connection established successfully.");
        Device.hasMany(DeviceTelemetry, {foreignKey: 'deviceId'})
        DeviceTelemetry.belongsTo(Device, {foreignKey: 'deviceId'});
        await sequelize.sync();
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
}