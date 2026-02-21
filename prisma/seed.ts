import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import bcrypt from 'bcryptjs'; // You'll need this since Prisma doesn't have pre-save hooks

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Emptying database...');
  // Clear existing data to prevent unique constraint errors (Optional)
  await prisma.follow.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.video.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding data...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create a User
  const user = await prisma.user.create({
    data: {
      username: 'johndoe',
      email: 'john@example.com',
      password: hashedPassword,
      provider: 'credentials',
      isPrivate: false,
      // Nested objects in Prisma/Postgres are usually flat fields or JSON
      profilePhotoUrl: 'https://placehold.co',
      profilePhotoId: 'default_id',

      // 2. Create Videos for this user immediately (Nested Write)
      videos: {
        create: [
          {
            title: 'My First Video',
            description: 'Developing with Prisma is cool!',
            videoUrl: 'https://example.com/video1.mp4',
            videoFileId: 'v1',
            thumbnailUrl: 'https://example.com/thumb1.jpg',
            thumbnailFileId: 't1',
            randomScore: Math.random(),
          },
        ],
      },
    },
  });

  console.log(`Seeding finished. Created user: ${user.username}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
