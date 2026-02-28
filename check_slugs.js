const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const students = await prisma.student.findMany();
  console.log(JSON.stringify(students.map(s => ({ id: s.id, slug: s.slug })), null, 2));
}

main().finally(() => prisma.$disconnect());
