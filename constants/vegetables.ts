import { PrismaClient } from "@prisma/client";
import { vegetables } from "./data";

const prisma = new PrismaClient();

async function putVegetablesToDb() {
  await Promise.all(
    vegetables.map((element) => {
      prisma.vegetable.create({
        data: {
          name: element.name,
          description: element.description,
          specifications: element.specifications,
          sowing: element.sowing,
          plantation: element.plantation,
          harvest: element.harvest,
          affinity: element.affinity,
          bad_neighbors: element.bad_neighbors,
        },
      });
    })
  );
  await prisma.$disconnect();
}
putVegetablesToDb();
