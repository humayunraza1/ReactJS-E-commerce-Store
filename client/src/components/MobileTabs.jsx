import React, { useState } from 'react';
import { Tabs } from 'antd';
import DashHome from './DashHome';
import Settings from './Settings';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from 'src/hooks/useAuth';
import AllOrders from './AllOrders';
const onChange = (key) => {
  console.log(key);
};




function MobileTabs({current,setCurrent,setSearchParams,searchParams}) {


const {auth} = useAuth();
const [currTab,setCurrTab]=useState(0);
const navigate = useNavigate();

const d1 = [
  {
    key:'0',
    label:'Users',
    children: 'This is all users tab'
},
  {
    key:'20',
    label:'Products',
    children: 'This is all products tab'
},
  {
    key:'50',
    label:'Orders',
    children: <AllOrders/>
},
]

const items = [
  {
    key: '0',
    label: 'Home',
    children: <DashHome className={'p-4'}/>,
  },
  {
    key: '1',
    label: 'Settings',
    children: <Settings className={'p-4'}/>,
  },
  {
    key: '2',
    label: 'Order History',
    children: 'Content of Tab Pane 2',
  },
  {
    key: '20',
    label: 'Admin',
    children: <Tabs animated activeKey={currTab} centered items={d1}/>,
  },
  {
    key: '4',
    label: 'Disputes',
    children: 'Content of Tab Pane 4',
  },
];

return(
<Tabs centered animated activeKey={current} defaultActiveKey={current} items={items} onChange={(e)=>{setCurrent(e)
if(e == 0){
  setSearchParams({})
}
if(e==1){
  if(auth?.user?.role == 'Admin'){
    setSearchParams({ad:'settings'})
  }else{
    setSearchParams({tab:'settings'})
  }
}
if(e==2){
  setSearchParams({tab:'order-history'})
}
if(e==4){
  setSearchParams({tab:'disputes'})
}
if(e == 20){
  if(auth?.user?.role !== "Admin"){
  navigate('/dashboard');
  setCurrent(0);
  }
  setSearchParams({ad:"products"});
}
if(e == 21){
  if(auth?.user?.role !== "Admin"){
  navigate('/dashboard');
  setCurrent(0);
  }
  setSearchParams({ad:"add-product"});
  setCurrTab(20);
}
if(e == 30){
  if(auth?.user?.role !== "Admin"){
  navigate('/dashboard');
  setCurrent(0);
  }
  setSearchParams({ad:"users"});
}
if(e == 40){
  if(auth?.user?.role !== "Admin"){
  navigate('/dashboard');
  setCurrent(0);
  }
  setSearchParams({ad:"vouchers"});
}
if(e == 50){
  if(auth?.user?.role !== "Admin"){
  navigate('/dashboard');
  setCurrent(0);
  }
  setSearchParams({ad:"orders"});
  setCurrTab(50)
}
if(e == 60){
  if(auth?.user?.role !== "Admin"){
  navigate('/dashboard');
  setCurrent(0);
  }
  setSearchParams({ad:"disputes"});
}
}} />)};
export default MobileTabs;