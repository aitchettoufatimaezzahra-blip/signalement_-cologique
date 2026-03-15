const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
app.use(express.json());

// Servir les fichiers statiques (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname)));

// Connexion à la base SQLite
const db = new sqlite3.Database("signalements.db");

// Création de la table si elle n'existe pas
db.run(`CREATE TABLE IF NOT EXISTS signalements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titre TEXT,
  description TEXT,
  type TEXT,
  nom TEXT,
  statut TEXT DEFAULT 'en cours',
  suggestion TEXT,
  isAnonymous INTEGER DEFAULT 0
)`);

// Fonction pour générer des suggestions en fonction du type
function generateSuggestion(type) {
  const suggestions = {
    "eau": "Fermez les robinets correctement pour éviter le gaspillage.",
    "énergie": "Éteignez les lumières et appareils inutilisés.",
    "déchets": "Recyclez les papiers et plastiques.",
    "default": "Adoptez un comportement éco‑responsable chaque jour."
  };
  return suggestions[type] || suggestions["default"];
}

// Servir les pages HTML
app.get("/formulaire.html", (req, res) => {
  res.sendFile(path.join(__dirname, "formulaire.html"));
});

app.get("/admin.html", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// Route POST pour ajouter un signalement
app.post("/api/signalements", (req, res) => {
  const { titre, description, type, nom, isAnonymous } = req.body;
  const finalNom = isAnonymous ? "Anonyme" : nom;
  const suggestion = generateSuggestion(type);

  db.run(
    `INSERT INTO signalements (titre, description, type, nom, statut, suggestion, isAnonymous)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [titre, description, type, finalNom, "en cours", suggestion, isAnonymous ? 1 : 0],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        id: this.lastID,
        titre,
        description,
        type,
        nom: finalNom,
        statut: "en cours",
        suggestion
      });
    }
  );
});

// Route GET pour consulter les signalements
app.get("/api/signalements", (req, res) => {
  db.all(`SELECT * FROM signalements ORDER BY id DESC`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Route PUT pour mettre à jour le statut d’un signalement (utilisateur)
app.put("/api/signalements/:id", (req, res) => {
  const { id } = req.params;
  const { statut } = req.body;

  db.run(
    `UPDATE signalements SET statut = ? WHERE id = ?`,
    [statut, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Signalement non trouvé" });
      }
      res.json({ id, statut });
    }
  );
});

// Route PUT pour mettre à jour le statut en tant qu’admin
app.put("/admin/updateStatus/:id", (req, res) => {
  const { id } = req.params;
  const { statut } = req.body;

  db.run(
    `UPDATE signalements SET statut = ? WHERE id = ?`,
    [statut, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Signalement non trouvé" });
      }
      res.json({ message: "Statut mis à jour", id, statut });
    }
  );
});

// Route GET pour les statistiques globales
app.get("/stats", (req, res) => {
  db.all(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN statut = 'en cours' THEN 1 ELSE 0 END) as en_cours,
      SUM(CASE WHEN statut = 'traité' THEN 1 ELSE 0 END) as traites,
      SUM(CASE WHEN statut = 'en attente' THEN 1 ELSE 0 END) as en_attente
    FROM signalements
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows[0]);
  });
});

// Route DELETE pour supprimer un signalement
app.delete("/api/signalements/:id", (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM signalements WHERE id = ?`, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Signalement non trouvé" });
    }
    res.json({ message: "Signalement supprimé", id });
  });
});

// Démarrer le serveur
app.listen(3000, "0.0.0.0", () => {
  console.log("✅ Serveur démarré sur http://localhost:3000");
});
