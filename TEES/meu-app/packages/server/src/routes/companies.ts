import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const schema = z.object({
  name: z.string().min(2),
  cnpj: z.string().min(14),
  address: z.string().optional(),
  phone: z.string().optional(),
  supervisorName: z.string().optional(),
  supervisorEmail: z.string().email().optional(),
});

router.get('/', authenticate, async (_req, res, next) => {
  try {
    const companies = await prisma.company.findMany({
      include: { _count: { select: { students: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(companies);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, authorize('ADMIN', 'ADVISOR'), async (req, res, next) => {
  try {
    const data = schema.parse(req.body);
    const existing = await prisma.company.findUnique({ where: { cnpj: data.cnpj } });
    if (existing) throw new AppError(409, 'CNPJ já cadastrado');
    const company = await prisma.company.create({ data });
    res.status(201).json(company);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.params.id },
      include: { students: { include: { user: { select: { name: true, email: true } } } } },
    });
    if (!company) throw new AppError(404, 'Empresa não encontrada');
    res.json(company);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, authorize('ADMIN', 'ADVISOR'), async (req, res, next) => {
  try {
    const data = schema.partial().parse(req.body);
    const company = await prisma.company.update({
      where: { id: req.params.id },
      data,
    });
    res.json(company);
  } catch (err) {
    next(err);
  }
});

export default router;
