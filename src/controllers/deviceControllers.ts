import { Request, Response } from 'express';
import { body } from 'express-validator';
import { Device } from '../models/device';
import { validate } from '../middleware/validate';
import NodeCache from 'node-cache';
import { DeviceTelemetry } from '../models/telemetry';
import { fn, col } from 'sequelize';


const healthCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });
const summaryCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

//Validation using express-validator middleware
export const registerDeviceValidation = [
    body('type').notEmpty().withMessage('Device type required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('status').notEmpty().withMessage('Status is required'),
    body('manufacturer').notEmpty().withMessage('Manufacturer is required'),
    body('macAddress').notEmpty().withMessage('MAC Address is required'),
    body('firmwareVersion').notEmpty().withMessage('Firmware Version is required'),
    validate
]


export const registerTelemetryValidation = [
    body('cpu').optional().isNumeric().withMessage('CPU must be a number'),
    body('temperature').optional().isNumeric().withMessage('Temperature must be a number'),
    body('status').optional().isIn(['healthy', 'unhealthy']).withMessage('Status must be healthy or unhealthy'),
    validate
]


export const decommissionDeviceValidation = [
    body('id').isNumeric().withMessage('Device Id must be a number'),
]



// Registering a new device
export const registerNewDevice = async (req: Request, res: Response) => {
    const { type, location, status, manufacturer, macAddress, firmwareVersion } = req.body;
    if (!type || !location || !status || !manufacturer || !macAddress || !firmwareVersion) return res.status(400).json({ error: "Missing fields" });

    try {
        const addNewDevice = await Device.create({ type, location, status, manufacturer, macAddress, firmwareVersion });
        if (!addNewDevice) return res.status(500).json({ status: false, error: "Failed to register device" });
        res.status(201).json({ status: true, message: `New ${type} Device registered`, addNewDevice });
    } catch (error) {
        console.error("Error registering device:", error);
        return res.status(500).json({ status: false, error: "Failed to register device" });

    }
};




// Get all the registered devices
export const getAllDevices = async (req: Request, res: Response) => {
    try {
        const devices = await Device.findAll();
        if (!devices || devices.length === 0) {
            return res.status(404).json({ error: "No devices found" });
        }
        res.status(200).json({ devices });
    } catch (error) {
        console.error("Error fetching devices:", error);
        res.status(500).json({ error: "Failed to fetch devices" });
    }
}



export const getDeviceHealth = async (req: Request, res: Response) => {
    const deviceId = req.params.id;

    //Checking cache, if already present
    const cacheKey = `health-${deviceId}`;
    if (healthCache.has(cacheKey)) {
        return res.json({ cached: true, ...healthCache.get(cacheKey) });
    }

    // If not in the cache, fetching ...
    try {
        // Fetching telemetry for 10 records
        const telemetryLogs = await DeviceTelemetry.findAll({
            where: { deviceId },
            order: [['timestamp', 'DESC']],
            limit: 10
        });

        if (!telemetryLogs || telemetryLogs.length === 0) {
            return res.status(404).json({ error: "No telemetry found for this device" });
        }

        // Prepare response
        const formattedLogs = telemetryLogs.map(log => ({
            timestamp: log.get('timestamp'),
            cpu: log.get('cpu'),
            temperature: log.get('temperature'),
            status: log.get('status')
        }));

        const response = {
            current: formattedLogs[0],
            history: formattedLogs.slice(1)
        };

        // Cache the result
        healthCache.set(cacheKey, response);

        return res.json({ cached: false, ...response });
    } catch (err) {
        console.error("Error fetching health logs:", err);
        res.status(500).json({ error: err });
    }
}



export const addNewTelemetryData = async (req: Request, res: Response) => {
    const deviceId = req.params.id;
    const { cpu, temperature, status } = req.body;

    if (!cpu || !temperature || !status) {
        return res.status(400).json({ error: "Missing telemetry data" });
    }

    // Checking if device exists
    const device = await Device.findByPk(deviceId);
    if (!device) {
        return res.status(404).json({ error: "Device not found" });
    }

    try {
        const newTelemetry = await DeviceTelemetry.create({
            deviceId,
            cpu,
            temperature,
            status
        });

        res.status(201).json({ message: "Telemetry data added", newTelemetry });
    } catch (error) {
        console.error("Error adding telemetry data:", error);
        res.status(500).json({ error: "Failed to add telemetry data" });
    }
}



export const decommissionDevice = async (req: Request, res: Response) => {
    const deviceId = req.params.id;

    // Only Admin can decommission devices
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: "Forbidden: Only admins can decommission devices" });
    }


    try {
        const device = await Device.findByPk(deviceId);
        if (!device) {
            return res.status(404).json({ error: "Device not found" });
        }

        // Decommission logic here (e.g., update status, remove from active list)
        await device.update({ status: 'decommissioned' });

        res.json({ message: `Device ${deviceId} has been decommissioned` });
    } catch (error) {
        console.error("Error decommissioning device:", error);
        res.status(500).json({ error: "Failed to decommission device" });
    }
}



export const deviceSummary = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const cacheKey = `device-summary-${page}-${limit}`;

    const cached = summaryCache.get(cacheKey);

    if (cached) {
        return res.json({ cached: true, ...cached });
    }

    try {
        const { count, rows } = await Device.findAndCountAll({
            attributes: [
                [fn('COUNT', col('id')), 'count'],
                [col('type'), 'deviceType'],
                [col('location'), 'region']
            ],
            group: ['type', 'location'],
            limit,
            offset,
            raw: true
        });

        const response = {
            page,
            limit,
            total: count.length || 0,
            data: rows
        };

        summaryCache.set(cacheKey, response);

        res.json({ cached: false, ...response });
    } catch (error) {
        console.error("Error fetching device summary:", error);
        res.status(500).json({ error: "Failed to fetch device summary" });
    }
}
