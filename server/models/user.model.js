const mongoose = require('mongoose');

// Define a counter schema for auto-incrementing userID
const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    sequence_value: { type: Number, default: 0 }
});

const userCounter = mongoose.model('Counter', counterSchema);
const itemCounter = mongoose.model('Counter', counterSchema);
const orderCounter = mongoose.model('Counter', counterSchema);

// User schema with userID field
const userSchema = new mongoose.Schema({
    userID: { type: Number, unique: true, immutable: true }, // Immutable prevents user input
    name: { type: String, required: true },
    address: {type: String, requried:true},
    number:{type:String, required:true},
    role: {
        type: String,
        enum: ["Admin", "User"],
        default: "User",
        immutable: true // Immutable prevents user input
    },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    resetPasswordToken: { type: String, default: null, immutable: true }, // Immutable prevents user input
    resetPasswordExpires: { type: String, default: null, immutable: true } // Immutable prevents user input
});

// Define the item schema
const itemSchema = new mongoose.Schema({
    itemID: { type: Number, unique: true, immutable: true }, // Immutable prevents user input
    itemName: { type: String, required: true },
    itemDescription: { type: String, required: true },
    thumbnail: { type: String },
    brand:{type: String, required:true, default:"No brand"},
    datePosted: { type: Date, default: Date.now, set: formatDate, immutable: true }, // Immutable prevents user input
    price:{type:Number, requried:true},
    variants: {
        type: [{
            Variant: String,
            thumbnail:{type:String, required: true},
            SKU: { type: String, unique: true },
            stock: {type:Number, required:true},
            price:{type:Number, required:true},
            isOOS:{type:Boolean, default:false}
        }],
        default: []
    },
    isOOS: { type: Boolean, default: false },
    category: { type: String, required: true }
});

const cartSchema = new mongoose.Schema({
  userID: { type: Number, immutable: true },
  items: [{
      itemID: { type: Number, immutable: true },
      cost: Number,
      qty: Number,
      variant: {type: String, default: "none"},
      SKU: {type:String, required:true},
      thumbnail: {type:String}
  }],
  expiresAfter: { type: Date, default: Date.now} // Expires after 1 hour
});


// Define the schema for the order
const orderSchema = new mongoose.Schema({
    userID: { type: Number , required: true }, // Reference to the user who placed the order
    orderID:{type:Number, unique:true,immutable:true},
    customerInfo:{type:Object,required:true},
    cart: [Object], // Array of items in the order
    createdAt: { type: String, required: true }, // Storing date and time as a string
    status: { 
      type: String, 
      enum: ['Pending', 'Accepted', 'Shipped', 'Delivered', 'Cancelled', 'Returned'], 
      default: 'Pending' 
    }, // Order status with specific values
    isDisputed: { type: Boolean, default: false }, // Indicates if the order is disputed
    disputeCreatedAt: { type: String,default:null }, // Date of dispute creation
    paymentMethod: { 
      type: String, 
      enum: ['Debit/Credit Card', 'Mobile Wallets', 'Cash On Delivery'], 
      required: true,
      default:'Cash On Delivery'
    }, // Payment method with specific values
    totalAmount:{type:Number, required:true},
    paymentStatus: { 
      type: String, 
      enum: ['Pending', 'Paid'], 
      required: true,
      default: 'Pending' 
    }, // Payment status with specific values
    // You can add more fields such as shipping information, order status, etc.
  });
  


function formatDate(date) {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const year = d.getFullYear().toString();
    return `${day}-${month}-${year}`;
}

mongoose.connect('mongodb+srv://humayunraza5:H1FVqj4nFDrRk9ds@cluster0.nkfc1zg.mongodb.net/')

// Pre-save middleware to auto-increment userID
userSchema.pre('save', async function(next) {
    const doc = this;
    if (!doc.isNew) { // Check if it's a new document to avoid updating existing ones
        return next();
    }
    try {
        // Find the counter document and increment the sequence value
        const counter = await userCounter.findByIdAndUpdate({ _id: 'userID' }, { $inc: { sequence_value: 1 } }, { new: true, upsert: true });
        doc.userID = counter.sequence_value; // Assign the incremented value to the userID field
        next();
    } catch (error) {
        next(error);
    }
});

// Set the payment status based on the payment method
orderSchema.pre('save', async function(next) {

    const doc = this;
    if (!doc.isNew) { // Check if it's a new document to avoid updating existing ones
        return next();
    }
    try {
        // Find the counter document and increment the sequence value
        const counter = await orderCounter.findByIdAndUpdate({ _id: 'orderID' }, { $inc: { sequence_value: 1 } }, { new: true, upsert: true });
        doc.orderID = counter.sequence_value; // Assign the incremented value to the userID field
        next();
    } catch (error) {
        next(error);
    }

    if (this.paymentMethod === 'Cash On Delivery') {
      this.paymentStatus = 'Paid';
    }
    next();
  });
  

// Pre-save middleware to auto-increment itemID
itemSchema.pre('save', async function(next) {
    const doc = this;
    if (!doc.isNew) { // Check if it's a new document to avoid updating existing ones
        return next();
    }
    try {
        // Find the counter document and increment the sequence value
        const counter = await itemCounter.findByIdAndUpdate({ _id: 'itemID' }, { $inc: { sequence_value: 1 } }, { new: true, upsert: true });
        doc.itemID = counter.sequence_value; // Assign the incremented value to the itemID field
        next();
    } catch (error) {
        next(error);
    }
});

const User = mongoose.model('User', userSchema);
const Item = mongoose.model('Item', itemSchema);
const Cart = mongoose.model('Cart', cartSchema);
const Order = mongoose.model('Order', orderSchema);

module.exports = { User, Item,Cart,Order};
