import request from 'supertest';
import app from '../src/app';
import { sequelize } from '../src/config/db';
import { User } from '../src/models/user';
import { Device } from '../src/models/device';
import jwt from 'jsonwebtoken';

describe('GET /devices/summary', () => {
    let token: string;

    beforeAll(async () => {
        // Sync DB and create a test user and devices
        await sequelize.sync({ force: true });

        const user = await User.create({
            email: 'test@example.com',
            password: '123456',
            role: 'admin'
        });

        token = jwt.sign(
            { userId: user.getDataValue('id'), role: user.getDataValue('role') },
            process.env.JWT_SECRET || 'somesecretkey',
            { expiresIn: '1h' }
        );

        // Add test devices
        await Device.bulkCreate([
            { id: '1', type: 'RVM XXL', location: 'Kolkata' },
            { id: '2', type: 'RVM', location: 'Bangalore' },
            { id: '3', type: 'Recycle Sensor', location: 'Kolkata' }
        ]);
    });

    it('should return summary data grouped by type and location', async () => {
        const res = await request(app)
            .get('/devices/summary?page=1&limit=10')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ deviceType: 'RVM XXL', region: 'Kolkata', count: expect.any(String) }),
                expect.objectContaining({ deviceType: 'RVM', region: 'Bangalore', count: expect.any(String) })
            ])
        );
    });
});
