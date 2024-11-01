import React, { useEffect } from "react"
import { axiosPrivate } from "src/api/axios";
import useAuth from "src/hooks/useAuth";

function OrderHistory () {
  const {auth} = useAuth();
  async function getOrders(){
    try{

      const response = await axiosPrivate.get('/admin/orders',{headers:{'Authorization':auth.token, 'Content-Type':'application/json'},withCredentials:true});
      console.log(response.data)
    }catch(err){
      console.log(err)
    }
    }
  useEffect(()=>{
    getOrders();
  },[])

  return (
    <div>
    </div>
  )
};

export default OrderHistory;
