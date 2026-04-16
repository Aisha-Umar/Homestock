const Grocery = require("../models/item.js")
const User = require("../models/user.js")
const Pantry = require("../models/pantry.js")
const { request } = require("express")

// Emoji mapping for grocery items
const groceryEmojiMap = {
  milk: "🥛",
  eggs: "🥚",
  cheese: "🧀",
  bread: "🍞",
  rice: "🍚",
  pasta: "🍝",
  apples: "🍎",
  bananas: "🍌",
  tomatoes: "🍅",
  onions: "🧅",
  chicken: "🍗",
  fish: "🐟",
  cereal: "🥣",
  "peanut butter": "🥜",
  "cooking oil": "🫒",
  "ice cream": "🍨",
  pizza: "🍕",
  "toilet paper": "🧻",
  "dish soap": "🧼",
  "whole milk": "🥛",
  garlic: "🧄",
  ginger: "🫚",
  beef: "🥩"
}

// Helper function to get emoji for an item
function getEmojiForItem(itemName) {
  return groceryEmojiMap[itemName.toLowerCase()] || "🛒"
}

//Get landing page
exports.getLanding = async(req, res) => {
  try{
    await res.render('landing')
  } catch(err){
    res.status(500).json({ message: err.message})
  }
}

// Get all items
exports.getDashboard = async (req, res) => {
  try {
  const storedItems = await Grocery.find().sort({ order: 1 }); // ascending order
  await res.render('dashboard', {storedItems})
} catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get pantry page
exports.getPantry = async (req, res) => {
  try {
  const pantryItems = await Pantry.find({ user: req.user.id, status: 'active' }).sort({ createdAt: -1 }); // descending order
  await res.render('pantry', {pantryItems})
} catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get finished items page
exports.getFinished = async (req, res) => {
  try {
  const finishedItems = await Pantry.find({ user: req.user.id, status: 'finished' }).sort({ finishedAt: -1 }); // descending order
  await res.render('finished', {finishedItems})
} catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add a new item
exports.saveItem = async (req, res) => {
const userId = req.user.id
   console.log(userId)
const { item,quantity,store,weeksLasting } = req.body;

  try {
    const emoji = getEmojiForItem(item);
    let savedItem = await Grocery.create({ user:userId, item:item, emoji:emoji, quantity:quantity,store:store,weeksLasting:weeksLasting});
    res.json(savedItem)
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Edit an item
exports.editItem = async (req, res) => {
  try {

    const { editedItem, quantity, itemId } = req.body;

    const updatedItem = await Grocery.findOneAndUpdate(
      { _id: itemId, user: req.user.id }, // ✅ ownership check
      { item:editedItem, quantity:quantity },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ message: 'Failed to edit item' });
  }
};


// Delete an item
exports.deleteItem = async (req, res) => {
  const userId = req.user.id
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'No items selected' });
  }
  await Grocery.deleteMany({ _id: { $in: ids }, user: userId                                                                                                                  });
  res.json({ success: true });
}

// Save order of items
exports.saveOrder = async (req, res) => {
  try{
    const {orderedList} = req.body
    // console.log("Received orderedList:", orderedList)
    for(const{id, order} of orderedList){
      // console.log("Looping:", id, order)
     const result = await Grocery.updateOne({_id:id},{order})
      // console.log(`Updating ${id} → order ${order}:`, result)
    }
      const storedItems = await Grocery.find().sort({order:1})
      // console.log(`This is the order after sorting by order ${storedItems}`)
     // res.status(200).json({ message: "Order updated"})
      res.render('dashboard', {storedItems})
  } catch(err){
    res.status(500).json({ message: err.message})
  }
}

exports.getPantryItems = async (req, res) =>{
  try{
  const allItems = await Pantry.find({user:req.user.id})
  res.json({pantryItems:allItems})
}catch(err){
  res.status(500).json({message: err.message})
}
}

exports.moveToPantry = async (req, res) => {
  try {
    const { selectedItemIds } = req.body;

    if (!selectedItemIds || !selectedItemIds.length) {
      return res.status(400).json({ message: "No items selected" });
    }

    const items = await Grocery.find({ _id: { $in: selectedItemIds } });

    if (!items.length) {
      return res.status(404).json({ message: "No items found" });
    }

    const addedPantryItems = await Pantry.insertMany(
      items.map((item) => ({
        item: item.item,
        emoji: item.emoji,
        quantity: item.quantity,
        weeksLasting:item.weeksLasting,
        user: item.user,
        store: item.store,
        status: 'active'
      }))
    );

    const itemIds = items.map((item) => item._id);
    await Grocery.deleteMany({ _id: { $in: itemIds } });

    res.status(200).json({ movedItems: addedPantryItems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Move items from pantry to finished
exports.moveToFinished = async (req, res) => {
  try {
    const { selectedItemIds } = req.body;
    const userId = req.user.id;

    if (!selectedItemIds || !selectedItemIds.length) {
      return res.status(400).json({ message: "No items selected" });
    }

    const updatedItems = await Pantry.updateMany(
      { _id: { $in: selectedItemIds }, user: userId, status: 'active' },
      { status: 'finished', finishedAt: new Date() }
    );

    if (updatedItems.modifiedCount === 0) {
      return res.status(404).json({ message: "No items updated" });
    }

    res.status(200).json({ movedItems: updatedItems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Move items from finished back to grocery list
exports.moveToGrocery = async (req, res) => {
  try {
    const { selectedItemIds } = req.body;
    const userId = req.user.id;

    if (!selectedItemIds || !selectedItemIds.length) {
      return res.status(400).json({ message: "No items selected" });
    }

    const items = await Pantry.find({ _id: { $in: selectedItemIds }, user: userId, status: 'finished' });

    if (!items.length) {
      return res.status(404).json({ message: "No items found" });
    }

    const addedGroceryItems = await Grocery.insertMany(
      items.map((item) => ({
        item: item.item,
        emoji: item.emoji,
        quantity: item.quantity,
        weeksLasting: item.weeksLasting,
        user: item.user,
        store: item.store
      }))
    );

    await Pantry.deleteMany({ _id: { $in: selectedItemIds }, user: userId });

    res.status(200).json({ movedItems: addedGroceryItems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//============GET AI RECIPE SUGGESTIONS =====================

exports.getAiRecipes = async (req, res) => {
  try {
    const pantryItems = await Pantry.find({ user: req.user.id });
    const items = pantryItems.map(item => item.item);

    if (!items.length) {
      return res.json({ recipes: [] });
    }

    const prompt = `
I have: ${items.join(", ")}.
Suggest 2 recipes using these items.
IMPORTANT: Return ONLY a raw JSON array.
No conversational text. No markdown.
Each recipe step MUST be under 10 words.
Format: [{"name":"string","ingredients":[],"steps":[]}]
`;

    const fetchFn =
      globalThis.fetch ??
      (await import("node-fetch")).then(m => m.default);

    const response = await fetchFn("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "phi3",
        prompt,
        stream: false,
        format: "json",
        options: {
          num_predict: 1000,
          temperature: 0.2,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama returned ${response.status}`);
    }

    const json = await response.json();
    const text = json.response?.trim();

    // console.log("Full Ollama response:", json);
    // console.log("Extracted text:", text);

    if (!text) {
      return res.json({ recipes: null });
    }

    try {
      const cleaned = text.replace(/```json|```/g, "").trim();
      const recipes = JSON.parse(cleaned);
      return res.json({ recipes });
    } catch (parseErr) {
      console.error("JSON parse failed:", parseErr.message);
      return res.json({ recipes: null, raw: text });
    }

  } catch (err) {
    console.error("getAiRecipes error:", err);
    res.status(500).json({
      error: "Failed to get recipes",
      details: err.message,
    });
  }
};

  

//=====================GET LOW RUNNING ITEMS ===================//
exports.getItemsRunningLow = async (req, res) => {
  //get pantry items
  try {
    const pantryItems = await Pantry.find({ user: req.user.id });
    console.log(`Total pantry items: ${pantryItems.length}`);
    
    //loop over the pantry items to filter items running low
    const itemsRunningLow = pantryItems.filter((item) => {
      // Check if weeksLasting exists and is a valid number
      if (!item.weeksLasting || isNaN(item.weeksLasting)) {
        console.log(`Item ${item.item} skipped - weeksLasting: ${item.weeksLasting}`);
        return false; // Skip items without weeksLasting
      }
      
      const currentDate = new Date();
      const createdAtDate = item.createdAt;
      const diff = currentDate - createdAtDate;
      const diffDays = diff / (1000 * 60 * 60 * 24);
      const diffWeeks = diffDays / 7;
      
      // Convert weeksLasting to number in case it's stored as string
      const weeksLasting = Number(item.weeksLasting);
      const weeksLeft = weeksLasting - diffWeeks;
      const roundedWeeksLeft = Math.ceil(weeksLeft);
      
      console.log(`Item: ${item.item}, weeksLasting: ${weeksLasting}, weeksElapsed: ${diffWeeks.toFixed(2)}, weeksLeft: ${weeksLeft.toFixed(2)}, rounded: ${roundedWeeksLeft}`);
      
      // Return true if 2 weeks or less remaining
      return roundedWeeksLeft <= 2;
    });
    
    console.log(`Items running low: ${itemsRunningLow.length}`);
    res.json(itemsRunningLow);
  } catch (err) {
    console.error("getLowRunningItems error:", err);
    res.status(500).json({
      error: "Failed to get items.",
      details: err.message,
    });
  }
};