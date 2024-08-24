import React, { useEffect, useState } from "react"
import Navbar from "../components/Navbar";
import ProductsTable from "../components/ProductsTable";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import { Button } from "antd";
import useGeneral from "../hooks/useGeneral";

function Products () {
  const { productName } = useParams();
  const [Item,setItem] = useState({});
  const [Var,setVar] = useState({});
  const {cart,setCart} = useGeneral();
    // Split the slug by hyphens
    const parts = productName.split("-");
  
    // The last part is the variant
    const variant = parts.pop();

    console.log(variant)
    // The rest is the itemName
    const url = parts.join("-");
  
    useEffect(()=>{
      getItem();
    },[])
    async function getItem(){
      const item = await axios.post('/users/getItem',{url},{headers:{
        'Content-Type':'application/json',
      }
      })
      setItem(item.data.item[0])

    
      setVar(Item.variants.find(v=> v.Variant.toLowerCase() === variant));
       
    }
  return (
    <>
    <Navbar/>
    <div className="flex justify-center">
    <div className="flex gap-8 w-[80dvw] p-8 bg-slate-50">  
  <div className="bg-slate-100 w-[500px] flex justify-center">
    <img src={Var.thumbnail} className="w-[400px]"/>
  </div>
  <div className="bg-slate-100 flex flex-col justify-between">
   <div>
    <h1 className="font-Bebas text-5xl font-normal">{Item.itemName}</h1>
    <p>{Item.itemDescription}</p>
   </div>
    <div className="flex flex-col gap-2 w-[250px]">
    <p><span className="text-slate-500 font-bold">Variant:</span> {Var.Variant}</p>
    <p><span className="text-slate-500 font-bold">SKU:</span> {Var.SKU}</p>
    <Button type="primary" className="rounded-xl">Add To Cart</Button>
    </div>

    </div>
  </div>      
    </div>
    </>
  )
};

export default Products;
