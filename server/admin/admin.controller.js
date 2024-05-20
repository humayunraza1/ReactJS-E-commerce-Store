const {User,Item,Order} = require('../models/user.model');
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
        return res.status(500).send("Unauthorized");
    }
    const orders = await Order.find();
    console.log(orders)
    if(orders.length == 0){
        return res.status(200).send({message:"No orders found", orders:[]})
    }
    return res.status(200).send({message: `found ${orders.length}`, orders})
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
    try{

        const { userID } = req.user;
        const user = await User.findOne({ userID });
        if(user.role === 'User'){
            return res.status(401).send({message:"Unauthorized. Redirecting to user dashboard.",url:"/user/dashboard"})
        }
        const {itemName,description,price,brand,stock,thumbnail,variants,category} = req.body;
        finalVariants = []
        for(const item of variants){
            sku = 'SKU-'+generateShortUUID()+`${userID}-`+item;
            finalVariants.push({Variant: item, SKU:sku});
        }
        const item = new Item({itemName,itemDescription:description,price,thumbnail,brand,stock,variants:finalVariants,category});
        await item.save();
        return res.status(201).send({message:"Item added successfuly", item:item.itemID});
    } catch(error){
        return res.status(404).send({message:"Unknown error occurred", error:error})
    }
}



module.exports = {adminDashboard,addItem,getOrders,updateStatus};