import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.get('/', authenticate, authorize('ADMIN', 'ADVISOR'), async (req: AuthRequest, res, next) => {
  try {
    const { search, company, status } = req.query;

    let where: any = {};

    if (req.user?.role === 'ADVISOR') {
      where.advisorId = req.user.id;
    }

    if (search) {
      where.OR = [
        { user: { name: { contains: search as string, mode: 'insensitive' } } },
        { registrationNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (company) {
      where.companyId = company as string;
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        company: true,
        documents: true,
        _count: { select: { documents: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = students.map((s) => {
      const pendingDocs = s.documents.filter((d) => d.status === 'PENDING').length;
      const approvedDocs = s.documents.filter((d) => d.status === 'APPROVED').length;
      return {
        id: s.id,
        registrationNumber: s.registrationNumber,
        course: s.course,
        totalHours: s.totalHours,
        name: s.user.name,
        email: s.user.email,
        company: s.company,
        documentCount: s._count.documents,
        pendingDocuments: pendingDocs,
        approvedDocuments: approvedDocs,
        createdAt: s.createdAt,
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        company: true,
        documents: { orderBy: { createdAt: 'desc' } },
        reports: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!student) throw new AppError(404, 'Aluno não encontrado');

    if (req.user?.role === 'STUDENT' && student.userId !== req.user.id) {
      throw new AppError(403, 'Acesso não autorizado');
    }

    res.json(student);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, authorize('ADMIN', 'ADVISOR'), async (req: AuthRequest, res, next) => {
  try {
    const schema = z.object({
      companyId: z.string().optional(),
      advisorId: z.string().optional(),
      course: z.string().optional(),
      totalHours: z.number().optional(),
    });
    const data = schema.parse(req.body);

    const student = await prisma.student.update({
      where: { id: req.params.id },
      data,
      include: { user: true, company: true },
    });

    res.json(student);
  } catch (err) {
    next(err);
  }
});

export default router;
