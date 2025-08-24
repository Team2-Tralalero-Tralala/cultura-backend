import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

await prisma.$connect()
console.log("Connected to the database")


export default prisma;