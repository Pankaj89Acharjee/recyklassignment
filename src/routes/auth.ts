import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { loginUser, loginUserValidation, registerNewUser, registerUserValidation } from '../controllers/userController';

const router = express.Router();


router.post('/register', registerUserValidation, registerNewUser);

router.post('/login', loginUserValidation, loginUser);



export default router;