import { PrismaClient, type User } from "@prisma/client";

const prisma = new PrismaClient()

const InitUsers : Partial<User>[] = [
    {
        name: "Ella",
        value: 12.92,
        phone: "(555) 123-4567"
    },
    {
        name: "Ida",
        value: 12.80,
        phone: "(555) 234-5678"
    },
    {
        name: "Earl",
        value: 2.30,
        phone: "(555) 345-6789"
    },
    {
        name: "Nina",
        value: 17.98,
        phone: "(555) 456-7890"
    },
    {
        name: "Elnora",
        value: 14.40,
        phone: "(555) 567-8901"
    },
    {
        name: "Juan",
        value: 5.26,
        phone: "(555) 678-9012"
    },
    {
        name: "Bryan",
        value: 7.21,
        phone: "(555) 789-0123"
    }
]

async function seed() {
    await prisma.user.createMany({
        data: InitUsers.map((item) => ({
                name: item.name ?? "",
                value: item.value ?? 0,
                phone: item.phone ?? "",
        }))
    })
}

seed()
.catch(err => {
    console.log(err)
    process.exit(1)
})
.finally(async () => {
    await prisma.$disconnect()
})