const {User,Item} = require('../models/user.model');

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
        const {itemName,description,brand,stock,thumbnail,variants,category} = req.body;
        const item = new Item({itemName,itemDescription:description,thumbnail,brand,stock,variants,category});
        await item.save();
        return res.status(201).send({message:"Item added successfuly", item:item.itemID});
    } catch(error){
        return res.status(404).send({message:"Unknown error occurred", error:error})
    }
}



module.exports = {adminDashboard,addItem};