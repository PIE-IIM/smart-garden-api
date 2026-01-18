# 📋 Guide de Migration - Smart Garden API

## 🚀 Après un `git pull`

Quand vous récupérez les derniers changements du repo, suivez ces étapes :

### **Option 1 : Conserver vos données locales** ✅

```bash
# 1. Pull les changements
git pull origin develop

# 2. Installer les dépendances
npm install

# 3. Appliquer les nouvelles migrations
npx prisma migrate deploy

# 4. Générer le client Prisma
npx prisma generate

# 5. Lancer l'app
npm run dev
```

### **Option 2 : Reset complet (perte de données)** ⚠️

```bash
# 1. Pull les changements
git pull origin develop

# 2. Installer les dépendances
npm install

# 3. Reset la base de données
make reset-db

# 4. Lancer l'app
npm run dev
```

---

## 🔍 Vérifier l'état des migrations

```bash
npx prisma migrate status
```

---

## ⚠️ En cas de problème

### **Erreur : Migration déjà appliquée**
```bash
npx prisma migrate resolve --applied <nom_de_la_migration>
```

### **Erreur : Drift détecté**
```bash
make reset-db
```

### **Erreur : Fichier de migration manquant**
Contactez l'équipe et récupérez le fichier depuis Git.

---

## 💡 Bonnes pratiques

1. ✅ **Toujours pull avant de commencer à travailler**
2. ✅ **Ne jamais modifier les fichiers de migration existants**
3. ✅ **Communiquer les changements de schéma à l'équipe**
4. ❌ **Ne jamais utiliser `migrate reset` en production**

---

## 🛠️ Commandes utiles

| Commande | Description |
|----------|-------------|
| `make reset-db` | Reset complet de la DB |
| `make migrate` | Créer une nouvelle migration |
| `npx prisma migrate deploy` | Appliquer les migrations |
| `npx prisma migrate status` | Vérifier l'état |
| `npx prisma generate` | Générer le client |
| `npx prisma studio` | Interface visuelle de la DB |

---

## 📞 Support

En cas de problème, contactez l'équipe sur Slack/Discord.
