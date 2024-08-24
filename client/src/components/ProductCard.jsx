import React, { useEffect, useState } from 'react';
import { PlusOutlined,HeartOutlined,HeartFilled } from '@ant-design/icons';
import { Avatar, Card, ConfigProvider } from 'antd';
import useGeneral from '../hooks/useGeneral';
import useAuth from '../hooks/useAuth';
import { toast } from "sonner"
import { axiosPrivate } from '../api/axios';
import { Link } from 'react-router-dom';

const { Meta } = Card;
function ProductCard({itemName, description, price,itemID, thumbnail,SKU,variant})
{ 
  const [inWishlist,setInWishlist] = useState(false); 
  const {wishlist,cart,setCart,darkMode} = useGeneral();
  const {auth} = useAuth();
console.log('wishlist',wishlist)


function slugifyProduct(itemName, variant) {
  // Combine itemName and variant with a separator (e.g., a space)
  const combinedName = `${itemName} ${variant}`;

  // Slugify the combined name
  return combinedName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace spaces and non-alphanumeric characters with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading or trailing hyphens
}

const slug = slugifyProduct(itemName,variant);

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
      toast(response.data.message)
      setInWishlist((prev)=>!prev)
      console.log(response.data)
    }catch(err){
      console.log(err)
    }
    }
  }

async function addtoCart(){
  if(auth.token == ""){
    toast.error("Login to add item to cart.")
  }else{
    try{

      const response = await axiosPrivate.post('/users/editcart',{itemID:itemID,sku:SKU,quantity:1},{
        headers:{
          'Authorization':auth.token,
        'Content-Type':'application/json'
      },
      withCredentials:true
    })
    toast(response.data.message);
    setCart(response.data.cart)
    console.log(response.data.cart);
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
    <ConfigProvider theme={{
      token:{
        colorBorderSecondary: darkMode ? "#1e3044":"#f0f0f0",
        colorTextDescription: darkMode && "#64748B",
        colorTextHeading:darkMode && "white"
      },
      components:{
        Card:{
          actionsBg: darkMode ? "#0a1018":"#fffff"
        }
      }
    }}>
      <Link to={`/products/${slug}`}>
  <Card
  className={`${darkMode ? "bg-[#0a1018] border-[#111d2c] text-white":"bg-white"}`}
  style={{
    width: 250,
    padding:"4px",
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
      inWishlist ? <HeartFilled style={{color: darkMode && "white"}} onClick={()=>editWishlist()} key="wishlist"/>:<HeartOutlined style={{color: darkMode && "white"}} onClick={()=>editWishlist()} key="wishlist"/>,
      <PlusOutlined style={{color: darkMode && "white"}} onClick={()=>addtoCart()} key="cart"/>
    ]}
    >
      <Meta
      title={itemName+` - `+variant}
      description={description}
      />
      <p className='text-slate-400'>{variant}</p>
      <p>Rs. {price}</p>
  </Card>
      </Link>
    </ConfigProvider>
);
}
export default ProductCard;