// --- MODAL LOGIC ---
// 1. Target the NEW button using its class
//const addItemBtn1 = document.querySelector(".add-item-button");
const addItemBtns = document.querySelectorAll(".nav-item.add-item"); // All add-item buttons (footer + controls-bar)
const modalOverlay = document.getElementById("addItemModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");


let editingItemId = null;
let editingLi = null;
let mode = "add";

const form = document.getElementById("addItemForm");

// Function to open modal
function openModal() {
  if (modalOverlay) modalOverlay.classList.add("active");
}

// Function to close modal
function closeModal() {
  if (modalOverlay) modalOverlay.classList.remove("active");
}

// Open modal for adding a new item: reset mode, clear form, then open
function openModalForAdd() {
  mode = "add";
  if (form) form.reset();
  openModal();
}

// Event Listeners
//if (addItemBtn1) addItemBtn1.addEventListener("click", openModalForAdd);
if(addItemBtns) addItemBtns.forEach(btn => btn.addEventListener("click", openModalForAdd));
if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

// Close if clicking outside the modal card (on the blurred background)
if (modalOverlay) {
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });
}

//===================== EDIT AN ITEM =======================//
let listEl = document.querySelector(".item-list");
if(listEl){ 
listEl.addEventListener("click", (e) => {
  //get item being edited
  if (!e.target.classList.contains("edit-icon")) return;
    const li = e.target.closest(".list-item");
    if (!li) return;

    editingItemId = li.dataset.id;
    editingLi = li;
    mode = "edit";

    //select input in modal
    document.getElementById("itemName").value = li.dataset.item;
    document.getElementById("itemQty").value =
      li.querySelector(".item-info").innerText;

      openModal()
});
}
//==================== FORM SUBMISSION FOR EDITING AND ADDING ITEM ==================//

if (form) {
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Grab values from inputs
  const item = document.getElementById("itemName").value;
  const quantity = document.getElementById("itemQty").value;
  const store = document.getElementById("itemStore").value;
  const weeksLasting = document.getElementById("weeksLasting")?.value;
  console.log(item)

  try {
    //------------------- ADD ITEM ---------------------
    if(mode === 'add'){
    // Send to server
    const res = await fetch("/api/saveItem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ item, quantity, store, weeksLasting }),
    });

    if (!res.ok) throw new Error("Save item failed");

    const newItem = await res.json(); // get saved item from server

    // Clear inputs for next entry
    form.reset();
    document.getElementById("itemName").focus();

    // Dynamically create list element
    renderNewListItem(newItem);
    }

    //--------------------- EDIT ITEM ----------------------------

    else if (mode === "edit") {
      const item = document.getElementById("itemName").value;
      const quantity = document.getElementById("itemQty").value;
      console.log("EDIT MODE:", {
        mode,
        editingItemId,
        item,
        quantity,
      });

      const res = await fetch("/api/editItem", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          editedItem: item,
          quantity,
          itemId: editingItemId,
        }),
      });
      if (!res.ok) throw new Error("Edit failed");
      const updatedItem = await res.json();
      editingLi.querySelector(".item-details").innerText = updatedItem.item;
      editingLi.dataset.item = updatedItem.item;
      editingLi.querySelector(".item-info").innerText = updatedItem.quantity;
    

    form.reset()
    closeModal()
    }

  } catch (err) {
    console.error(err);
    alert("Opertaion failed");
  }
});
}

function renderNewListItem(newItem) {
  // Find the store group first
  let storeGroup = document.querySelector(`.store-group[data-store="${newItem.store}"]`);
  //let itemList;

  if (!storeGroup) {
    storeGroup = document.createElement("div");
    storeGroup.classList.add("store-group");
    storeGroup.dataset.store = newItem.store;

    const header = document.createElement("h3");
    header.classList.add("store-header");
    header.textContent = `🛒 ${newItem.store}`;

    listEl = document.createElement("ul");
    listEl.classList.add("item-list");

    storeGroup.appendChild(header);
    storeGroup.appendChild(listEl);
    document.querySelector(".content").appendChild(storeGroup);
  } else {
    listEl = storeGroup.querySelector(".item-list");
  }

  const li = document.createElement("li");
  li.classList.add("list-item");
  li.dataset.store = newItem.store;
  li.dataset.id = newItem._id;
  li.dataset.item = newItem.item;
  li.setAttribute("draggable", "true");

  // Use emoji from database (stored when item was created)
  const emoji = newItem.emoji || "🛒"
  
li.innerHTML = `
    <input type="checkbox" class="item-checkbox" data-id="${newItem._id}">
    <span class"emoji">${emoji}</span>
    <label class="item-details">${newItem.item}</label>
    <span class="item-info">${newItem.quantity}</span>
    <i class="fas fa-pencil-alt edit-icon"></i>`;

  listEl.appendChild(li);
}

// ${newItem.weeksLasting ? `<span class="item-note">${newItem.weeksLasting}</span>` : ""}