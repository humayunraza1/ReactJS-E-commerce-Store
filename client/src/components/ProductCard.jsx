import React, { useEffect, useState } from 'react';
import { PlusOutlined,HeartOutlined,HeartFilled } from '@ant-design/icons';
import { Avatar, Card } from 'antd';
import useGeneral from '../hooks/useGeneral';
import useAuth from '../hooks/useAuth';
import { toast } from "sonner"
import { axiosPrivate } from '../api/axios';

const { Meta } = Card;
function ProductCard({itemName, description, price,itemID, thumbnail,SKU,variant})
{ 
  const [inWishlist,setInWishlist] = useState(false); 
  const {wishlist} = useGeneral();
  const {auth} = useAuth();
console.log('wishlist',wishlist)

async function editWishlist(){
  if(auth.token == ""){
    toast.error("Please login to add item to wishlist.")
  }else{
    try{
      const response =  await axiosPrivate.post('/users/editwishlist',{itemID:itemID, SKU: SKU}, {
        headers:{
          'Authorization':auth.token,
          'Content-Type':'application/json'
        },
        withCredentials:true
      })
      toast.success(response.data.message)
      setInWishlist((prev)=>!prev)
      console.log(response.data)
    }catch(err){
      console.log(err)
    }
    }
  }

useEffect(()=>{
  try{

    let matchingIndex = wishlist.findIndex((item,index)=> item.SKU == SKU);
    if(matchingIndex !== -1){
      console.log("found item in wishlist ", wishlist[matchingIndex])
      setInWishlist(true)
    }
  }catch(err){
    console.log(err);
  }
},[wishlist,inWishlist])
  return (
  <Card
    style={{
      width: 250,
      padding:"4px"
    }}
    cover={
      <div style={{display:'flex', justifyContent:"center"}}>
      <img
        alt={itemName}
        src={thumbnail}
        className='h-[200px]'
        />
        </div>
    }
    actions={[
      inWishlist ? <HeartFilled onClick={()=>editWishlist()} key="wishlist"/>:<HeartOutlined onClick={()=>editWishlist()} key="wishlist"/>,
      <PlusOutlined key="cart"/>
    ]}
  >
    <Meta
      title={itemName+` - `+variant}
      description={description}
      />
      <p className='text-slate-400'>{variant}</p>
      <p>Rs. {price}</p>
  </Card>
);
}
export default ProductCard;