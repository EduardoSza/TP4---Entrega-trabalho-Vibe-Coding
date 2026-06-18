import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.jpg', '.png', '.zip'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  },
});

const CATEGORIES = [
  'termo_de_compromisso',
  'plano_de_atividades',
  'relatorio_mensal',
  'relatorio_final',
  'ficha_de_avaliacao',
  'outros',
] as const;

router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { studentId, status } = req.query;
    let where: any = {};

    if (studentId) where.studentId = studentId as string;

    if (req.user?.role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
      if (!student) throw new AppError(404, 'Perfil de estudante não encontrado');
      where.studentId = student.id;
    }

    if (status) where.status = status as string;

    const documents = await prisma.document.findMany({
      where,
      include: { student: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(documents);
  } catch (err) {
    next(err);
  }
});

router.post('/upload', authenticate, upload.single('file'), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file) throw new AppError(400, 'Arquivo não enviado');

    const schema = z.object({
      category: z.enum(CATEGORIES),
      studentId: z.string().optional(),
    });
    const data = schema.parse(req.body);

    let studentId = data.studentId;
    if (!studentId) {
      const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
      if (!student) throw new AppError(404, 'Perfil de estudante não encontrado');
      studentId = student.id;
    }

    const document = await prisma.document.create({
      data: {
        category: data.category,
        fileUrl: `/uploads/${req.file.filename}`,
        fileName: req.file.originalname,
        studentId,
        status: 'PENDING',
      },
    });

    await prisma.notification.create({
      data: {
        title: 'Novo documento enviado',
        message: `Documento "${req.file.originalname}" enviado e aguardando aprovação.`,
        type: 'APPROVAL',
        userId: req.user!.id,
      },
    });

    if (studentId !== data.studentId) {
      const advisor = await prisma.student.findUnique({ where: { id: studentId } });
      if (advisor?.advisorId) {
        await prisma.notification.create({
          data: {
            title: 'Documento pendente de aprovação',
            message: `Um novo documento foi enviado por um aluno e aguarda sua revisão.`,
            type: 'APPROVAL',
            userId: advisor.advisorId,
          },
        });
      }
    }

    res.status(201).json(document);
  } catch (err) {
    next(err);
  }
});

router.get('/categories', (_req, res) => {
  res.json(CATEGORIES);
});

router.patch('/:id/approve', authenticate, authorize('ADVISOR', 'ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    const document = await prisma.document.update({
      where: { id: req.params.id },
      data: { status: 'APPROVED' },
    });

    const doc = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: { student: true },
    });

    if (doc) {
      await prisma.notification.create({
        data: {
          title: 'Documento aprovado',
          message: `Seu documento "${doc.fileName}" foi aprovado.`,
          type: 'APPROVAL',
          userId: doc.student.userId,
        },
      });
    }

    res.json(document);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/reject', authenticate, authorize('ADVISOR', 'ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    const schema = z.object({ notes: z.string().optional() });
    const { notes } = schema.parse(req.body);

    const document = await prisma.document.update({
      where: { id: req.params.id },
      data: { status: 'REJECTED', notes },
    });

    const doc = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: { student: true },
    });

    if (doc) {
      await prisma.notification.create({
        data: {
          title: 'Documento rejeitado',
          message: `Seu documento "${doc.fileName}" foi rejeitado. Motivo: ${notes || 'Não informado'}`,
          type: 'APPROVAL',
          userId: doc.student.userId,
        },
      });
    }

    res.json(document);
  } catch (err) {
    next(err);
  }
});

export default router;
