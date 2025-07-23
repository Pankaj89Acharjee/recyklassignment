import express from 'express';
import { addNewTelemetryData, decommissionDevice, decommissionDeviceValidation, deviceSummary, getAllDevices, getDeviceHealth, registerDeviceValidation, registerNewDevice, registerTelemetryValidation } from '../controllers/deviceControllers';
import { authorize } from '../middleware/authorize';

const router = express.Router();



router.post('/register', authorize(['admin']), registerDeviceValidation, registerNewDevice);

router.get('/allDevices', authorize(['admin', 'user']), getAllDevices)

// For adding new Teloemetry data
router.post('/:id/telemetry', authorize(['admin']), registerTelemetryValidation, addNewTelemetryData);

router.get('/:id/health', authorize(['admin', 'user']), getDeviceHealth);

router.put('/:id/decommission', authorize(['admin']), decommissionDeviceValidation, decommissionDevice);

router.get('/summary', authorize(['admin', 'user']), deviceSummary);

export default router;
