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
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing credentials" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hash, role });
    res.status(201).json({ message: "User registered", userId: user.getDataValue("id") });
}



export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid email" });

    const valid = await bcrypt.compare(password, user.getDataValue("password"));
    if (!valid) return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign(
        { userId: user.getDataValue("id"), role: user.getDataValue("role") },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "1h" }
    );
    res.json({ token });
}