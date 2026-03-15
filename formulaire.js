document.getElementById("signalementForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const titre = document.getElementById("titre").value;
  const description = document.getElementById("description").value;
  const type = document.getElementById("type").value.toLowerCase();
  const nom = document.getElementById("nom").value;
  const isAnonymous = document.getElementById("anonymousCheck").checked;

  const response = await fetch("/api/signalements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ titre, description, type, nom, isAnonymous })
  });

  const data = await response.json();
  document.getElementById("message").innerText = "✅ Signalement envoyé avec succès !";
  document.getElementById("suggestionBox").innerText = "Suggestion : " + data.suggestion;
});

// Bouton pour afficher/masquer la liste
document.getElementById("btnListe").addEventListener("click", () => {
  const listeDiv = document.getElementById("listeSignalements");
  if (listeDiv.style.display === "none") {
    listeDiv.style.display = "block";
    document.getElementById("btnListe").innerText = "Masquer les signalements";
    chargerSignalements();
  } else {
    listeDiv.style.display = "none";
    document.getElementById("btnListe").innerText = "Voir les signalements";
  }
});

// Charger les signalements
async function chargerSignalements() {
  const response = await fetch("/api/signalements");
  const data = await response.json();

  const liste = document.getElementById("listeSignalements");
  liste.innerHTML = "";

  data.forEach(sig => {
    const item = document.createElement("div");
    item.innerHTML = `
      <h3>${sig.titre}</h3>
      <p>${sig.description}</p>
      <p>Type : ${sig.type}</p>
      <p>Statut : ${sig.statut}</p>
      <p>Utilisateur : ${sig.nom}</p>
      <hr>
    `;
    liste.appendChild(item);
  });
}
