const mongoose = require('mongoose');

// Define a counter schema for auto-incrementing userID
const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    sequence_value: { type: Number, default: 0 }
});

const userCounter = mongoose.model('Counter', counterSchema);
const itemCounter = mongoose.model('Counter', counterSchema);

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
    stock: {
        type: Number,
        required: true,
        validate: {
            validator: function(value) {
                return value > 0;
            },
            message: `Quantity must be greater than 0!`
        }
    },
    variants: {
        type: [{
            Variant: String,
            thumbnail:{type:String, required: true},
            SKU: { type: String, unique: true }
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

function formatDate(date) {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const year = d.getFullYear().toString();
    return `${day}-${month}-${year}`;
}

mongoose.connect('mongodb+srv://humayunraza5:H1FVqj4nFDrRk9ds@cluster0.nkfc1zg.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

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

module.exports = { User, Item,Cart};
