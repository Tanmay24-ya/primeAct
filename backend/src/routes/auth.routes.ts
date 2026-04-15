import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { registerSchema, loginSchema } from '../utils/schemas';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, getMe);

export default router;
