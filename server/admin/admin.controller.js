const {User,Item,Order,Category} = require('../models/user.model');
const { v4: uuidv4 } = require('uuid');

function generateShortUUID() {
    // Generate UUID
    const fullUUID = uuidv4();

    // Truncate UUID to 5 characters
    const shortUUID = fullUUID.substr(0, 5);

    return shortUUID;
}

const adminDashboard = async (req, res) => {
    const { userID } = req.user;
    const user = await User.findOne({ userID });
    console.log(userID)
    return res.status(201).send({message:"Loaded details", user:user});
}

async function getOrders(req,res){
    const {userID} = req.user;
    const user = await User.findOne({userID});
    if(user.role !== "Admin"){
        return res.status(401).send("Unauthorized");
    }
    const orders = await Order.find();
    console.log(orders)
    if(orders.length == 0){
        return res.status(200).send({message:"No orders found", orders:[]})
    }
    return res.status(200).send({message: `found ${orders.length}`, orders})
}

async function editCategories(req,res){
    const {Name,types} = req.body;
    const category = new Category({Name:Name, type:types})
    category.save();
    return res.status(200).send('Category Added');
 }

async function handleDispute(req,res){
    const {userID} = req.user;
    const user = await User.findOne({userID});
    const {orderID} = req.body;
    const order = await Order.findOne({orderID})
    if(user.role !== "Admin"){
        return res.status(500).send("Unauthorized");
    }

    if(!order.isDisputed){
        return res.status(200).send("Order not disputed");
    }

    if(order.disputeStatus == 'Closed'){
        return res.status(200).send("Dispute already closed");
    }

    order.disputeStatus = 'Closed';
    await order.save();

    return res.status(200).send(`Order ${orderID}'s dispute closed`);
}

async function updateStatus(req,res){
    const {userID} = req.user;
    const user = await User.findOne({userID});
    if(user.role !== 'Admin'){
        return res.status(500).send("Unauthorized.")
    }
    const {orderID,updateStatus} = req.body;
    const order = await Order.findOne({orderID});
    if(!order){
        return res.status(500).send("Invalid order id passed. Kindly select the right order")
    }
    order.status = updateStatus;
    await order.save()
    return res.status(200).send({order: `Order ${orderID} status updated to ${order.status}`})
}



const addItem = async (req, res) => {
    try {
      const { userID } = req.user;
      const user = await User.findOne({ userID });
  
      // Check if the user has the 'Admin' role
      if (user.role === 'User') {
        return res.status(401).send({ message: "Unauthorized. Redirecting to user dashboard.", url: "/user/dashboard" });
      }
  
      const { itemName, description, specifications, url, brand, thumbnail, variants, type, category } = req.body;
      console.log(specifications);
      // Check if the product with the same name already exists
      const existingItem = await Item.findOne({ itemName });
      if (existingItem) {
        return res.status(400).send({ message: "Product with this name already exists." });
      }
  
      // Check if the URL is unique
      const existingURL = await Item.findOne({ url });
      if (existingURL) {
        return res.status(400).send({ message: "URL already exists." });
      }
  
      // Validate the URL format: only alphanumeric characters and hyphens allowed
      const urlRegex = /^[a-zA-Z0-9-]+$/;
      if (!urlRegex.test(url)) {
        return res.status(400).send({ message: "URL can only contain alphanumeric characters and hyphens." });
      }
  
      // Process the variants
      let finalVariants = [];
      for (const item of variants) {
        // Convert price and stock from string to number
        const price = parseFloat(item.price);
        const stock = parseInt(item.stock);
  
        // Generate SKU
        const sku = 'SKU-' + generateShortUUID() + `${userID}-` + item.Variant;
        finalVariants.push({ 
          Variant: item.Variant, 
          thumbnail: item.thumbnail,
          SKU: sku, 
          isAvailable: item.isAvailable, 
          stock, 
          price 
        });
      }
  
      // Create and save the new item
      const item = new Item({
        itemName,
        itemDescription: description,
        itemSpecifications:specifications,
        url,  // Pass the validated URL
        thumbnail,
        brand,
        type,
        variants: finalVariants,
        category
      });
  
      await item.save();
  
      return res.status(201).send({ message: "Item added successfully", item: item.itemID });
  
    } catch (error) {
      return res.status(500).send({ message: "Unknown error occurred", error: error });
    }
  };
  


async function addVariant(req, res) {
    try {
        const { userID } = req.user;
        const { itemID, newVariant } = req.body;

        // Fetch user and item from the database
        const user = await User.findOne({ userID });
        const item = await Item.findOne({ itemID });

        // Check if the user has permission to add variants
        if (user.role === 'User') {
            return res.status(401).send({ message: "Unauthorized. Redirecting to user dashboard.", url: "/user/dashboard" });
        }

        // Check if the item exists
        if (!item) {
            return res.status(404).send({ message: "Item not found." });
        }

        // Check if the variant name is unique within the item's variants
        const variantNameExists = item.variants.some(variant => variant.Variant === newVariant.Variant);
        if (variantNameExists) {
            return res.status(400).send({ message: `Variant name "${newVariant.Variant}" already exists in the item.` });
        }

        // Set of existing SKUs for quick lookup
        const existingSKUs = new Set(item.variants.map(variant => variant.SKU));

        // Generate a unique SKU using your custom format
        const newSKU = await generateUniqueSKU(userID, itemID, existingSKUs);

        // Set the generated SKU to the new variant
        newVariant.SKU = newSKU;
        console.log(newVariant);
        // Add the new variant to the item's variants array
        item.variants.push(newVariant);

        // Save the updated item
        await item.save();

        res.status(200).send({ message: "Variant added successfully.", item });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "An error occurred while adding the variant.", error: error.message });
    }
}


module.exports = {adminDashboard,addVariant,addItem,getOrders,updateStatus,handleDispute,editCategories};