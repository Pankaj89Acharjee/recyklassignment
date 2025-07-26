import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { validate } from '../middleware/validate';



export const registerUserValidation = [
    body('email').isEmail().withMessage('Enter a valide email'),
    body('password').isStrongPassword().withMessage('Password should contain Alphnumeric with special characters'),
    body('role').notEmpty().withMessage('Role is required'),
    validate
]


export const loginUserValidation = [
    body('email').isEmail().withMessage('Enter a valide email'),
    body('password').isStrongPassword().withMessage('Password should contain Alphnumeric with special characters'),
    validate
]

export const registerNewUser = async (req: Request, res: Response) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password) return res.status(400).json({ status: false, message: "Missing credentials" });

        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password: hash, role });
        if (!user) return res.status(500).json({ status: false, message: "Failed to create user" });
        return res.status(201).json({ status: true, message: "User registered", userId: user.getDataValue("id") });
    } catch (error: unknown) {
        console.error("Error during user registration:", error);
        let message = 'Internal server error';
        if (error instanceof Error) {
            message = error.message;
        }
        return res.status(500).json({ status: false, message });
    }

}





export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(401).json({ success: false, message: "Invalid email" });

        const valid = await bcrypt.compare(password, user.getDataValue("password"));
        if (!valid) return res.status(401).json({ success: false, message: "Invalid password" });

        const token = jwt.sign(
            { userId: user.getDataValue("id"), role: user.getDataValue("role") },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "1h" }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000 // 1 hr
        })
        res.json({ email, role: user.getDataValue("role"), token, success: true });
    } catch (error) {
        console.error("Error during login:", error);
        let message = 'Internal server error';
        if (error instanceof Error) {
            message = error.message;
        }
        return res.status(500).json({ status: false, message });
    }

}