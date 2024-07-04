import React, { useState } from "react";
import useGeneral from "../hooks/useGeneral";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ExclamationCircleOutlined,CheckCircleTwoTone,ExclamationCircleTwoTone } from '@ant-design/icons';
import CartProducts from "../components/CarProducts";
import { Button, Divider, Input, Modal, Space, Tooltip } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "@radix-ui/react-label";
import { axiosPrivate } from "../api/axios";

function Order() {
  const { auth } = useAuth();
  const { darkMode, user, cart,setCart } = useGeneral();
  const [loading, isLoading] = useState(false);
  const [paymentOpt, setPaymentOpt] = useState("cod");
  const [discountCode, setDiscountCode] = useState("");
  const defaultAddr = user.address.find((addr) => addr.isDefault);
  const [defAddr, setDefAddr] = useState(defaultAddr.address);
  const navigate = useNavigate();
  const [modal,contextHolder] = Modal.useModal();
  async function placeOrder(){
    let m = Modal.info();
    try{
        const response = await axiosPrivate.post('/users/placeorder',{Name:user.name,Email:user.email,Number:user.number, Address:defAddr,paymentOpt:paymentOpt},{headers:{
            'Authorization':auth.token,
            'Content-Type':'application/json'
        },
        withCredentials:true
    })
        console.log(response.data);
        m.update({
          title:`Order Placed Successfuly`,
          content:`Your Order id is ${response.data.order.orderID}`,
          icon:<CheckCircleTwoTone twoToneColor="#52c41a"/>,
          okText:'Ok',
          maskClosable:false,
          closable:false,
          onOk: ()=>{m.destroy(); navigate('/');}
                })
    }catch(err){
      m.update({
        title:'Uh Oh!',
        content: err.response.data.message,
        okText:'Ok',
        icon:<ExclamationCircleTwoTone  twoToneColor="#ed0000"/>,
        maskClosable:true,
        closable:true,
        keyboard:true,
        onOk: m.destroy()
      })
      if(err.response.data.cart.length ==0){
        navigate('/')
      }
      setCart(err.response.data.cart)
        console.log(err.response.data);
    }
  }


  const confirm = () => {
    modal.confirm({
      title: 'Confirm Order',
      icon: <ExclamationCircleOutlined/>,
      content: 'Are you sure you want to place order?',
      okText: 'Yes',
      cancelText: 'Cancel',
      maskClosable:true,
      onOk:placeOrder
    });
  };

  if (cart.items?.length == 0) {
    navigate("/");
  }
  return (
    <>
    {contextHolder}
    <div className="p-8 flex justify-center">
      <div className="flex flex-col md:flex-row justify-center rounded-lg gap-8 w-full h-auto">
        <div className="flex flex-col p-4 w-auto md:w-[800px] bg-blue-300 rounded-lg">
          <h1 className="text-xl pl-4">Your items</h1>
          <CartProducts />
          <Divider />
          <h1 className="text-xl pl-4">Customer Details</h1>
          <div className="px-4">
            <p>{user.name}</p>
            <p>{user.email}</p>
            <p>{user.number}</p>
          </div>
          <Divider />
          <h1 className="text-xl pl-4">Shipping Address</h1>
          <div>
            <p className="px-4 py-2">
              {defAddr}{" "}
              <span className="text-sm text-slate-300">(Default)</span>
            </p>
          </div>
          <Divider />
          <h1 className="text-xl pl-4 mb-3">Payment Method</h1>
          <div className="px-4">
            <RadioGroup
              value={paymentOpt}
              onValueChange={(data) => setPaymentOpt(data)}
              >
              <div className="flex space-x-2 items-center">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="option-one">Cash On Delivery</Label>
              </div>
              <div className="flex space-x-2 items-center">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="option-two">Debit/Credit Card</Label>
              </div>
              <div className="flex space-x-2 items-center">
                <RadioGroupItem value="wallet" id="wallet" />
                <Label htmlFor="option-three">Mobile Wallet Account</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <div className="flex flex-col w-auto md:w-[400px] gap-8 rounded-lg">
          <div className="h-auto rounded-xl bg-slate-50 shadow-xl">
            <div className="p-4 rounded-t-xl">
              <h1 className="text-xl">Price Details</h1>
              <Divider />
              <div>
                <table class="min-w-full divide-y divide-gray-200">
                  <tbody>
                    <tr>
                      <td class="text-left">Total Cost</td>
                      <td class="text-right">{cart.final.total}</td>
                    </tr>
                    <tr>
                      <td class="text-left">Delivery Charges</td>
                      <td class="text-right">{cart.final.dc}</td>
                    </tr>
                    {/* <tr>
                    <td class="text-left">TAX</td>
                    <td class="text-right">{cart.final.tax}<span className="text-sm text-slate-300">(13%)</span></td>
                    </tr> */}
                    <tr>
                      <td class="text-left">Discount</td>
                      <td class="text-right">{cart.final.discount}</td>
                    </tr>
                  </tbody>
                </table>
                <div className="mt-4 flex bg-slate-300">
                  <Space.Compact block>
                    <Input
                      value={discountCode}
                      disabled={loading}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      placeholder="Enter Discount Code."
                      />
                    <Tooltip title="Check code">
                      <Button
                        loading={loading}
                        disabled={loading}
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={() => {
                          isLoading(true);
                          setTimeout(() => {
                            isLoading(false);
                          }, 2000);
                        }}
                        />
                    </Tooltip>
                  </Space.Compact>
                </div>
              </div>
            </div>
                <Divider className="mb-0"/>
            <div className="flex justify-between p-4 rounded-b-xl bg-slate-200">
              <p className="text-lg font-medium">
                Rs. {cart.final.total + cart.final.dc}
              </p>
              <Space.Compact>
                <Button ghost onClick={()=>navigate(-1)}>Cancel</Button>
                <Button type="primary" onClick={confirm}>Order</Button>
              </Space.Compact>
            </div>
          </div>
        </div>
      </div>
    </div>
                        </>
  );
}

export default Order;
