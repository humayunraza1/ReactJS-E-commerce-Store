import React, { useEffect, useState } from "react"
import { Divider, Pagination,Layout, Menu, theme, ConfigProvider } from 'antd';
import ProductCard from './ProductCard';
import Grid from '@mui/material/Unstable_Grid2'
import { axiosPrivate } from "../api/axios";
import useGeneral from "../hooks/useGeneral";
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
const rowsPerPage = 4;
const [startIndex,setStartIndex] = useState(0)
const [endIndex,setEndIndex] = useState(rowsPerPage)
const {darkMode} = useGeneral();

const onChange = (pageNumber) => {
  setStartIndex((pageNumber-1)*rowsPerPage)
  setEndIndex(rowsPerPage*pageNumber)
};

  async function getProducts(){
    const response = await axiosPrivate.get('/users/products',{
      headers:{
        'Content-Type':'application/json'
      }
    });
    const data = response.data.products;
    setProducts(data.flatMap((prod, index) => 
      prod.variants.map((item, i) => 
       {return (<Grid item key={`${index}-${i}`} padding={0} color={'white'} xs={12} sm={4} md={4} lg={2}>
          <div className="flex justify-center">
            <ProductCard 
              itemName={prod.itemName} 
              itemID={prod.itemID} 
              price={item.price} 
              thumbnail={item.thumbnail} 
              SKU={item.SKU} 
              variant={item.Variant} 
              description={prod.itemDescription}
            />
          </div>
        </Grid>)
      })
    ));
    
  }

  useEffect(()=>{
    getProducts();
  },[])

    const {
        token: { colorBgContainer, borderRadiusLG },
      } = theme.useToken();
  return (
    <>
    {children}
<Layout>
      <Content
        style={{
          height: '100dvh',
        }}
        >
        <Layout
          style={{
            height: '100dvh',
            background: darkMode ? "black":colorBgContainer
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
              theme= {darkMode ? "dark":"light"}
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

            
              <Grid  container rowGap={1} gap={{lg:5}}>
                {Products.slice(startIndex,endIndex).map((item,i)=>item)}
              </Grid>
              <div className="flex w-full justify-center p-8">
                <ConfigProvider theme={{
                  token:{
                    colorText: darkMode ? "white":"rgba(0, 0, 0, 0.88)",
                    colorTextDisabled: darkMode ? "#adadad":"rgba(0, 0, 0, 0.25)",
                    colorBgContainer: darkMode ? "#001529" : "#ffffff"
                  }
                }}>
                <Pagination  showQuickJumper defaultCurrent={1} pageSize={rowsPerPage} total={Products.length} onChange={onChange} />
                </ConfigProvider>
              </div>
          </Content>
        </Layout>
      </Content>
      <Footer
        style={{
          textAlign: 'center',
          color: darkMode?"white":"black",
          backgroundColor:darkMode? "#0a1018":colorBgContainer
        }}
        >
        Ant Design ©{new Date().getFullYear()} Created by Ant UED
      </Footer>
    </Layout>
        </>
  )
};

export default ProductsTable;
