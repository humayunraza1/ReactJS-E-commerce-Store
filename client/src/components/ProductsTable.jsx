import React, { useEffect, useState } from "react"
import { Divider, Layout, Menu, theme } from 'antd';
import ProductCard from './ProductCard';
import Grid from '@mui/material/Unstable_Grid2'
import { axiosPrivate } from "../api/axios";
const { Header, Content, Footer, Sider } = Layout;

const items = [
    {
      key:'hardware',
      label:'Computer Hardware',
      children: [
        {
          key:'processors',
          label:'Processors'
        },
        {
          key:'memory',
          label:'Memory Modules'
        },
        {
          key:'gpu',
          label:'GPUs'
        },
      ]
    },
    {
      key:'peripherals',
      label:'Computer Peripherals',
      children:[
        {
          key:'mice',
          label:'Gaming Mouse'
        },
        {
          key:'keyboards',
          label:'Gaming Keyboards'
        },
        {
          key:'headphones',
          label:'Gaming Headsets/Earbuds'
        },
        {
          key:'mousepads',
          label:'Mousepads'
        },
      ]
    }
  ]



function ProductsTable ({children}) {

const [Products,setProducts] = useState([])
  async function getProducts(){
    const response = await axiosPrivate.get('/users/products',{
      headers:{
        'Content-Type':'application/json'
      }
    });
    setProducts(response.data.products);
    console.log(response.data);
  }

  useEffect(()=>{
    getProducts();
  },[])

    const {
        token: { colorBgContainer, borderRadiusLG },
      } = theme.useToken();
  return (
    <>
<Layout>
      <Content
        style={{
          height: '100dvh'
        }}
        >
        <Layout
          style={{
            padding: '24px 0',
            height: '100dvh',
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
          >
          <Sider
            breakpoint="xxl"
            collapsedWidth="0"
            style={{
              background: colorBgContainer,
            }}
            width={250}
            >
            <Menu
              mode="inline"
              defaultOpenKeys={['hardware','peripherals']}
              onSelect={(tab)=>console.log(tab.key)}
              style={{
                height: '100%',
              }}
              items={items}
              />
          </Sider>
          <Content
            style={{
              padding: '0 24px',
              minHeight: 280,
            }}
            >
              {/* Products go here */}

              <Grid  container rowGap={1} >
                {Products.map((prod,index)=> prod.variants.map((item,i)=>
                  <Grid item key={index+i} padding={0} color={'white'} xs={12} sm={4} md={4} lg={2}>
                    <div className="flex justify-center">
            <ProductCard itemName={prod.itemName} itemID={prod.itemID} price={item.price} thumbnail={item.thumbnail} SKU={item.SKU} variant={item.Variant} description={prod.itemDescription}/>
                    </div>
              </Grid>
              )
                )}
                
              </Grid>

          </Content>
        </Layout>
      </Content>
      <Footer
        style={{
          textAlign: 'center',
        }}
        >
        Ant Design ©{new Date().getFullYear()} Created by Ant UED
      </Footer>
    </Layout>
        </>
  )
};

export default ProductsTable;
