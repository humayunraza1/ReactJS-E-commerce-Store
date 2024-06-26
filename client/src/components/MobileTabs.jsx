import React from 'react';
import { Tabs } from 'antd';
import DashHome from './DashHome';
import Settings from './Settings';
import { useSearchParams } from 'react-router-dom';
const onChange = (key) => {
  console.log(key);
};

const d1 = [
  {
    key:'0',
    label:'Users',
    children: 'This is all users tab'
},
  {
    key:'1',
    label:'Products',
    children: 'This is all products tab'
},
  {
    key:'2',
    label:'Orders',
    children: 'This is all orders tab'
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
    key: '3',
    label: 'Admin',
    children: <Tabs animated centered items={d1}/>,
  },
  {
    key: '4',
    label: 'Disputes',
    children: 'Content of Tab Pane 4',
  },
];


function MobileTabs({current,setCurrent,setSearchParams,searchParams}) {

return(
<Tabs centered animated activeKey={current} defaultActiveKey={current} items={items} onChange={(e)=>{setCurrent(e)
if(e == 0){
  setSearchParams({})
}
if(e==1){
  setSearchParams({tab:'settings'})
}
if(e==2){
  setSearchParams({tab:'order-history'})
}
if(e==4){
  setSearchParams({tab:'disputes'})
}

}} />)};
export default MobileTabs;