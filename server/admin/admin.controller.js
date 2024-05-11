const {User,Item} = require('../models/user.model');
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



module.exports = {adminDashboard,addItem};