const {User,Item,Cart} = require('../models/user.model');

const displayUserDetails = async (req, res) => {
    const { userID } = req.user;
    const user = await User.findOne({ userID });
    console.log(userID)
    return res.status(201).send({message:"Loaded details", user:user});
}

async function addItemToCart(req, res) {
    try {
        const { userID } = req.user;
        const { itemID, quantity } = req.body;

        // Find the item in the database
        const item = await Item.findOne({ itemID });
        console.log(item)
        if (!item || item.stock < quantity) {
            return res.status(400).send("Item quantity not set or insufficient stock");
        }

        // Get the price of the item
        const price = item.price;

        // Calculate the total cost by multiplying the price by the quantity
        const totalCost = price * quantity;

        console.log("Price:", item.price);
        console.log("Quantity:", quantity);

        let cart = await Cart.findOne({ userID });

        // If user doesn't have a cart, create a new one
        if (!cart) {
            cart = new Cart({ userID, items: [] });
        }

        // Check if the item is already in the cart
        const existingItemIndex = cart.items.findIndex(item => item.itemID === itemID);
        let message = "";
        if (existingItemIndex !== -1) {
            // If the item already exists in the cart, update the quantity and total cost
            cart.items[existingItemIndex].qty += quantity;
            cart.items[existingItemIndex].totalCost += totalCost;
            await cart.save();
            message = `${item.itemName} added to cart`
        } else {
            // Otherwise, add a new item to the cart with the calculated total cost
            cart.items.push({ itemID, qty: quantity, cost: totalCost });
            await cart.save();
            message = `${item.itemName} added to cart`
        }

        // Update stock quantity
        item.stock -= quantity;
        // If the stock becomes 0 after adding to cart, mark it as out of stock
        if (item.stock === 0) {
            item.isOOS = true;
        }
        await item.save();

        return res.status(201).send({ message: message });
    } catch (error) {
        return res.status(500).send({ message: "error occurred", error: error });
    }
}



// Pseudo-code for removing an item from the cart
async function removeItemFromCart(userId, itemId, quantity) {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
        throw new Error('Cart not found');
    }

    const itemIndex = cart.items.findIndex(item => item.itemId === itemId);

    if (itemIndex === -1) {
        throw new Error('Item not found in the cart');
    }

    // Update stock quantity
    const item = await Item.findById(itemId);
    item.stock += quantity;
    await item.save();

    // Update cart quantity or remove the item from the cart
    const updatedQty = cart.items[itemIndex].qty - quantity;
    if (updatedQty <= 0) {
        cart.items.splice(itemIndex, 1);
    } else {
        cart.items[itemIndex].qty = updatedQty;
    }

    await cart.save();
}

// Function to handle expired carts
async function handleExpiredCarts() {
    // Calculate the expiration time (1 hour ago)
    const expirationTime = new Date(Date.now() - 1 * 60 * 1000);
    console.log("checking for expired carts")
    // Find carts that have expired
    const expiredCarts = await Cart.find({ expiresAfter: { $lte: expirationTime } });

    // Iterate through each expired cart
    for (const cart of expiredCarts) {
        // Iterate through items in the cart
        console.log(`${cart} deleted`)
        for (const item of cart.items) {
            // Find the corresponding item and add quantity back to stock
            const { itemID, qty } = item;
            const itemToUpdate = await Item.findOne({ itemID });
            if (itemToUpdate) {
                itemToUpdate.stock += qty;
                if(itemToUpdate.isOOS) itemToUpdate.isOOS = false;
                await itemToUpdate.save();
            }
        }
        // Delete the expired cart
        await Cart.deleteOne({ _id: cart._id });
    }
}


// Schedule the function to run every 5 minutes
const interval = setInterval(handleExpiredCarts, 0.5 * 60 * 1000); // Runs every 5 minutes

// Optionally, you can clear the interval when your application exits
// This prevents the function from continuing to run after the application is stopped
process.on('exit', () => {
    clearInterval(interval);
});

module.exports = {displayUserDetails,addItemToCart};