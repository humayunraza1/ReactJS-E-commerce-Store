import React, { useEffect, useState } from "react"
import Navbar from "../components/Navbar";
import ProductsTable from "../components/ProductsTable";
import { toast } from "sonner"
import { useNavigate, useParams } from "react-router-dom";
import axios, { axiosPrivate } from "../api/axios";
import { Button,Tooltip } from "antd";
import useGeneral from "../hooks/useGeneral";
import { Label } from "../components/ui/label"
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group"
import "../components/css/editor2.css";

import {
  PlusOutlined,
  MinusOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import useAuth from "../hooks/useAuth2";

function Products () {
  const { productName } = useParams();
  const [Item,setItem] = useState({});
  const navigate = useNavigate();
  const [Var,setVar] = useState({});
  const {cart,setCart} = useGeneral();
  const {auth} = useAuth();
  // Split the slug by hyphens
    const parts = productName.split("-");
    console.log(cart);
    // The last part is the variant
    const variant = parts.pop();

    console.log(variant)
    // The rest is the itemName
    const url = parts.join("-");
  


    useEffect(()=>{
      getItem();
    },[productName])
    async function getItem(){
      const item = await axios.post('/users/getItem',{url},{headers:{
        'Content-Type':'application/json',
      },
      withCredentials:true
      })
      setItem(item.data.item[0])
      setVar(item.data.item[0].variants.find(v=> v.Variant.toLowerCase() === variant));
       
    }

    const inCart = cart.items?.find(i=>i.SKU === Var.SKU);

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
      async function addtoCart(){
        if(auth.token == ""){
          toast.error("Login to add item to cart.")
        }else{
          try{
      
            const response = await axiosPrivate.post('/users/editcart',{itemID:Item.itemID,sku:Var.SKU,quantity:1},{
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
    <Navbar/>
    <div className="flex flex-col items-center">
    <div className="flex flex-col lg:flex-row gap-8 w-[80dvw] p-8 bg-slate-50">  
  <div className="bg-slate-100 w-full lg:w-[500px] flex justify-center">
    <img src={Var.thumbnail} className="w-[500px]"/>
  </div>
  <div className="bg-slate-100 flex flex-col justify-between w-full">
   <div>
    <h1 className="font-Bebas text-5xl font-normal">{Item.itemName}</h1>
    <p>{Item.itemDescription}</p>
   </div>
   <div>
    <h2 className="text-xl"><span className="font-semibold">Rs</span> {Var.price}</h2>
   </div>
    <div className="flex flex-col gap-2 w-[250px]">
    <p className="flex gap-2"><span className="text-slate-500 font-bold">Status:</span> {Var.isOOS ? <div className="font-Bebas flex justify-center items-center p-1 bg-red-600 w-[60px] h-[25px] rounded-xl text-white">Sold Out</div>:<div className="font-Bebas flex justify-center items-center p-1 bg-green-500 w-[60px] h-[25px] rounded-xl text-white">In Stock</div>}</p>
    <p><span className="text-slate-500 font-bold">Variant:</span> {Var.Variant}</p>
    <RadioGroup className={"flex"} defaultValue={Var.Variant} value={Var.Variant} onValueChange={(data)=>navigate(`/products/${Item.url}-${data.toLowerCase()}`)}>
      {Item.variants?.map(v=>{ return(<div className="flex items-center space-x-2">
        <div className="flex flex-col text-center gap-1">
    <RadioGroupItem indicator={false} value={v.Variant} id={v.Variant} disabled={v.isOOS}>
      <div className={`w-[70px] p-1 border-2 border-slate-${Var.Variant == v.Variant ? '800':'300'} rounded-xl`}>
        <img src={v.thumbnail} alt={v.Variant}/>
      </div>
    </RadioGroupItem>
    <Label htmlFor={v.SKU}>{v.Variant}</Label>
        </div>
  </div>)
      })}
</RadioGroup>
    <p><span className="text-slate-500 font-bold">SKU:</span> {Var.SKU}</p>
    {!inCart ? <Button disabled={Var.isOOS} onClick={()=>addtoCart()} type="primary" className="rounded-xl">Add To Cart</Button>:
    <div className="flex gap-1 items-center">
    <div className="flex justify-between p-2 w-[200px] bg-slate-300 rounded-2xl h-[40px] items-center">
    <Button onClick={()=>editCart(inCart.itemID,inCart.SKU,-1)} size="small" type="link" className="border-0" icon={<MinusOutlined />}/>
        {inCart.qty}
        <Button onClick={()=>editCart(inCart.itemID,inCart.SKU,1)} size="small" type="link" className="border-0" icon={<PlusOutlined />}/>
    </div>
    <Tooltip title="Delete">
        <Button onClick={()=>deleteItem(inCart.SKU,inCart.name, inCart.variant)} style={{border:'none', boxShadow:'none',background:'red'}} icon={<DeleteOutlined style={{color:'white'}}/>}/>
      </Tooltip>
    </div>}
    </div>
    </div>
  </div>      
        <div className="w-[80dvw] bg-slate-200">
          <h1>Specifications</h1>
          <div dangerouslySetInnerHTML={{ __html: Item.itemSpecifications }} />
        </div>
    </div>
      <div>
      </div>
    </>
  )
};

export default Products;
