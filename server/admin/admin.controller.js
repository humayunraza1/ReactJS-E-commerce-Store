const {User,Item,Order,Category} = require('../models/user.model');
const { v4: uuidv4 } = require('uuid');
const { S3 } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = new S3({ region: 'ap-southeast-1'});

function generateShortUUID() {
    // Generate UUID
    const fullUUID = uuidv4();

    // Truncate UUID to 5 characters
    const shortUUID = fullUUID.substr(0, 5);

    return shortUUID;
}

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'elasticbeanstalk-ap-southeast-1-651706742954',
    acl: 'public-read', // Optional: adjust access as needed
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      // Define the file name to be saved in S3
      const fileName = `thumbnails/${Date.now().toString()}-${file.originalname}`;
      cb(null, fileName);
    },
  }),
}).single('file'); // Specify that you're uploading a single file with the field name 'file'


// The function to handle the request and response
const uploadFileToS3 = (req, res) => {
  // Handle the file upload using multer
  upload(req, res, function (err) {
    if (err) {
      console.error('Error uploading file:', err);
      return res.status(500).json({ error: 'Error uploading file' });
    }

    // Check if file is uploaded
    if (req.file) {
      // If file upload is successful, return the file URL from S3
      res.json({
        message: 'File uploaded successfully',
        fileUrl: req.file.location, // The URL of the file in S3
      });
    } else {
      res.status(400).json({ error: 'No file uploaded' });
    }
  });
};


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
    const updatedOrders = await Order.find();
    return res.status(200).send({msg: `Order status updated.`,orders:updatedOrders})
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

  async function uploadImage(req,res){
    const {userID} = req.user;

  }

  const updateItem = async (req, res) => {
    try {
      const { userID } = req.user;
      const user = await User.findOne({ userID });
  
      // Check if the user has the 'Admin' role
      if (user.role === 'User') {
        return res.status(401).send({ message: "Unauthorized. Redirecting to user dashboard.", url: "/user/dashboard" });
      }
  
      const { itemID, itemName, description, specifications, url, brand, thumbnail, variants, type, category } = req.body;
  
      // Check if the item to be updated exists
      const existingItem = await Item.findOne({ itemID });
      if (!existingItem) {
        return res.status(404).send({ message: "Item not found." });
      }
  
      // Check if the product with the same name already exists, excluding the current item
      const duplicateItem = await Item.findOne({ itemName, itemID: { $ne: existingItem.itemID } });
      if (duplicateItem) {
        return res.status(400).send({ message: "Product with this name already exists." });
      }
  
      // Check if the URL is unique, excluding the current item
      const existingURL = await Item.findOne({ url, itemID: { $ne: existingItem.itemID } });
      if (existingURL) {
        return res.status(400).send({ message: "URL already exists." });
      }
  
      // Validate the URL format: only alphanumeric characters and hyphens allowed
      const urlRegex = /^[a-zA-Z0-9-]+$/;
      if (!urlRegex.test(url)) {
        return res.status(400).send({ message: "URL can only contain alphanumeric characters and hyphens." });
      }
  
      // Process the variants to ensure they are unique
      const variantNames = new Set();
      const finalVariants = [];
  
      for (const item of variants) {
        if (variantNames.has(item.Variant)) {
          return res.status(400).send({ message: `Variant "${item.Variant}" must be unique.` });
        }
        variantNames.add(item.Variant);
  
        finalVariants.push({ 
          Variant: item.Variant, 
          thumbnail: item.thumbnail,
          SKU:item.SKU,
          isAvailable: item.isAvailable, 
          stock: parseInt(item.stock), 
          price: parseFloat(item.price) 
        });
      }
  
      // Update the item in the database
      existingItem.itemName = itemName;
      existingItem.itemDescription = description;
      existingItem.itemSpecifications = specifications;
      existingItem.url = url;  // Pass the validated URL
      existingItem.thumbnail = thumbnail;
      existingItem.brand = brand;
      existingItem.type = type;
      existingItem.variants = finalVariants;
      existingItem.category = category;
  
      await existingItem.save();
  
      return res.status(200).send({ message: "Item updated successfully", item: existingItem });
  
    } catch (error) {
      return res.status(500).send({ message: "Unknown error occurred", error: error });
    }
  };
  


module.exports = {adminDashboard,addItem,getOrders,updateStatus,updateItem,handleDispute,editCategories,uploadFileToS3};