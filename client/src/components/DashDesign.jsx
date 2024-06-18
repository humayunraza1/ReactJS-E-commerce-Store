import React, { useEffect, useState } from 'react';
import {
  CustomerServiceOutlined,
  UserOutlined,
  HistoryOutlined,
  SettingOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import {useNavigate, useSearchParams} from "react-router-dom";
import Settings from './Settings';
import OrderHistory from './OrderHistory';
import Disputes from './Disputes';
import DarkSwitch from './DarkSwitch';
import useGeneral from '../hooks/useGeneral';
import DashHome from './DashHome';
const { Header, Content, Footer, Sider } = Layout;
function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}
const items = [
  getItem('Home', '0', <HomeOutlined />),
  getItem('Settings', '1', <SettingOutlined />),
  getItem('Order History', '2', <HistoryOutlined />),
  getItem('User', '3', <UserOutlined />, [
    getItem('Tom', '05'),
    getItem('Bill', '16'),
    getItem('Alex', '27'),
  ]),
  getItem('Disputes', '4', <CustomerServiceOutlined />),
];

const DashDesign = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [current, setCurrent] = useState('0');
  const {darkMode} = useGeneral();
  const navigate = useNavigate();
  let c = '0'
  const [searchParams, setSearchParams] = useSearchParams();
  const userTabValues = ['settings','order-history','disputes'] 

  useEffect(()=>{
    const tabValue = searchParams.get('tab');
    if(!userTabValues.includes(tabValue) || !tabValue){
      navigate('/dashboard')
      setCurrent('0')
    }

    if(tabValue == 'settings'){
      setCurrent('1')
    }
    if(tabValue == 'order-history'){
      setCurrent('2')
    }
    if(tabValue == 'disputes'){
      setCurrent('4')
    }
    
    },[searchParams])

  const onClick = (e) => {
    console.log('click ', e);
    if(e.keyPath.length == 1){
    console.log('Key: ', e.key);
    if(e.key == 0){
      navigate('/dashboard')
    }
    if(e.key == 1){
      setSearchParams({tab:'settings'})
    }
    if(e.key == 2){
      setSearchParams({tab:'order-history'})
    }
    if(e.key == 4){
      setSearchParams({tab:'disputes'})
    }
    console.log(items[e.key].label)
    setCurrent(e.key);
    }else{
      console.log(items[e.keyPath[1]])
      console.log(items[e.keyPath[1]].children[e.keyPath[0].charAt(0)].label)
      setCurrent(items[e.keyPath[1]].children[e.keyPath[0]])
    }
  };

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Layout
      style={{
        minHeight: '100vh',
      }}
    >
      <Sider theme={darkMode ? 'dark':'light'} collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
       { !collapsed && <div className={`w-full ${darkMode ? 'text-white':'text-black' } text-center font-Bebas mt-6 mb-6`}>
          <h1 className='text-3xl'>Azzy's Hardware</h1>
          <p className='text-lg'>Dashboard</p>
        </div>}
        <div className='w-full flex justify-center my-5'>
        <DarkSwitch/>
        </div>
        <Menu onClick={onClick} theme={darkMode ? 'dark':'light'} selectedKeys={[current]} activeKey={current} mode="inline" items={items} />
      </Sider>
      <Layout style={{background: darkMode && "black"}}>
        <Header
          style={{
            padding: 0,
            background: darkMode ? 'black':colorBgContainer,
          }}
        />
        <Content
          style={{
            margin: '16px 16px',
          }}
        >
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: darkMode ? '#001529':'white',
              borderRadius: borderRadiusLG,
            }}
          >
           {current == '0' && <DashHome/>}
           {current == '1' && <Settings/>}
           {current == '2' && <OrderHistory/>}
           {current == '4' && <Disputes/>}
           {current == '05' && <Disputes/>}
           {current == '16' && <Disputes/>}
           {current == '27' && <Disputes/>}
          </div>
        </Content>
        <Footer
          style={{
            textAlign: 'center',
            background: darkMode ? 'black':'white',
            color: darkMode ? 'white':'black'
          }}
        >
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};
export default DashDesign;