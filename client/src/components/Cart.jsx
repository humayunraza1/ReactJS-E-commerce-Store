import React from "react"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
  } from "./ui/drawer"
  import {
    PlusOutlined,
    MinusOutlined,
    DeleteOutlined
  } from '@ant-design/icons';
import { Button, Divider, Tooltip } from "antd";
import useGeneral from "../hooks/useGeneral";
import axios, { axiosPrivate } from "../api/axios";
import useAuth from "../hooks/useAuth";
import { toast } from "sonner"

function Cart () {
    const {cart,setCart} = useGeneral();
    const {auth} = useAuth();
    console.log(cart);

    async function deleteItem(SKU,name,variant){
      try{
        const response = await axiosPrivate.post('/users/deleteitem',{SKU:SKU},{
          headers:{
            'Authorization':auth.token,
            'Content-Type':'application/json'
          },
          withCredentials:true
        })
        setCart(response.data.items)
        toast(`${variant} - ${name} removed from cart.`)
      }catch(err){
          console.log(err)
      }
    }
    async function editCart(itemID,SKU, quantity){
        try{
            const response = await axios.post('/users/editcart',{itemID:itemID, sku:SKU,quantity:quantity},{
                headers:{
                    'Authorization': auth.token,
                    'Content-Type':'application/json'
                },
                withCredentials:true
            })
            setCart(response.data.item)
            toast(response.data.message)
        }catch(err){
            console.log(err)
        }
    }
  return (
    <>
    <Drawer>
        <DrawerTrigger asChild>
            <Button>Cart</Button>
        </DrawerTrigger>
        <DrawerContent>
            <DrawerHeader>

            <DrawerTitle>Cart</DrawerTitle>
            <DrawerDescription>
                Your cart items appear here
            </DrawerDescription>
            </DrawerHeader>
            
{cart.length > 0 ? 
<>
{cart.map((item,index)=>{
  return (          <div key={index} className="p-4 relative">
    <div className="flex p-2 w-full items-center border-2 rounded-lg hover:bg-slate-50 justify-evenly">
      <div className="h-[70px] w-[70px] rounded-xl ">
      <img src={item.thumbnail}/>
      </div>
      <div className="flex flex-col text-sm">
          <p>{item.name}</p>
          <p className="text-slate-500">{item.variant}</p>
          <p className="text-slate-400">{item.SKU}</p>
      </div>
      <div className="flex flex-col justify-center">
      <div>
          Rs. {item.cost}
      </div>
      <div className="flex gap-x-3">
        <Button onClick={()=>editCart(item.itemID,item.SKU,-1)} size="small" type="link" className="border-0" icon={<MinusOutlined />}/>
        {item.qty}
        <Button onClick={()=>editCart(item.itemID,item.SKU, 1)} size="small" type="link" className="border-0" icon={<PlusOutlined />}/>
      </div>
      </div>
      <Tooltip title="Delete">
        <Button onClick={()=>deleteItem(item.SKU,item.name, item.variant)} style={{border:'none', boxShadow:'none'}} icon={<DeleteOutlined style={{color:'red'}}/>}/>
      </Tooltip>

     </div>
  </div>)
})}
            <DrawerFooter>
            <Button>Order</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
  </>
:
<DrawerFooter>
<div className="w-full text-center text-slate-400 text-xl">Cart Is Empty</div>  
</DrawerFooter>
}

        </DrawerContent>
        
        </Drawer> 
    </>
  )
};

export default Cart;
