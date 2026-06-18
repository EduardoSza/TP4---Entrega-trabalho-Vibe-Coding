import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  const advisor = await prisma.user.upsert({
    where: { email: 'ana.orientadora@universidade.edu' },
    update: {},
    create: {
      name: 'Ana Oliveira',
      email: 'ana.orientadora@universidade.edu',
      password: hashedPassword,
      role: 'ADVISOR' as Role,
    },
  });

  const company = await prisma.company.upsert({
    where: { cnpj: '11222333000181' },
    update: {},
    create: {
      name: 'Tech Solutions Ltda',
      cnpj: '11222333000181',
      address: 'Av. Paulista, 1000, São Paulo - SP',
      phone: '(11) 99999-8888',
      supervisorName: 'Carlos Souza',
      supervisorEmail: 'carlos@techsolutions.com',
    },
  });

  const studentUser = await prisma.user.upsert({
    where: { email: 'claudio.aluno@universidade.edu' },
    update: {},
    create: {
      name: 'Cláudio Silva',
      email: 'claudio.aluno@universidade.edu',
      password: hashedPassword,
      role: 'STUDENT' as Role,
      student: {
        create: {
          registrationNumber: '2021001',
          course: 'Ciência da Computação',
          totalHours: 210,
          companyId: company.id,
          advisorId: advisor.id,
        },
      },
    },
    include: { student: true },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'maria.aluno@universidade.edu' },
    update: {},
    create: {
      name: 'Maria Santos',
      email: 'maria.aluno@universidade.edu',
      password: hashedPassword,
      role: 'STUDENT' as Role,
      student: {
        create: {
          registrationNumber: '2021002',
          course: 'Engenharia de Software',
          totalHours: 150,
          companyId: company.id,
          advisorId: advisor.id,
        },
      },
    },
  });

  const categories = [
    'termo_de_compromisso',
    'plano_de_atividades',
    'relatorio_mensal',
  ];

  for (const cat of categories) {
    await prisma.document.create({
      data: {
        category: cat,
        fileUrl: `/uploads/sample-${cat}.pdf`,
        fileName: `${cat}.pdf`,
        status: 'APPROVED',
        studentId: studentUser.student!.id,
      },
    });
  }

  await prisma.document.create({
    data: {
      category: 'relatorio_final',
      fileUrl: '/uploads/sample-relatorio-final.pdf',
      fileName: 'relatorio_final.pdf',
      status: 'PENDING',
      studentId: studentUser.student!.id,
    },
  });

  await prisma.notification.create({
    data: {
      title: 'Bem-vindo ao sistema',
      message: 'Seu cadastro foi realizado com sucesso!',
      type: 'MESSAGE',
      userId: studentUser.id,
    },
  });

  await prisma.notification.create({
    data: {
      title: 'Documento pendente',
      message: 'Seu relatório final está aguardando aprovação do orientador.',
      type: 'DEADLINE',
      userId: studentUser.id,
    },
  });

  console.log('Seed concluído com sucesso!');
  console.log('Aluno: claudio.aluno@universidade.edu / 123456');
  console.log('Orientador: ana.orientadora@universidade.edu / 123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
