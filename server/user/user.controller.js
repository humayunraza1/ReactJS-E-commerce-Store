const { User, Item, Cart,Order,wishList} = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

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

// 

async function getWishlist(req,res){
  const {userID} = req.user;
  const wlist = await wishList.findOne({userID});
  
  console.log(wlist);
  if(!wlist){
    return res.status(200).send({msg:'Wishlist is empty', items:[]})
  }

  return res.status(200).send({wishlist:wlist})

}


async function addWishlist(req,res){
  const {userID} = req.user;
  const {itemID, SKU} = req.body;
  const item = await Item.findOne({itemID});
  const matchingVariant = item.variants.find(variant => variant.SKU === SKU);
  let wishlist = await wishList.findOne({userID})
  let items = []
  if(!wishlist){
    wishlist = new wishList({userID, items:[]})
  }else{
    items = wishlist.items;
    let matchingIndex = items.findIndex(item => (item.itemID == itemID) && (item.SKU == SKU));
    if(matchingIndex > -1){
      let i = items[matchingIndex];
      items.splice(matchingIndex,1)
      wishlist.items = items;
      if(wishlist.items.length == 0){
        await wishList.deleteOne({userID});
        return res.status(200).send(`${i.variant} - ${i.itemName} removed. Wishlist is now empty. `)
      }
      await wishlist.save();
      return res.status(200).send({message:`${i.variant} - ${i.itemName} removed from wishlist`,wl:wishlist.items})
    }
  }
  const itemInfo = {
    itemID: item.itemID,
    itemName: item.itemName,
    thumbnail:matchingVariant.thumbnail,
    SKU: SKU,
    variant:  matchingVariant.Variant,
    price:  matchingVariant.price,
    isOOS:  matchingVariant.isOOS 
  }
  items.push(itemInfo);
  wishlist.items = items;
  await wishlist.save()
  return res.status(200).send({message:`${itemInfo.variant} - ${itemInfo.itemName} added to wishlist`, wl:wishlist.items})
} 


async function openDispute(req,res){
  const {userID} = req.user;
  const {orderID,reason, description} = req.body;

  const order = await Order.findOne({orderID});
  if(!order){
    return res.status(500).send("Invalid Order ID");
  }

  if (order.userID !== userID){
    return res.status(500).send("You cannot open dispute for this order");
  }
  
  if(order.isDisputed){
    return res.status(500).send("Order already disputed, kindly wait.")
  }

  if(!description || description.length < 5){
    return res.status(500).send("description too short. Please write minimum 5 words")
  }

  const currentDate = new Date();

  order.isDisputed = true;
  order.disputeStatus = 'Open'
  order.disputeCreatedAt = formatDate(currentDate);
  order.disputeReason = reason;
  order.disputeDescription = description;

  await order.save();

  return res.status(200).send(`Dispute created for order id: ${orderID}`)
}

// Update Profile Settings

async function updateProfile(req,res){
  const {userID} = req.user;
  const user = await User.findOne({userID});
  if(!user){
    return res.status(500).send("Invalid request passed, kindly relog.")
  }
  const {address,newPassword,updateAddress,confirmPassword,oldPassword,email} = req.body;
  
  if(updateAddress){
    user.address = updateAddress
    await user.save()
    return res.status(200).send("Address successfuly updated.")
  }
  
  if(address){
    if(user.address.length == 3){
      return res.status(500).send('Cannot add more addresses')
    }
    user.address.push(address);
    if (address.isDefault) {
      user.address.forEach((addr, index) => {
        if (addr.isDefault && addr.address !== address.address) {
          user.address[index].isDefault = false;
        }
      });
    }
    await user.save();
    return res.status(200).send("Address successfully updated");
  }
  if(newPassword && confirmPassword && oldPassword){
    if(newPassword.length<5){
      return res.status(500).send('Password should at least be 5 characters long.')
    }
    if(await bcrypt.compare(oldPassword, user.password)){
      if(await bcrypt.compare(newPassword, user.password)){
        return res.status(500).send("Password cannot be same as the old password.")
      }else{
        if(newPassword !== confirmPassword){
          return res.status(500).send("New password dont match");
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        user.password = hashedPassword;
        await user.save()
        return res.status(200).send("Password successfuly updated")
      }
      
    }else{
      return res.status(500).send('Invalid Old Password Entered')
    }
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if(email){
    if(!emailRegex.test(email)){
        return res.status(400).send("Invalid email format");
    }
    
    const checkUser = await User.findOne({email});
    if(checkUser){
      return res.status(200).send("Email already in use");
    } else {
      user.email = email;
      await user.save();
      return res.status(200).send("Email successfully updated");
    }
}

  return res.status(500).send("Invalid data passed")
}

// 

async function getCart(req,res){
  const {userID} = req.user;
  if(!userID){
    return res.status(500).send({message:"Please login.",cart:[]});
  }
  const cart = await Cart.findOne({userID});
  if(!cart ){
    return res.status(200).send({message:"cart is empty", cart:[]});
  }else{
    const updatedToken = updateCartInAuthToken(req.headers.authorization, cart.items);
    res.cookie("authToken", updatedToken, { httpOnly: true, maxAge: 86400000 });
    return res.status(200).send({message:"Cart retrieved.", cart:cart.items});
  }
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
    if (!authToken) {
      if (!cart) { 
        cart = new Cart({userID, items:[]})
      } else {
        const updatedToken = updateCartInAuthToken(req.headers.authorization, cart.items);
        res.cookie("authToken", updatedToken, { httpOnly: true, maxAge: 86400000 });
      }
    } else {
      // Cart exists in the database, populate cartData from the cart
      decoded = jwt.decode(authToken);
      cartData = decoded.cart;
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
        deleteItemFromCartBySKU(userID, item.SKU)
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
          cart.expiresAfter = Date.now();
        } else {
          cart.items[existingItemIndex].cost = matchingVariant.price * cart.items[existingItemIndex].qty;
          cart.expiresAfter = Date.now();
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
    res.cookie("authToken", updatedToken, { httpOnly: true, maxAge: 86400000 }); // 1 hour expiry

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
    if (!authToken) {
      if (!cart) {
        return res.status(500).send("Cart is empty");
      } else {
        const updatedToken = updateCartInAuthToken(req.headers.authorization, cart.items);
        res.cookie("authToken", updatedToken, { httpOnly: true, maxAge: 86400000 });
      }
    } else {
      // Cart exists in the database, populate cartData from the cart
      decoded = jwt.decode(authToken);
      cartData = decoded.cart;
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
          deleteItemFromCartBySKU(userID, item.SKU)
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

    // Calculate the minimum expiration time required (2 days)
    
    const minExpirationTime = Date.now() - (2 * 24 * 60 * 60 * 1000);
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

// Define a function to delete a specific item from the items array based on SKU
async function deleteItemFromCartBySKU(req, res) {
  try {
    const { userID } = req.user;
    const { SKU } = req.body;
    let authToken = req.cookies.authToken;
    let cart;
    
    if (!authToken) {
      cart = await Cart.findOne({ userID });
      if (!cart) {
        return res.status(500).send('Cart not found, please re-log.');
      } else {
        const updatedToken = updateCartInAuthToken(req.headers.authorization, cart.items);
        res.cookie("authToken", updatedToken, { httpOnly: true, maxAge: 86400000 });
      }
    }
    
    authToken = req.cookies.authToken;
    const decode = jwt.decode(authToken);
    let decodedCart = decode.cart;
    const updatedItems = decodedCart.filter(item => item.SKU !== SKU);
    const updatedToken = updateCartInAuthToken(req.headers.authorization, updatedItems);
    res.cookie("authToken", updatedToken, { httpOnly: true, maxAge: 86400000 });
    
    console.log('Item left in cart:', updatedItems);
    if(updatedItems.length == 0){
      await Cart.deleteOne({userID});
      res.clearCookie('authToken');
      return res.status(200).send("Cart is now empty");
    }else{
      await Cart.findOneAndUpdate({userID:userID},{items:updatedItems,expiresAfter:Date.now()},{new:true}); // Await the update operation
    }
    
    // Correct the send statement
    return res.status(200).send(updatedItems); // Remove the "Item deleted" string from the status
  } catch (error) {
    console.error('Error deleting item from cart:', error);
    return res.status(500).send("Unknown error occurred.");
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

module.exports = { displayUserDetails,openDispute,getWishlist, addWishlist,addItemToCart, placeOrder,getOrderHistory,cancelOrder,deleteItemFromCartBySKU,getCart,updateProfile };
