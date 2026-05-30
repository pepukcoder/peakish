let climbs = [];

let editingId = null;
let currentEditImage = "";

const climbsGrid = document.getElementById("climbsGrid");
const climbModal = document.getElementById("climbModal");
const modalClose = climbModal.querySelector(".modal-close");

const formModal = document.getElementById("formModal");
const formModalClose = document.getElementById("formModalClose");
const cancelFormBtn = document.getElementById("cancelFormBtn");
const formTitle = document.getElementById("formTitle");
const climbForm = document.getElementById("climbForm");

const newClimbBtn = document.getElementById("newClimbBtn");

// form fields
const fName       = document.getElementById("formName");
const fPicture    = document.getElementById("formPicture");
const fHeight     = document.getElementById("formHeight");
const fDate       = document.getElementById("formDate");
const fLocation   = document.getElementById("formLocation");
const fDifficulty = document.getElementById("formDifficulty");
const fDistance   = document.getElementById("formDistance");
const fPeople     = document.getElementById("formPeople");
const fNotes      = document.getElementById("formNotes");

const FALLBACK_IMAGE = "assets/images/climb-placeholder.webp";
const DB_NAME = "peakishDB";
const DB_VERSION = 1;
const CLIMBS_STORE = "climbs";

function allowOnlyDigitsInput(input) {
  const cleaned = input.value.replace(/\D+/g, "");
  if (input.value !== cleaned) {
    input.value = cleaned;
  }
}

function blockNonDigitKeys(event) {
  const blockedKeys = ["e", "E", "+", "-", "."];
  if (blockedKeys.includes(event.key)) {
    event.preventDefault();
  }
}

function validateNonNegativeIntegerField(field, required = false) {
  const value = field.value.trim();

  if (!value) {
    if (required) {
      field.setCustomValidity("Заполните это поле.");
      return false;
    }
    field.setCustomValidity("");
    return true;
  }

  if (!/^\d+$/.test(value)) {
    field.setCustomValidity("Введите целое неотрицательное число.");
    return false;
  }

  field.setCustomValidity("");
  return true;
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(CLIMBS_STORE)) {
        db.createObjectStore(CLIMBS_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAllClimbsFromDB() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(CLIMBS_STORE, "readonly");
    const store = tx.objectStore(CLIMBS_STORE);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function putClimbToDB(climb) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(CLIMBS_STORE, "readwrite");
    const store = tx.objectStore(CLIMBS_STORE);
    store.put(climb);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

async function deleteClimbFromDB(id) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(CLIMBS_STORE, "readwrite");
    const store = tx.objectStore(CLIMBS_STORE);
    store.delete(id);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function renderClimbs() {
  climbsGrid.innerHTML = "";

  climbs.forEach(climb => {
    const card = document.createElement("div");
    card.className = "climb-card";

    const imgSrc = climb.picture || FALLBACK_IMAGE;

    card.innerHTML = `
      <img src="${imgSrc}" alt="${climb.name}">
      <div class="card-content">
        <h3>${climb.name}</h3>
        <p>
          <img src="assets/icons/mountain.svg" class="card-icon" alt="Высота">
          <strong>Высота:</strong> ${climb.height} м
        </p>
        <p>
          <img src="assets/icons/calendar.svg" class="card-icon" alt="Дата">
          <strong>Дата:</strong> ${climb.date}
        </p>
        <p>
          <img src="assets/icons/location.svg" class="card-icon" alt="Локация">
          <strong>Локация:</strong> ${climb.location || "—"}
        </p>
      </div>
    `;

    card.addEventListener("click", () => openDetailModal(climb));
    climbsGrid.appendChild(card);
  });
}

// modals
function openDetailModal(climb) {
  const notesGroup = document.getElementById("modalNotesGroup");
  const notesValue = document.getElementById("modalNotes");
  const preparedNotes = (climb.notes || "").trim();

  document.getElementById("modalPic").src = climb.picture || FALLBACK_IMAGE;
  document.getElementById("modalName").textContent = climb.name;
  document.getElementById("modalDate").textContent = climb.date;
  document.getElementById("modalHeight").textContent = climb.height;
  document.getElementById("modalLocation").textContent = climb.location;
  document.getElementById("modalDifficulty").textContent = climb.difficulty;
  document.getElementById("modalDistance").textContent = climb.distance;
  document.getElementById("modalPeople").textContent = climb.peopleCount;
  notesValue.textContent = preparedNotes;
  notesGroup.style.display = preparedNotes ? "block" : "none";

  climbModal.querySelector(".edit-btn").onclick = () => openFormModal(climb);
  climbModal.querySelector(".delete-btn").onclick = () => deleteClimb(climb.id);

  climbModal.style.display = "block";
}

function openFormModal(climb = null) {
  formModal.style.display = "block";
  climbModal.style.display = "none";

  if (climb) {
    formTitle.textContent = "Редактировать восхождение";
    editingId = climb.id;

    currentEditImage = climb.picture || "";

    fPicture.value = "";
    fName.value = climb.name;
    fHeight.value = climb.height;
    fDate.value = climb.date;
    fLocation.value = climb.location;
    fDifficulty.value = climb.difficulty;
    fDistance.value = climb.distance;
    fPeople.value = climb.peopleCount;
    fNotes.value = climb.notes;
  } else {
    formTitle.textContent = "Новое восхождение";
    editingId = null;
    currentEditImage = "";
    climbForm.reset();
  }
}

// delete
async function deleteClimb(id) {
  if (!confirm("Удалить это восхождение?")) return;

  climbs = climbs.filter(c => c.id !== id);
  await deleteClimbFromDB(id);
  renderClimbs();

  climbModal.style.display = "none";
}

// submit
climbForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const numericValid =
    validateNonNegativeIntegerField(fHeight, true) &&
    validateNonNegativeIntegerField(fDistance, false) &&
    validateNonNegativeIntegerField(fPeople, false);

  if (!numericValid) {
    climbForm.reportValidity();
    return;
  }

  const isEditing = Boolean(editingId);

  let imageBase64 = currentEditImage;
  const file = fPicture.files[0];
  if (file) {
    imageBase64 = await fileToBase64(file);
  }

  const climbData = {
    id: editingId ?? Date.now(),
    name: fName.value.trim(),
    picture: isEditing
      ? (imageBase64 || currentEditImage)
      : (imageBase64 || FALLBACK_IMAGE),
    height: Number(fHeight.value) || 0,
    date: fDate.value,
    location: fLocation.value.trim(),
    difficulty: fDifficulty.value,
    distance: Number(fDistance.value) || 0,
    peopleCount: Number(fPeople.value) || 0,
    notes: fNotes.value.trim()
  };

  if (isEditing) {
    climbs = climbs.map(c => (c.id === editingId ? climbData : c));
  } else {
    climbs.push(climbData);
  }

  await putClimbToDB(climbData);
  renderClimbs();

  formModal.style.display = "none";
});

// events
newClimbBtn.onclick = () => openFormModal();
modalClose.onclick = () => (climbModal.style.display = "none");
formModalClose.onclick = () => (formModal.style.display = "none");
cancelFormBtn.onclick = () => (formModal.style.display = "none");

window.onclick = (e) => {
  if (e.target === climbModal) climbModal.style.display = "none";
  if (e.target === formModal) formModal.style.display = "none";
};

[fHeight, fDistance, fPeople].forEach((field) => {
  field.addEventListener("input", () => allowOnlyDigitsInput(field));
  field.addEventListener("keydown", blockNonDigitKeys);
  field.addEventListener("paste", () => {
    setTimeout(() => allowOnlyDigitsInput(field), 0);
  });
  field.addEventListener("blur", () => {
    validateNonNegativeIntegerField(field, field === fHeight);
  });
});

// init
async function initClimbsPage() {
  climbs = await getAllClimbsFromDB();
  renderClimbs();
}

initClimbsPage().catch((error) => {
  console.error("Failed to initialize climbs storage", error);
});
