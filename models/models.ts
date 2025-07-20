export interface Signup {
  name: string;
  email: string;
  password: string;
}

export interface Login {
  email: string;
  password: string;
}

export type Vegetable = {
  id?: string;
  name: string;
  description: string;
  specifications: string[];
  sowing: string[];
  plantation: string[];
  harvest: string[];
  affinity: string[];
  bad_neighbors: string[];
  images?: string[];
  gardenVegetableId?: string;
};

export type GardenVegetable = {
  id: string;
  vegetableId: string;
  createdAt: string;
  userId: string;
};

export type GardenVegetableWithRelation = GardenVegetable & {
  vegetable: Vegetable;
};
