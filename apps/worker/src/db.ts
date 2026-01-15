import { PrismaClient, PrismaPg } from "@repo/database";

const connectionString = `${process.env.DATABASE_URL}`;
const ssl =
    process.env.DATABASE_SSL === "true"
        ? { rejectUnauthorized: false }
        : undefined;

const adapter = new PrismaPg({
    connectionString,
    ssl,
});
const prisma = new PrismaClient({ adapter });

export { prisma };
