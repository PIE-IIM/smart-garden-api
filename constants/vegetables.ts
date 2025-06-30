import { PrismaClient } from "@prisma/client";
import { vegetables } from "./data.ts";

const prisma = new PrismaClient();

async function putVegetablesToDb() {
  try {
    await Promise.all(
      vegetables.map((element) => {
        return prisma.vegetable.create({
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
    console.log("Vegetables added to the database successfully.");
  } catch (error) {
    console.error("Failed to add data: ", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function getVegetablesFromDb() {
  try {
    const vegetables = await prisma.vegetable.findMany();
    console.log("Vegetables retrieved from the database:", vegetables);
    return vegetables;
  } catch (error) {
    console.error("Failed to retrieve vegetables: ", error);
    return [];
  }
}

putVegetablesToDb();
