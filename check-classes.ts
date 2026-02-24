import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const classes = await prisma.class.findMany({
    select: { name: true, schedule: true, units: true }
  });
  console.log(JSON.stringify(classes, null, 2));
}
main().finally(() => prisma.$disconnect());
