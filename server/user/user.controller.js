const { User, Item, Cart } = require("../models/user.model");
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

// Function to add item to cart
async function addItemToCart(req, res) {
  try {
    const { userID } = req.user;
    const authToken = req.cookies.authToken;
    const { itemID, quantity, variant } = req.body;
    console.log("item:", itemID);
    console.log("quantity:", quantity);
    // Check if itemID and quantity are provided
    if (!itemID || !quantity) {
      return res.status(400).send("Item ID and quantity are required");
    }

    let cart = await Cart.findOne({ userID });
    let item = await Item.findOne({ itemID });
    if (variant !== "none") {
      if (!item.variants.includes(variant)) {
        return res.status(203).send("Invalid variant selected");
      }
    }
    // If user doesn't have a cart, create a new one
    if (!cart) {
      if (authToken) {
        const decoded = jwt.decode(authToken);
        const cartDataFromCookies = decoded.cart;
        console.log(cartDataFromCookies);
        cart = new Cart({ userID, items: cartDataFromCookies });
      } else {
        cart = new Cart({ userID, items: [] });
      }
    }

    // Check if the item is already in the cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.itemID === itemID
    );
    let updatedToken;
    if (!item.isOOS) {
      if (existingItemIndex !== -1) {
        // If the item already exists in the cart, update the quantity
       if((cart.items[existingItemIndex].qty + quantity) <= item.stock){
           cart.items[existingItemIndex].qty += quantity
           if (quantity < 0) {
               message = `${quantity} reduced`;
            } else {
               message = `${quantity} added`;
            }
            if (cart.items[existingItemIndex].qty <= 0) {
                console.log("Item removed: ", cart.items[existingItemIndex]);
                message = `${item.itemName} removed from cart`;
                cart.items.splice(existingItemIndex, 1);
            } else {
                cart.items[existingItemIndex].cost =
                item.price * cart.items[existingItemIndex].qty;
            }
        } else{
            return res.status(203).send("Cannot add more of this item")
        } 
      } else {
        // Otherwise, add a new item to the cart
        if (quantity < 0) {
          return res.status(203).send("Invalid quantity selected");
        }else if(quantity>item.stock){
            return res.status(203).send("Invalid quantity entered.")
        }
        message = `${quantity}x ${variant} ${item.itemName} added `;
        cart.items.push({
          itemID,
          qty: quantity,
          cost: item.price,
          variant: variant,
        });
      }
    } else {
      cart.items.splice(existingItemIndex, 1);
      await cart.save();
      // Update cart in user's authentication token
      updatedToken = updateCartInAuthToken(
        req.headers.authorization,
        cart.items
      );
      // Set the updated token as a cookie
      res.cookie("authToken", updatedToken, {
        httpOnly: true,
        maxAge: 3600000,
      }); // 1 hour expiry
      return res.status(203).send("Item is now out of stock.");
    }

    // Save cart to database and reset expiration time
    cart.expiresAfter = Date.now(); // 1 hour expiry
    await cart.save();

    // Update cart in user's authentication token
    updatedToken = updateCartInAuthToken(req.headers.authorization, cart.items);

    // Set the updated token as a cookie
    res.cookie("authToken", updatedToken, { httpOnly: true, maxAge: 3600000 }); // 1 hour expiry

    return res.status(201).send({ message: message, item: cart.items });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return res.status(500).send("An error occurred while adding item to cart");
  }
}

// // Function to remove item from cart
// async function removeItemFromCart(req, res) {
//     try {
//         const { userID } = req.user;
//         const { itemID, quantity } = req.body;

//         // Find the user's cart
//         let cart = await Cart.findOne({ userID });

//         // If cart doesn't exist, try to retrieve cart data from the user's cookies
//         if (!cart) {
//             // Get cart data from cookies
//             const cartDataFromCookies = req.cookies.cart;

//             // If cart data exists in cookies, use it to create a new cart
//             if (cartDataFromCookies) {
//                 cart = new Cart({ userID, items: cartDataFromCookies });
//             } else {
//                 // If cart data doesn't exist in cookies either, return an error
//                 return res.status(404).send("Cart not found");
//             }
//         }

//         // Find the index of the item to remove
//         const itemIndex = cart.items.findIndex(item => item.itemID === itemID);

//         // If item not found, return error
//         if (itemIndex === -1) {
//             return res.status(404).send("Item not found in cart");
//         }
//         // If quantity becomes 0 or less, remove the item from the cart
//         if (cart.items[itemIndex].qty <= 0) {
//             cart.items.splice(itemIndex, 1);
//         }

//         // Update cart in the database
//         await cart.save();

//         // Update cart in user's authentication token (assuming it's stored in a JWT)
//         const updatedToken = updateCartInAuthToken(req.headers.authorization, cart.items);

//         // Set the updated token as a cookie
//         res.cookie('authToken', updatedToken, { httpOnly: true, maxAge: 3600000 }); // 1 hour expiry

//         return res.status(200).send("Item removed from cart successfully");
//     } catch (error) {
//         console.error("Error removing item from cart:", error);
//         return res.status(500).send("An error occurred while removing item from cart");
//     }
// }

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

async function placeOrder(req, res) {
  try {
    const { userID } = req.user;
    const user = await User.findOne({ userID });
    const authToken = req.cookies.authToken;
    decoded = jwt.decode(authToken);
    finalItems = [];

    for (const item of decoded.cart) {
      const id = item.itemID;
      const i = await Item.findOne({ itemID: id });
      if (!i.isOOS) {
        if (i.stock > item.qty) {
          finalItem = {
            Brand: i.brand,
            Name: i.itemName,
            Variant: item.variant,
            Quantity: item.qty,
            Cost: item.cost,
          };
          finalItems.push(finalItem);
        } else {
          return res
            .status(203)
            .send({
              message: `${i.itemName} invalid quantity entered, try lowering the quantity. `,
            });
        }
      } else {
        return res
          .status(203)
          .send({
            message: `${i.itemName} is now out of stock. Kindly remove from cart to proceed. `,
          });
      }
    }
    let finalOrder = {
      cName: user.name,
      email: user.email,
      phone: user.number,
      address: user.address,
      items: finalItems,
    };
    return res
      .status(201)
      .send({ message: "Order placed", OrderDetails: finalOrder });
  } catch (error) {
    console.log(error);
    return res
      .status(203)
      .send({ message: "Unknown error occurred.", error: error });
  }
}

// Schedule the function to run every 5 minutes
const interval = setInterval(handleExpiredDatabaseEntries, 0.5 * 60 * 1000); // Runs every 5 minutes

// Optionally, you can clear the interval when your application exits
// This prevents the function from continuing to run after the application is stopped
process.on("exit", () => {
  clearInterval(interval);
});

module.exports = { displayUserDetails, addItemToCart, placeOrder };
