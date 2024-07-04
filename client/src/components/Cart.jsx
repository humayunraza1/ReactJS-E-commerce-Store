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
import { Button} from "antd";
import useGeneral from "../hooks/useGeneral";
import { useNavigate } from "react-router-dom";
import CartProducts from "./CarProducts";

function Cart () {
    const {cart} = useGeneral();
    const navigate = useNavigate();
    console.log(cart);

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
            
{cart.items?.length > 0 ? 
<>
<CartProducts/>
            <DrawerFooter>
            <Button onClick={()=>navigate('/order')}>Order</Button>
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
