export type Vegetable = {
    name: string;
    description: string;
    caracteristiques: string[];
    semis: string;
    plantation: string;
    recolte: string;
    affinites: string[];
    mauvais_voisins: string[];
}[]

export const vegetables: Vegetable = [
  {
    "name": "Tomate",
    "description": "Plante fruitière très populaire, nécessite beaucoup de lumière et de chaleur.",
    "caracteristiques": ["Besoin ensoleillement élevé", "Sensible au mildiou", "Croissance verticale"],
    "semis": "Février à avril",
    "plantation": "Avril à juin",
    "recolte": "Juillet à octobre",
    "affinites": ["Basilic", "Carotte", "Oignon"],
    "mauvais_voisins": ["Pomme de terre", "Fenouil"]
  },
  {
    "name": "Basilic",
    "description": "Herbe aromatique facile à cultiver, aime la chaleur et l'humidité.",
    "caracteristiques": ["Aime la chaleur", "Pousse rapide", "Aromatique puissante"],
    "semis": "Mars à mai",
    "plantation": "Mai à juin",
    "recolte": "Juin à septembre",
    "affinites": ["Tomate", "Poivron", "Aubergine"],
    "mauvais_voisins": ["Rue officinale"]
  },
  {
    "name": "Persil",
    "description": "Herbe aromatique résistante, pousse bien en intérieur ou extérieur.",
    "caracteristiques": ["Pousse lente", "Résistant au froid", "Aromatique universel"],
    "semis": "Février à août",
    "plantation": "Avril à septembre",
    "recolte": "Mai à novembre",
    "affinites": ["Tomate", "Carotte", "Ciboulette"],
    "mauvais_voisins": ["Laitue", "Menthe"]
  },
  {
    "name": "Laitue",
    "description": "Légume-feuille rapide, aime les zones fraîches et ombragées.",
    "caracteristiques": ["Croissance rapide", "Sensible à la chaleur", "Feuillage tendre"],
    "semis": "Février à octobre",
    "plantation": "Mars à octobre",
    "recolte": "Avril à novembre",
    "affinites": ["Radis", "Carotte", "Fraise"],
    "mauvais_voisins": ["Persil"]
  },
  {
    "name": "Ciboulette",
    "description": "Plante vivace au goût fin, idéale en pot ou pleine terre.",
    "caracteristiques": ["Vivace", "Aime la mi-ombre", "Anti-insectes"],
    "semis": "Mars à mai",
    "plantation": "Avril à juin",
    "recolte": "Avril à octobre",
    "affinites": ["Carotte", "Persil", "Pommier"],
    "mauvais_voisins": ["Haricot"]
  },
  {
    "name": "Menthe",
    "description": "Aromatique vigoureuse, à cultiver de préférence en pot.",
    "caracteristiques": ["Invasive", "Vivace", "Rafraîchissante"],
    "semis": "Mars à mai",
    "plantation": "Avril à juin",
    "recolte": "Mai à octobre",
    "affinites": ["Chou", "Pois", "Radis"],
    "mauvais_voisins": ["Persil", "Camomille"]
  },
  {
    "name": "Épinard",
    "description": "Légume-feuille nutritif, aime les zones fraîches.",
    "caracteristiques": ["Sensible à la chaleur", "Croissance rapide", "Feuilles tendres"],
    "semis": "Février à mai et août à octobre",
    "plantation": "Mars à mai ou septembre",
    "recolte": "Avril à juin et octobre à décembre",
    "affinites": ["Fraise", "Pois", "Radis"],
    "mauvais_voisins": ["Betterave"]
  },
  {
    "name": "Radis",
    "description": "Légume-racine à croissance rapide, idéal en balcon.",
    "caracteristiques": ["Pousse rapide", "Aime l’humidité", "Idéal débutant"],
    "semis": "Mars à septembre",
    "plantation": "Non applicable (semis direct)",
    "recolte": "Avril à octobre",
    "affinites": ["Carotte", "Laitue", "Épinard"],
    "mauvais_voisins": ["Chou"]
  },
  {
    "name": "Carotte",
    "description": "Légume-racine demandant un sol profond et meuble.",
    "caracteristiques": ["Racine longue", "Pousse lente", "Sensibles aux cailloux"],
    "semis": "Mars à juillet",
    "plantation": "Non applicable (semis direct)",
    "recolte": "Juin à novembre",
    "affinites": ["Poireau", "Ciboulette", "Laitue"],
    "mauvais_voisins": ["Aneth"]
  },
  {
    "name": "Poivron",
    "description": "Plante du soleil, idéale en pot exposé sud.",
    "caracteristiques": ["Besoin de chaleur", "Croissance lente", "Fruits colorés"],
    "semis": "Février à avril",
    "plantation": "Mai à juin",
    "recolte": "Juillet à octobre",
    "affinites": ["Basilic", "Oignon", "Carotte"],
    "mauvais_voisins": ["Fenouil"]
  },
  {
    "name": "Courgette",
    "description": "Plante productive demandant de la place.",
    "caracteristiques": ["Gourmande en eau", "Pousse rapide", "Grand feuillage"],
    "semis": "Avril à mai",
    "plantation": "Mai à juin",
    "recolte": "Juin à septembre",
    "affinites": ["Haricot", "Maïs", "Radis"],
    "mauvais_voisins": ["Pomme de terre"]
  },
  {
    "name": "Thym",
    "description": "Aromatique méditerranéenne, très résistante.",
    "caracteristiques": ["Vivace", "Aime la sécheresse", "Anti-insectes"],
    "semis": "Mars à juin",
    "plantation": "Mai à juillet",
    "recolte": "Toute l’année",
    "affinites": ["Romarin", "Chou", "Lavande"],
    "mauvais_voisins": ["Coriandre"]
  },
  {
    "name": "Romarin",
    "description": "Plante ligneuse au parfum fort, peu exigeante.",
    "caracteristiques": ["Vivace", "Aime le soleil", "Peu d’arrosage"],
    "semis": "Mars à mai",
    "plantation": "Avril à juin",
    "recolte": "Toute l’année",
    "affinites": ["Thym", "Sauge", "Chou"],
    "mauvais_voisins": ["Menthe"]
  },
  {
    "name": "Concombre",
    "description": "Plante grimpante gourmande, aime la chaleur.",
    "caracteristiques": ["Besoin d’un tuteur", "Gourmande en eau", "Sensibles au froid"],
    "semis": "Avril à mai",
    "plantation": "Mai à juin",
    "recolte": "Juillet à septembre",
    "affinites": ["Haricot", "Tournesol", "Aneth"],
    "mauvais_voisins": ["Sauge"]
  },
  {
    "name": "Oignon vert",
    "description": "Plante rustique et rapide à pousser.",
    "caracteristiques": ["Peu d’entretien", "Rustique", "Utilisable entier"],
    "semis": "Février à avril et août à septembre",
    "plantation": "Mars à avril ou septembre",
    "recolte": "Mai à juillet et octobre",
    "affinites": ["Carotte", "Betterave", "Tomate"],
    "mauvais_voisins": ["Haricot"]
  },
  {
    "name": "Cerfeuil",
    "description": "Aromatique fine, proche du persil mais plus doux.",
    "caracteristiques": ["Délicat", "Aime la fraîcheur", "Anti-puceron"],
    "semis": "Mars à août",
    "plantation": "Avril à août",
    "recolte": "Mai à octobre",
    "affinites": ["Radis", "Laitue", "Épinard"],
    "mauvais_voisins": ["Persil"]
  },
  {
    "name": "Coriandre",
    "description": "Aromatique fragile, monte vite en graines.",
    "caracteristiques": ["Feuillage comestible", "Sensible à la chaleur", "Cycle court"],
    "semis": "Avril à juin",
    "plantation": "Mai à juillet",
    "recolte": "Juin à septembre",
    "affinites": ["Carotte", "Aneth", "Piment"],
    "mauvais_voisins": ["Thym", "Fenouil"]
  },
  {
    "name": "Piment",
    "description": "Plante fruitière colorée, aime le chaud et la lumière.",
    "caracteristiques": ["Besoin de chaleur", "Longue maturation", "Décoratif"],
    "semis": "Février à avril",
    "plantation": "Mai à juin",
    "recolte": "Juillet à octobre",
    "affinites": ["Basilic", "Coriandre", "Tomate"],
    "mauvais_voisins": ["Fenouil"]
  },
  {
    "name": "Betterave",
    "description": "Légume racine sucré, facile à cultiver.",
    "caracteristiques": ["Feuilles comestibles", "Tolère la fraîcheur", "Couleur vive"],
    "semis": "Mars à juin",
    "plantation": "Avril à juillet",
    "recolte": "Juin à novembre",
    "affinites": ["Oignon", "Chou", "Salade"],
    "mauvais_voisins": ["Épinard"]
  },
  {
    "name": "Roquette",
    "description": "Salade au goût piquant, pousse rapidement.",
    "caracteristiques": ["Feuilles tendres", "Pousse rapide", "Aime la fraîcheur"],
    "semis": "Mars à septembre",
    "plantation": "Avril à septembre",
    "recolte": "Mai à octobre",
    "affinites": ["Radis", "Carotte", "Laitue"],
    "mauvais_voisins": ["Chou"]
  }
]