document.addEventListener("DOMContentLoaded", function () {
  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");

  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", doSearch);
    searchInput.addEventListener("keydown", e => {
      if (e.key === "Enter") doSearch();
    });
  }

  loadSearchResult();
});

function doSearch() {
  const input = document.getElementById("searchInput").value.trim();
  if (!input) {
    alert("Please enter a disease name");
    return;
  }
  window.location.href = "search.html?disease=" + encodeURIComponent(input);
}

function loadSearchResult() {
  const output = document.getElementById("output");
  if (!output) return;

  const params = new URLSearchParams(window.location.search);
  const disease = params.get("disease");

  if (!disease) {
    output.innerHTML = "<p>⚠️ No disease searched</p>";
    return;
  }

  showDiseaseInfo(disease.toLowerCase());
}

/* ---------------- GOOGLE SEARCH API ---------------- */

async function fetchFromGoogle(disease) {
  const API_KEY = "PASTE_YOUR_API_KEY_HERE";
  const CX = "PASTE_YOUR_CX_ID_HERE";

  const queryMap = {
    symptoms: `${disease} symptoms`,
    medicines: `${disease} treatment medicines`,
    diet: `${disease} diet food`,
    exercises: `${disease} exercises lifestyle`
  };

  const result = {};

  for (const key in queryMap) {
    try {
      const res = await fetch(
        `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
          queryMap[key]
        )}&key=${API_KEY}&cx=${CX}`
      );

      const data = await res.json();

      result[key] =
        data.items?.slice(0, 3).map(i => i.snippet) || [
          "Consult a medical professional"
        ];
    } catch {
      result[key] = ["Consult a medical professional"];
    }
  }

  return result;
}

/* ---------------- WIKIPEDIA FETCH ---------------- */

async function fetchFromWikipedia(disease) {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        disease.replace(/\s+/g, "_")
      )}`
    );

    const data = await res.json();

    if (!data.extract) return null;

    return {
      symptoms: [data.extract],
      medicines: ["Treatment depends on severity (doctor advised)"],
      diet: ["Balanced nutritious diet recommended"],
      exercises: ["Light activity unless restricted by doctor"]
    };
  } catch {
    return null;
  }
}

/* ---------------- MAIN FUNCTION ---------------- */

async function showDiseaseInfo(disease) {
  let info = await fetchFromWikipedia(disease);

  if (!info) {
    info = await fetchFromGoogle(disease);
  }

  renderCard(info, disease);
}

/* ---------------- UI RENDER ---------------- */

function renderCard(info, disease) {
  const output = document.getElementById("output");

  output.innerHTML = `
    <div class="result-card">
      <h2>${disease.toUpperCase()}</h2>

      <h3>Symptoms</h3>
      <ul>${info.symptoms.map(s => `<li>${s}</li>`).join("")}</ul>

      <h3>Medicines / Treatment</h3>
      <ul>${info.medicines.map(m => `<li>${m}</li>`).join("")}</ul>

      <h3>Diet / Lifestyle</h3>
      <ul>${info.diet.map(d => `<li>${d}</li>`).join("")}</ul>

      <h3>Exercises</h3>
      <ul>${info.exercises.map(e => `<li>${e}</li>`).join("")}</ul>

      <hr />
      <small>⚠️ Educational purpose only. Always consult a doctor.</small>
    </div>
  `;
}
