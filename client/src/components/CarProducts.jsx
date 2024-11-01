import React from "react"
import useGeneral from "../hooks/useGeneral";
import axios from "../api/axios";
import { Button, Tooltip } from "antd";
import useAuth from "../hooks/useAuth2";
import {
    PlusOutlined,
    MinusOutlined,
    DeleteOutlined
  } from '@ant-design/icons';

  import { toast } from "sonner"
function CartProducts () {
    const {cart,setCart} = useGeneral();
    const {auth} = useAuth();
    async function deleteItem(SKU,name,variant){
        try{
          const response = await axios.post('/users/deleteitem',{SKU:SKU},{
            headers:{
              'Authorization':auth.token,
              'Content-Type':'application/json'
            },
            withCredentials:true
          })
          setCart(response.data.cart)
          console.log(response.data);
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
              setCart(response.data.cart)
              toast(response.data.message)
          }catch(err){
              console.log(err)
          }
      }

    return (
    <>
{cart?.items?.map((item,index)=>{
  return (          <div key={index} className="p-4 relative">
    <div className="flex p-2 w-full items-center border-2 rounded-lg hover:bg-slate-50 justify-evenly">
      <div className="h-[70px] flex items-center justify-center w-[70px] rounded-xl ">
      <img className="h-[62px] w-[62px]" src={item.thumbnail}/>
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
    </>
  )
};

export default CartProducts;
