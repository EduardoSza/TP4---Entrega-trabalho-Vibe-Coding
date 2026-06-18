import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.get('/student', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (req.user?.role !== 'STUDENT') throw new AppError(403, 'Acesso não autorizado');

    const student = await prisma.student.findUnique({
      where: { userId: req.user.id },
      include: {
        company: true,
        documents: { orderBy: { createdAt: 'desc' } },
        reports: { orderBy: { createdAt: 'desc' } },
        user: { select: { name: true, email: true } },
      },
    });
    if (!student) throw new AppError(404, 'Perfil de estudante não encontrado');

    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const totalDocs = student.documents.length;
    const pendingDocs = student.documents.filter((d) => d.status === 'PENDING').length;
    const approvedDocs = student.documents.filter((d) => d.status === 'APPROVED').length;
    const rejectedDocs = student.documents.filter((d) => d.status === 'REJECTED').length;
    const progressPercentage = Math.min(Math.round((student.totalHours / 400) * 100), 100);

    res.json({
      student: {
        id: student.id,
        name: student.user.name,
        email: student.user.email,
        registrationNumber: student.registrationNumber,
        course: student.course,
        totalHours: student.totalHours,
        requiredHours: 400,
        progressPercentage,
        company: student.company,
      },
      documents: {
        total: totalDocs,
        pending: pendingDocs,
        approved: approvedDocs,
        rejected: rejectedDocs,
        recent: student.documents.slice(0, 5),
      },
      reports: student.reports.slice(0, 5),
      notifications,
      hoursByMonth: [
        { month: 'Jan', hours: 20 },
        { month: 'Fev', hours: 35 },
        { month: 'Mar', hours: 50 },
        { month: 'Abr', hours: 45 },
        { month: 'Mai', hours: 60 },
        { month: 'Jun', hours: student.totalHours > 250 ? 70 : 40 },
      ],
    });
  } catch (err) {
    next(err);
  }
});

router.get('/advisor', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (req.user?.role !== 'ADVISOR') throw new AppError(403, 'Acesso não autorizado');

    const students = await prisma.student.findMany({
      where: { advisorId: req.user.id },
      include: {
        user: { select: { name: true, email: true } },
        company: true,
        documents: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalStudents = students.length;
    const pendingReviews = students.reduce(
      (acc, s) => acc + s.documents.filter((d) => d.status === 'PENDING').length,
      0
    );
    const totalHours = students.reduce((acc, s) => acc + s.totalHours, 0);
    const withCompany = students.filter((s) => s.companyId).length;

    const statusByCompany = await prisma.company.findMany({
      include: { _count: { select: { students: true } } },
    });

    const studentList = students.map((s) => ({
      id: s.id,
      name: s.user.name,
      email: s.user.email,
      registrationNumber: s.registrationNumber,
      course: s.course,
      totalHours: s.totalHours,
      company: s.company,
      pendingDocuments: s.documents.filter((d) => d.status === 'PENDING').length,
      approvedDocuments: s.documents.filter((d) => d.status === 'APPROVED').length,
      lastActivity: s.documents.length > 0 ? s.documents[0].createdAt : s.createdAt,
    }));

    res.json({
      totalStudents,
      pendingReviews,
      totalHours,
      withCompany,
      students: studentList,
      companies: statusByCompany,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
