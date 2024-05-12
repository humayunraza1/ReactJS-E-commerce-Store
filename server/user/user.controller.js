const { skipMiddlewareFunction } = require("mongoose");
const { User, Item, Cart,Order } = require("../models/user.model");
const jwt = require("jsonwebtoken");

const displayUserDetails = async (req, res) => {
  const { userID } = req.user;
  const user = await User.findOne({ userID });
  console.log(userID);
  return res.status(201).send({ message: "Loaded details", user: user });
};

// Function to update cart in user's authentication token
function updateCartInAuthToken(token, cartData) {
  // Decode the token
  const decodedToken = jwt.decode(token);

  // Update the cart data in the decoded token payload
  decodedToken.cart = cartData;
  console.log("cart gotten from token: ", decodedToken.cart);
  // Sign the updated payload to generate a new token
  const updatedToken = jwt.sign(decodedToken, process.env.JWT_SECRET); // Assuming 1 hour expiry

  return updatedToken;
}

async function addItemToCart(req, res) {
  try {
    const { userID } = req.user;
    const authToken = req.cookies.authToken;
    const { itemID, quantity, sku } = req.body;

    if (!itemID || !quantity || !sku) {
      return res.status(400).send("Item ID, quantity, and SKU are required");
    }

    let cart = await Cart.findOne({ userID });
    if (!cart) {
      if(!authToken){
        cart = new Cart({ userID, items: [] });
      }else{
        decoded = jwt.decode(authToken)
        cartData= decoded.cart;
        cart = new Cart({userID, items:cartData})
        await cart.save();
      }
    }

    let item = await Item.findOne({ itemID });
    if (!item || !item.variants || !Array.isArray(item.variants)) {
      return res.status(500).send("Invalid item or variants");
    }

    const matchingVariant = item.variants.find(variant => variant.SKU === sku);
    if (!matchingVariant) {
      return res.status(500).send("Invalid variant selected");
    }
    let message = '';
    const existingItemIndex = cart.items.findIndex(item => item.SKU === sku);
    if(matchingVariant.isOOS){
      if (existingItemIndex !== -1){
        return res.status(500).send("Item or variant is out of stock. Please remove it from cart.")  
      }
      return res.status(500).send("Item or variant is out of stock.")
    }
    
    if (existingItemIndex !== -1) {
      if ((cart.items[existingItemIndex].qty + quantity) <= matchingVariant.stock) {
        cart.items[existingItemIndex].qty += quantity;
        if (quantity < 0) {
          message = `${quantity} reduced`;
        } else {
          message = `${quantity} added`;
        }
        if (cart.items[existingItemIndex].qty <= 0) {
          message = `${matchingVariant.Variant} ${item.itemName} removed from cart`;
          cart.items.splice(existingItemIndex, 1);
        } else {
          cart.items[existingItemIndex].cost = matchingVariant.price * cart.items[existingItemIndex].qty;
        }
      } else {
        return res.status(500).send("Cannot add more of this item");
      }
    } else {
      if (quantity > 0 && quantity <= matchingVariant.stock) {
        message = `${quantity}x ${matchingVariant.Variant} ${item.itemName} added `;
        cart.items.push({
          itemID,
          qty: quantity,
          cost: matchingVariant.price,
          variant: matchingVariant.Variant,
          SKU: sku,
          thumbnail: matchingVariant.thumbnail
        });
      } else {
        return res.status(500).send("Invalid quantity selected or not enough stock");
      }
    }

    await cart.save();

    const updatedToken = updateCartInAuthToken(req.headers.authorization, cart.items);
    res.cookie("authToken", updatedToken, { httpOnly: true, maxAge: 3600000 }); // 1 hour expiry

    return res.status(201).send({ message: message, item: cart.items });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return res.status(500).send("An error occurred while adding item to cart");
  }
}



async function placeOrder(req, res) {
  try {
    const { userID } = req.user;
    const user = await User.findOne({userID});
    let cart = await Cart.findOne({ userID });
    const authToken = req.cookies?.authToken;
    let decoded;
    
    // Fetch cart data from database or decoded token
    let cartData;
    if (!cart) {
      if (!authToken) {
        return res.status(500).send("Cart is empty");
      } else {
        decoded = jwt.decode(authToken);
        cartData = decoded.cart;
        cart = new Cart({ userID, items: cartData });
        await cart.save();
      }
    } else {
      // Cart exists in the database, populate cartData from the cart
      cartData = cart.items;
    }

    // Fetch item details for all items in the cart
    const itemIDs = cartData.map(item => item.itemID);
    const items = await Item.find({ itemID: { $in: itemIDs } });

    let totalAmount = 0;
    const finalItems = [];
    const updateOperations = [];

    // Process each item in the cart
    for (const item of cartData) {
      const matchingItem = items.find(i => i.itemID === item.itemID);
      if (matchingItem) {
        const matchingVariant = matchingItem.variants.find(v => v.SKU === item.SKU);
        if (matchingVariant && !matchingVariant.isOOS && matchingVariant.stock >= item.qty) {
          totalAmount += item.cost;
          finalItems.push({
            Brand: matchingItem.brand,
            Name: matchingItem.itemName,
            Variant: item.variant,
            SKU:item.SKU,
            Quantity: item.qty,
            Cost: item.cost,
          });
          // Update stock and isOOS status for the variant
          if (matchingVariant.stock - item.qty === 0) {
            matchingVariant.stock -= item.qty;
            matchingVariant.isOOS = true;
            updateOperations.push(matchingItem.save());
          } else {
            matchingVariant.stock -= item.qty;
          }
        } else if(matchingVariant.isOOS){
          return res.status(500).send("Item is now out of stock. Please remove it from your cart to proceed.")
        } else {
          return res.status(203).send({
            message: `${matchingItem.itemName} invalid quantity entered, try lowering the quantity.`
          });
        }
      } else {
        return res.status(203).send({
          message: `Item with ID ${item.itemID} not found in the database.`
        });
      }
    }

    // Execute all update operations
    await Promise.all(updateOperations);

    // Create and save the order
    const currentDate = new Date();
    const formattedDate = formatDate(currentDate);
    const customer={
      name:user.name,
      address:user.address,
      number:user.number,
      email:user.email
    }
    console.log(customer);
    const order = new Order({ userID, customerInfo:customer, cart: finalItems, createdAt: formattedDate, totalAmount });
    await order.save();
    // Delete cart and clear authToken cookie
    await Cart.deleteOne({ userID });
    res.clearCookie('authToken');

    return res.status(201).send({ message: "Order placed", order });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "An error occurred while placing the order." });
  }
}

async function getOrderHistory(req,res){
  try{
    const {userID} = req.user;
    const orders = await Order.find({userID})
    if(!orders){
      res.status(500).send('No Order To Show.')
    }
    return res.status(201).send({message:`${orders.length} orders found`, orderHistory: orders})
  }catch(err){
    return res.status(500).send({message:"unknown error occurred.", error:err});
  }
}
// Function to handle expired database entries
async function handleExpiredDatabaseEntries() {
  try {
    console.log("Looking for expired carts in the database.");

    // Find all carts in the database
    const carts = await Cart.find();

    // Check if there are no carts
    if (carts.length === 0) {
      console.log("Carts are empty.");
      return;
    }

    // Calculate the minimum expiration time required (2 minutes ago)
    const minExpirationTime = Date.now() - 2 * 60 * 1000;

    // Iterate over each cart and check if it has expired
    for (const cart of carts) {
      // If expiration time is at least 2 minutes ago, delete the entry
      if (cart.expiresAfter <= minExpirationTime) {
        console.log("cart deleted: ", cart);
        await Cart.deleteOne({ _id: cart._id });
      }
    }

    console.log("Expired database entries handled.");
  } catch (error) {
    console.error("Error handling expired database entries:", error);
  }
}


async function cancelOrder(req,res){
  try{

    const {userID} = req.user;
    const {orderID} = req.body;
    const order = await Order.findOne({orderID})
      console.log(order)
    if(!order){
      return res.status(500).send(`Invalid Order ID provided. If issue persists, relog.`)
    }else{
      if(userID !== order.userID){
      return res.status(500).send("Unauthorized action triggered");
    }
  }
   if(order.status === 'Cancelled'){
    return res.status(500).send("Order is already cancelled");
  }
  if(order.status !== 'Pending'){
    return res.status(500).send("You can only cancel order if its status is still pending.")
  }else{
    for(const item of order.cart){
      sku = item.SKU;
      console.log(sku);
      i = await Item.findOne({ "variants.SKU": sku });
      const filteredVarIndex = i.variants.findIndex(item => {
        return item.SKU == sku;
      });
      if(!filteredVarIndex){
        return res.status(500).send("Invalid variant selected.")
      }
      if(i.variants[filteredVarIndex].isOOS){
        i.variants[filteredVarIndex].stock += item.Quantity;
        i.variants[filteredVarIndex].isOOS = false;
        await i.save();
      }else{
        i.variants[filteredVarIndex].stock += item.Quantity;
        await i.save();
      }
    }
    order.status = "Cancelled";
    await order.save();
    return res.status(201).send("Order cancelled");
  }
}catch(err){
  console.log(err)
  return res.status(500).send({message:'Unknown error occurred',error:err});
}
}

// Schedule the function to run every 5 minutes
const interval = setInterval(handleExpiredDatabaseEntries, 0.5 * 60 * 1000); // Runs every 5 minutes


function formatDate(date) {
  // Get individual date components
  const day = date.getDate();
  const month = date.getMonth() + 1; // Month is zero-based
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  
  // Convert hours to 12-hour format
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours %= 12;
  hours = hours || 12; // Make 0 hours to 12
  
  // Pad single digit day, month, hours, minutes, and seconds with leading zeros
  const formattedDay = String(day).padStart(2, '0');
  const formattedMonth = String(month).padStart(2, '0');
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  
  // Construct the formatted date string
  const formattedDate = `${formattedDay}/${formattedMonth}/${year} ${formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;
  
  return formattedDate;
}

// Optionally, you can clear the interval when your application exits
// This prevents the function from continuing to run after the application is stopped
process.on("exit", () => {
  clearInterval(interval);
});

module.exports = { displayUserDetails, addItemToCart, placeOrder,getOrderHistory,cancelOrder };
