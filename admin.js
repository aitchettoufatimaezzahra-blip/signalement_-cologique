// Bouton signalements
document.getElementById("btnSignalements").addEventListener("click", () => {
  const listeDiv = document.getElementById("listeAdmin");
  if (listeDiv.style.display === "none") {
    listeDiv.style.display = "block";
    document.getElementById("btnSignalements").innerText = "Masquer les signalements";
    chargerSignalements();
  } else {
    listeDiv.style.display = "none";
    document.getElementById("btnSignalements").innerText = "Voir les signalements";
  }
});

// Charger les signalements
async function chargerSignalements() {
  const response = await fetch("/api/signalements");
  const data = await response.json();

  const liste = document.getElementById("listeAdmin");
  liste.innerHTML = "";

  data.forEach(sig => {
    const item = document.createElement("div");
    item.innerHTML = `
      <h3>${sig.titre}</h3>
      <p>${sig.description}</p>
      <p>Type : ${sig.type}</p>
      <p>Statut actuel : ${sig.statut}</p>
      <p>Utilisateur : ${sig.nom}</p>
      <button onclick="modifierStatut(${sig.id})">Modifier statut</button>
      <hr>
    `;
    liste.appendChild(item);
  });
}

// Modifier statut
async function modifierStatut(id) {
  const nouveauStatut = prompt("Entrez le nouveau statut (en cours / traité / en attente) :");
  if (!nouveauStatut) return;

  const response = await fetch(`/admin/updateStatus/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ statut: nouveauStatut })
  });

  if (response.ok) {
    alert("✅ Statut mis à jour !");
    chargerSignalements();
  } else {
    alert("❌ Erreur lors de la mise à jour.");
  }
}
