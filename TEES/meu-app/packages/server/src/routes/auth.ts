import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../index';
import { generateToken, authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['STUDENT', 'ADVISOR', 'SUPERVISOR', 'ADMIN']).default('STUDENT'),
  registrationNumber: z.string().optional(),
  course: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError(409, 'Email já cadastrado');

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        ...(data.role === 'STUDENT' && {
          student: {
            create: {
              registrationNumber: data.registrationNumber || `STU${Date.now()}`,
              course: data.course || 'Não definido',
            },
          },
        }),
      },
      include: { student: true },
    });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, student: user.student },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { student: { include: { company: true } } },
    });
    if (!user) throw new AppError(401, 'Email ou senha inválidos');

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) throw new AppError(401, 'Email ou senha inválidos');

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, student: user.student },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { student: { include: { company: true } } },
    });
    if (!user) throw new AppError(404, 'Usuário não encontrado');
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, student: user.student });
  } catch (err) {
    next(err);
  }
});

export default router;
