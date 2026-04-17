const input = document.querySelector(".inputItem");
const list = document.querySelector(".groceryList"); // legacy; drag uses .item-list



  /*==================TOGGLE-BTN=================*/
    const toggleBtn = document.getElementById('menu-toggle');       // Hamburger icon
    const sidebar = document.getElementById('sidebar');             
    const closeBtn = document.getElementById('close-sidebar');      // The new 'X' icon

    // Single function to toggle the class
    const toggleSidebar = () => {
        sidebar.classList.toggle('active');
    };

    // 1. Open Button (Hamburger)
    if (toggleBtn) {
        toggleBtn.onclick = toggleSidebar;
    }
    
    // 2. Close Button (X icon)
    if (closeBtn) {
        closeBtn.onclick = toggleSidebar;
    }

/*======================SEARCH BAR==========================*/  

let allPantryItems = [];

//======== Get pantry items ==================
//get pantry items
async function getAllPantryItems() {
  try {
    let res = await fetch("/api/getPantryItems", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Could not get pantry items");
    const data = await res.json();
    allPantryItems = data.pantryItems;
  } catch (err) {
    console.error(err);
  }
}

getAllPantryItems();

const inputSearch = document.getElementById("inputSearch");
const noItemsMessage = document.querySelector(".no-items-message");
const addItemButton = document.querySelector(".add-item-button");

const handleSearch = (e) => {
  const searchItem = e.target.value.trim().toLowerCase();
  
  if (!searchItem) {
    // Clear search - hide message
    noItemsMessage.innerHTML = '';
    noItemsMessage.style.display = 'none';
    return;
  }
  
  if (!allPantryItems.length) return;
  
  const found = allPantryItems.some((item) => item.item.toLowerCase() === searchItem);
  
  if (found) {
    // Item is available
    noItemsMessage.innerHTML = '<p style="color: #4caf50; font-weight: 500;"><i class="fas fa-check-circle"></i> Item available in your pantry</p>';
    noItemsMessage.style.display = '';
  } else {
    // Item not found
    noItemsMessage.innerHTML = '<p>No matching items.</p><p>Add it to your grocery list?</p><button class="add-item-button large-button">Add Item</button>';
    noItemsMessage.style.display = '';
  }
};

inputSearch.addEventListener("input", debounce(handleSearch, 300));

function debounce(fn, delay = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
 

//=====================MOVE TO PANTRY ======================//
const moveToPantryBtn = document.querySelector('.move-to-pantry')
if(moveToPantryBtn) {
  moveToPantryBtn.addEventListener('click', async(e) =>{
    //select the checkboxes and the move to pantry button
  const selectedCb = Array.from(document.querySelectorAll('.item-checkbox:checked'))


  //go over the array of checkboxes, get item name and map into the array
  const selectedItemIds = selectedCb.map(e =>{
    return e.dataset.id
  })

  if (selectedItemIds.length === 0) {
      alert('No items selected.')
      return
    }

    try{
      const res = await fetch('/api/moveToPantry', {
        method:'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials:'same-origin',
        body: JSON.stringify({selectedItemIds})
      })
    window.location.reload()
  }catch(err){
    console.error(err)
    alert('Failed to add item to pantry.')
  }
  })
}

//===================== SELECT ALL =============================//

const selectAllCheckbox = document.getElementById('select-all-checkbox');
if (selectAllCheckbox) {
  selectAllCheckbox.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    const itemCheckboxes = document.querySelectorAll('.item-checkbox');
    
    itemCheckboxes.forEach(checkbox => {
      checkbox.checked = isChecked;
    });
  });
}

// Update select-all checkbox when individual items are checked/unchecked
document.addEventListener('change', (e) => {
  if (e.target.classList.contains('item-checkbox')) {
    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    const itemCheckboxes = document.querySelectorAll('.item-checkbox');
    const checkedCount = document.querySelectorAll('.item-checkbox:checked').length;
    
    if (selectAllCheckbox) {
      selectAllCheckbox.checked = checkedCount === itemCheckboxes.length;
    }
  }
});
//======================= DELETE ITEM =============================//

document.getElementById('deleteSelectedBtn').addEventListener('click', async () => {
  const checkedBoxes = document.querySelectorAll('.item-checkbox:checked');

  if (checkedBoxes.length === 0) {
    alert('Select at least one item to delete.');
    return;
  }

  // Collect ids
  const ids = Array.from(checkedBoxes).map(cb => cb.dataset.id);
  
  // Determine if this is a pantry page
  const currentUrl = window.location.pathname;
  const isPantry = currentUrl.includes('/pantry') || currentUrl.includes('/finished');
  
  console.log('Current URL:', currentUrl);
  console.log('Is Pantry:', isPantry);
  console.log('Deleting IDs:', ids);
  
  try {
    const res = await fetch('/api/deleteItem', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ ids, isPantry })
    });
    
    console.log('Response status:', res.status);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('Response data:', data);
    
    if (!data.success) {
      throw new Error(data.message || 'Delete failed');
    }

    // Remove from DOM
    checkedBoxes.forEach(cb => {
      cb.closest('li').remove();
    });
    
    alert(`Successfully deleted ${data.deletedCount} item(s)`);

  } catch (err) {
    console.error('Delete error:', err.message);
    alert('Failed to delete items: ' + err.message);
  }
});




// ===================== DRAG-TO-REORDER ===================== //
document.addEventListener("DOMContentLoaded", () => {
  const itemListContainers = document.querySelectorAll(".item-list");
  if (!itemListContainers.length) return;

  let draggedItem = null;

  // Event delegation for dragstart
  document.addEventListener("dragstart", (e) => {
    const li = e.target.closest("li.list-item");
    if (!li) return;

    // Skip dragging if clicking checkbox or edit icon
    if (e.target.closest("input[type=checkbox]") || e.target.closest(".edit-icon")) return;

    draggedItem = li;
    li.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", li.dataset.id);
    e.dataTransfer.setDragImage(li, 0, 0);
  });

  // Event delegation for dragend
  document.addEventListener("dragend", (e) => {
    const li = e.target.closest("li.list-item");
    if (!li) return;

    li.classList.remove("dragging");
    draggedItem = null;

    // Save order for this container
    const container = li.closest(".item-list");
    const orderedList = Array.from(container.querySelectorAll("li.list-item")).map((el, index) => ({
      id: el.dataset.id,
      order: index,
    }));
    saveOrder(orderedList);
  });

  // Event delegation for dragover
  document.addEventListener("dragover", (e) => {
    const container = e.target.closest(".item-list");
    if (!container) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const dragging = container.querySelector(".dragging");
    if (!dragging) return;

    const afterElement = getDragAfterElement(container, e.clientY);
    if (!afterElement) container.appendChild(dragging);
    else container.insertBefore(dragging, afterElement);
  });

  // Helper: find the element after which to insert the dragged item
  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll("li.list-item:not(.dragging)")];
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) return { offset, element: child };
      return closest;
    }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
  }

  // Save order to server
  async function saveOrder(orderedList) {
    try {
      const res = await fetch("/api/saveOrder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ orderedList }),
      });
      if (!res.ok) throw new Error("Update failed");
    } catch (err) {
      console.error("Error saving order:", err);
    }
  }
});


//================= FILTER BY STORES =================================//  
const selectStore = document.getElementById('store-select');
if (selectStore) {
  selectStore.addEventListener('change', (e) => {
  const selectedStore = e.target.value.toLowerCase();
  const items = document.querySelectorAll('.list-item');

  items.forEach(item => {
    const itemStore = item.dataset.store.toLowerCase();

    if (selectedStore === 'all' || itemStore === selectedStore) {
      item.style.display = '';
    } else {
      item.style.display = 'none';
    }
  });
  });
}


//======================= GET AI RECIPE SUGGESTIONS ==================//

document.addEventListener("DOMContentLoaded", () => {
  const aiLink = document.getElementById("aiRecipesLink");
  if (!aiLink) return; // important if main.js is shared across pages

  aiLink.addEventListener("click", async (e) => {
    e.preventDefault();

    const recipesModal = document.getElementById('recipesModal');
    const recipesContainer = document.getElementById('recipesContainer');
    
    // Show loading state
    recipesContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Loading recipes from AI... This may take 30 seconds.</p>';
    recipesModal.classList.add('active');

    try {
      const res = await fetch("/api/getAiRecipes", {
        method: "GET",
        credentials: 'same-origin',
      });

      if (!res.ok) {
        console.error(`Recipes fetch failed: ${res.status} ${res.statusText}`);
        recipesContainer.innerHTML = '<p style="color: red;">Failed to fetch recipes. Please try again.</p>';
        return;
      }

      // Parse JSON
      const data = await res.json();
      console.log('Response data:', data);
      console.log('Recipes:', data.recipes);

      // Display recipes in modal
      displayRecipes(data.recipes.recipes);

    } catch (err) {
      console.error('Request to /api/getAiRecipes failed', err);
      recipesContainer.innerHTML = '<p style="color: red;">Recipes fetch failed: check console for details.</p>';
    }
  });

  // Close recipes modal
  const closeRecipesBtn = document.getElementById('closeRecipesModalBtn');
  const recipesModal = document.getElementById('recipesModal');
  if (closeRecipesBtn && recipesModal) {
    closeRecipesBtn.addEventListener('click', () => {
      recipesModal.classList.remove('active');
    });
  }
});

// Function to display recipes in the modal
function displayRecipes(recipes) {
  const recipesContainer = document.getElementById('recipesContainer');
  
  if (!recipes || recipes.length === 0) {
    recipesContainer.innerHTML = '<p>No recipes found. Make sure your pantry has items and Ollama is running.</p>';
  } else {
    let recipesHTML = '';
    recipes.forEach((recipe, index) => {
      recipesHTML += `
        <div class="recipe-card" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #333;">${recipe.name || 'Recipe ' + (index + 1)}</h3>
          <div style="margin: 10px 0;">
            <strong>Ingredients:</strong>
            <ul style="margin: 5px 0;">
              ${(recipe.ingredients || []).map(ing => `<li>${ing}</li>`).join('')}
            </ul>
          </div>
          <div style="margin: 10px 0;">
            <strong>Steps:</strong>
            <ol style="margin: 5px 0;">
              ${(recipe.steps || []).map(step => `<li>${step}</li>`).join('')}
            </ol>
          </div>
        </div>
      `;
    });
    recipesContainer.innerHTML = recipesHTML;
  }
}

//=======================NOTIFY ITEM RUNNING LOW=======================//
//select notifications link
const notifications = document.querySelector('.notify')
const notificationPanel = document.getElementById('notificationPanel')
const notificationOverlay = document.getElementById('notificationOverlay')
const notificationContent = document.getElementById('notificationContent')
const closeNotificationPanel = document.getElementById('close-notification-panel')

// Function to open notification panel
function openNotificationPanel() {
  notificationPanel.classList.add('active')
  notificationOverlay.classList.add('active')
  document.body.style.overflow = 'hidden' // Prevent background scrolling
}

// Function to close notification panel
function closeNotificationPanelFunc() {
  notificationPanel.classList.remove('active')
  notificationOverlay.classList.remove('active')
  document.body.style.overflow = '' // Restore scrolling
}

// Function to display items in the panel
function displayNotificationItems(itemsRunningLow) {
  if (!itemsRunningLow || itemsRunningLow.length === 0) {
    notificationContent.className = 'notification-panel-content empty'
    notificationContent.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <p>No items are running low! 🎉</p>
    `
    return
  }

  notificationContent.className = 'notification-panel-content'
  notificationContent.innerHTML = itemsRunningLow.map(item => {
    const weeksLeft = Math.ceil((Number(item.weeksLasting) - ((new Date() - new Date(item.createdAt)) / (1000 * 60 * 60 * 24 * 7))))
    return `
      <div class="notification-item">
        <div class="notification-item-name">${item.item}</div>
        <div class="notification-item-details">
          <span><i class="fas fa-hashtag"></i> Quantity: ${item.quantity}</span>
          <span><i class="fas fa-calendar-week"></i> ${weeksLeft} week${weeksLeft !== 1 ? 's' : ''} left</span>
        </div>
      </div>
    `
  }).join('')
}

// Event listeners
if(notifications) {
  notifications.addEventListener('click', async(e) =>{
    e.preventDefault()
    openNotificationPanel()
    
    // Show loading state
    notificationContent.className = 'notification-panel-content empty'
    notificationContent.innerHTML = `
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading notifications...</p>
    `
    
    try{
      const res = await fetch('/api/getItemsRunningLow',{
        method:'GET',
        headers: { "Content-Type": "application/json" }
      })
      if(!res.ok) throw new Error('Did not get low running items.')
      const itemsRunningLow = await res.json()
      displayNotificationItems(itemsRunningLow)
      
    }catch(err){
      console.error('Request to /api/getItemsRunningLow failed.', err)
      notificationContent.className = 'notification-panel-content empty'
      notificationContent.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <p>Failed to load notifications.<br>Please try again.</p>
      `
    }
  })
}

// Close panel when clicking close button
if(closeNotificationPanel) {
  closeNotificationPanel.addEventListener('click', closeNotificationPanelFunc)
}

// Close panel when clicking overlay
if(notificationOverlay) {
  notificationOverlay.addEventListener('click', closeNotificationPanelFunc)
}

// Close panel with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && notificationPanel.classList.contains('active')) {
    closeNotificationPanelFunc()
  }
})

//=====================MOVE TO FINISHED ======================//
const moveToFinishedBtn = document.querySelector('.move-to-finished')
if(moveToFinishedBtn) {
  moveToFinishedBtn.addEventListener('click', async(e) =>{
    const selectedCb = Array.from(document.querySelectorAll('.item-checkbox:checked'))
    
    const selectedItemIds = selectedCb.map(e => {
      return e.dataset.id
    })

    if (selectedItemIds.length === 0) {
      alert('No items selected.')
      return
    }

    try{
      const res = await fetch('/api/moveToFinished', {
        method:'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials:'same-origin',
        body: JSON.stringify({selectedItemIds})
      })
      if (!res.ok) throw new Error('Move to finished failed.')
      
      selectedCb.forEach(cb => {
        cb.closest('li').remove()
      })
      window.location.reload()
    }catch(err){
      console.error(err)
      alert('Failed to move items to finished.')
    }
  })
}

//=====================MOVE TO GROCERY LIST ======================//
const moveToGroceryBtn = document.querySelector('.move-to-grocery')
if(moveToGroceryBtn) {
  moveToGroceryBtn.addEventListener('click', async(e) =>{
    const selectedCb = Array.from(document.querySelectorAll('.item-checkbox:checked'))
    
    const selectedItemIds = selectedCb.map(e => {
      return e.dataset.id
    })

    if (selectedItemIds.length === 0) {
      alert('No items selected.')
      return
    }

    try{
      const res = await fetch('/api/moveToGrocery', {
        method:'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials:'same-origin',
        body: JSON.stringify({selectedItemIds})
      })
      if (!res.ok) throw new Error('Move to grocery list failed.')
      
      selectedCb.forEach(cb => {
        cb.closest('li').remove()
      })
      window.location.reload()
    }catch(err){
      console.error(err)
      alert('Failed to move items to grocery list.')
    }
  })
}
 
//=============================== LOGOUT ================================//

document.querySelector('.logout')?.addEventListener("click", async () => {
  await fetch("/logout", {
    method: "POST",
    credentials: "same-origin",
  });

  window.location.href = "/login";
});

//============================= GENERATE CODE ============================//


function generateFamilyCode(length = 6){
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for(let i=0; i < 6; i++){
   result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}


