import { PrismaClient } from "@prisma/client";
import { vegetables } from "./data.ts";

const prisma = new PrismaClient();

async function putVegetablesToDb() {
  await Promise.all(
    vegetables.map((element) => {
      prisma.vegetable.create({
        data: {
          name: element.name,
          description: element.description,
          specifications: element.caracteristiques,
          sowing: element.semis,
          plantation: element.plantation,
          harvest: element.recolte,
          affinity: element.affinites,
          bad_neighbors: element.mauvais_voisins,
        },
      });
    })
  );
  await prisma.$disconnect();
}
putVegetablesToDb();
