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
const addressSchema = new mongoose.Schema({
    address: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
  });

const userSchema = new mongoose.Schema({
    userID: { type: Number, unique: true, immutable: true }, // Immutable prevents user input
    name: { type: String, required: true },
    address: {
        type: [addressSchema],
        validate: {
          validator: function(value) {
            return value.length <= 3;
          },
          message: props => `Address array exceeds the maximum length of 3. Currently length is ${props.value.length}`
        },
        default: []
      },
    number:{type:String, defualt:null},
    role: {
        type: String,
        enum: ["Admin", "User"],
        default: "User",
        immutable: true // Immutable prevents user input
    },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    googleId: { type: String, default:null ,sparse: true},
    password: { type: String },
    refreshToken: {type:String, default:null},
    resetPasswordToken: { type: String, default: null, immutable: true }, // Immutable prevents user input
    resetPasswordExpires: { type: String, default: null, immutable: true } // Immutable prevents user input
});

// Define the item schema
const itemSchema = new mongoose.Schema({
  itemID: { type: Number, unique: true, immutable: true }, 
  itemName: { type: String, required: true },
  itemDescription: { type: String, required: true },
  thumbnail: { type: String },
  brand: { type: String, required: true, default: "No brand" },
  datePosted: { type: Date, default: Date.now, immutable: true },// Add price field here if it's a global price
  url: { type: String, unique: true, required: true }, // Make sure URL is unique
  variants: {
    type: [{
      Variant: { type: String, required: true },  // Ensure Variant is a string
      thumbnail: { type: String, required: true },
      SKU: { type: String, unique: true },  // Unique SKU per variant
      isAvailable: { type: Boolean, default: true },
      stock: { type: Number, required: true },  // Ensure stock is a number
      price: { type: Number, required: true },  // Ensure price is a number
      isOOS: { type: Boolean, default: false }
    }],
    default: []
  },
  category: { 
    type: String, 
    enum: ['CPU', 'Motherboard', 'Memory', 'Cooling', 'GPU', 'Storage', 'PSU','Case','Mouse','Headset','Keyboard','Mousepad'], 
    required: true 
  },
  type: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        const categoryTypeMap = {
          CPU: ['Intel', 'AMD'],
          GPU: ['AMD', 'Nvidia'],
          Memory: ['DDR4', 'DDR5'],
          Mouse: ['Wired', 'Wireless'],
          Headset: ['Wired', 'Wireless'],
          Motherboard: ['AMD', 'Intel'],
          Cooling: ['Air Cooling', 'Liquid Cooling','AIO Cooler'],
          Keyboard: ['Wired', 'Wireless'],
          Mousepad: ['Large', 'Medium', 'Small'],
          Storage: ['HDD', 'SSD','External HDD'],
          PSU: ['Non Modular', 'Semi Modular', 'Fully Modular']
        };
        return !this.category || !categoryTypeMap[this.category] || categoryTypeMap[this.category].includes(v);
      },
      message: props => `${props.value} is not a valid type for category ${props.instance.category}`
    }
  }
});


const categoryTypeSchema = new mongoose.Schema({
  Name: { type: String, required: true},
  type: { type: [String], required: true }
});

const cartSchema = new mongoose.Schema({
  userID: { type: Number, immutable: true },
  items: [{
      itemID: { type: Number, immutable: true },
      name:String,
      cost: Number,
      qty: Number,
      variant: {type: String, default: "none"},
      SKU: {type:String, required:true},
      thumbnail: {type:String}
  }],
  final:{
    total:Number,
    dc:Number,
    discount:Number
  },
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
    disputeStatus: { 
        type: String, 
        enum: ['Open','Closed'], 
        default: null 
      }, 
    isDisputed: { type: Boolean, default: false }, // Indicates if the order is disputed
    disputeCreatedAt: { type: String,default:null }, // Date of dispute creation
    disputeReason: {type: String, enum:['Product not as described', 'Not delivered yet','Damaged or defective items','Billing issues','null'], default:'null'},
    disputeDescription:String,
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
  
const wishlistSchema = new mongoose.Schema({
    userID:{type:String,required:true},
    items: [Object] 
})

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
const wishList = mongoose.model('Wishlist', wishlistSchema);
const Category = mongoose.model('Category', categoryTypeSchema);

module.exports = { User, Item,Cart,Order,wishList,Category};
