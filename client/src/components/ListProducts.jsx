import React, { useEffect, useState } from "react"
import { axiosPrivate } from "../api/axios";
import { Button, FloatButton, Input, Space,Switch, Table, Tag} from 'antd';
import { EditOutlined,PlusOutlined } from '@ant-design/icons';
import { Label } from "./ui/label"
import { Checkbox } from "./ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { useSearchParams } from "react-router-dom";
let prodWithKey = []


function ListProducts () {
    const [Products,setProducts] = useState([]);
    const [Open,setOpen] = useState(false);
    const [Loading,setLoading] = useState(false);
    const [Selected,setSelected] = useState({});
    const [searchParams, setSearchParams] = useSearchParams();

    const handleOpenInNewTab = (url) => {
      setSearchParams({ad:'edit-product',prod:url})
    };
    const handleAddNew = (url) => {
      const newPath = `/product/new`;  // The internal route you want to open
      window.open(newPath, '_blank', 'noopener,noreferrer');
    };

    async function getProducts(){
        setLoading(true);
        try{
            const response = await axiosPrivate.get('/users/products',{
                headers:{
                    'Content-Type':'application/json'
                },
                withCredentials:true
            });
            prodWithKey = response.data.products.map((prod, index) => ({
              ...prod,    // Spread the original order properties
              key: index // Add the index property
          }));
          console.log(prodWithKey)
    setProducts(prodWithKey);
    setLoading(false);
}catch(err){
    console.log(err)
    setLoading(false);
}
        
      }

useEffect(()=>{
    getProducts();
},[])


const columns = [
    {
      title: '',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      width:100,
      fixed:'left',
      render: (text) => <img className="w-[42px]" src={text}/>
    },
    {
      title: 'Product Name',
      dataIndex: 'itemName',
      key: 'itemName',
      render: (text) => <h1>{text}</h1>
    },
  {
    title: 'Action',
    dataIndex: '',
    key: 'x',
    width:100,
    fixed:'right',
    render: (text,record,index) => text && <Button type="dashed" onClick={()=>{handleOpenInNewTab(record.url)}} shape="circle" icon={<EditOutlined />} />,
  },

]


const varCol = [
    {
      title:'',
      dataIndex:'thumbnail',
      key:'vth',
      render:(text,record)=><img className="w-[42px]" alt={record.Variant} src={text}/>
    },
    {
      title:'Name',
      dataIndex:'Variant',
      key:'vn',
      render:(text,record)=><p>{text}</p>
    },
    {
      title:'SKU',
      dataIndex:'SKU',
      key:'vsku',
      render:(text,record)=><p>{text}</p>
    },
    {
      title:'Price',
      dataIndex:'price',
      key:'vprice',
      render:(text,record)=><p>{text}</p>
    },
    {
      title:'Stock',
      dataIndex:'stock',
      key:'vstock',
      render:(text,record)=><p>{text}</p>
    },
    {
      title:'Status',
      dataIndex:'isOOS',
      key:'visOOS',
      fixed:'right',
      width:100,
      render:(text,record)=><Tag color={`${text ? 'red':'green'}`}>{text ? 'Sold Out':'In Stock'}</Tag>
    },
]

function expandedRowRender(record) {
  console.log("record: ", record.variants)
 return (
    <Table
    scroll={{x:900}}
        columns={varCol}
        dataSource={record.variants} // Pass only the specific order
        pagination={false}
    />
  );
} 

  return (
<>
{/* <FloatButton icon={<PlusOutlined />}/> */}
<div className="flex flex-col gap-2">
      <div className="flex justify-end">
      <Button type="primary" onClick={()=>handleAddNew()} icon={<PlusOutlined/>}>Add Product</Button>
      </div>
      <Table scroll={{x:900}} loading={Loading} expandable={{expandedRowRender:(record)=>expandedRowRender(record)}} columns={columns} dataSource={Products} />
      
</div>

</>
  )
};

export default ListProducts;

// import React from 'react';
// import { Space, Table, Tag } from 'antd';
// const columns = [
//   {
//     title: 'Name',
//     dataIndex: 'name',
//     key: 'name',
//     render: (text) => <a>{text}</a>,
//   },
//   {
//     title: 'Age',
//     dataIndex: 'age',
//     key: 'age',
//   },
//   {
//     title: 'Address',
//     dataIndex: 'address',
//     key: 'address',
//   },
//   {
//     title: 'Tags',
//     key: 'tags',
//     dataIndex: 'tags',
//     render: (_, { tags }) => (
//       <>
//         {tags.map((tag) => {
//           let color = tag.length > 5 ? 'geekblue' : 'green';
//           if (tag === 'loser') {
//             color = 'volcano';
//           }
//           return (
//             <Tag color={color} key={tag}>
//               {tag.toUpperCase()}
//             </Tag>
//           );
//         })}
//       </>
//     ),
//   },
//   {
//     title: 'Action',
//     key: 'action',
//     render: (_, record) => (
//       <Space size="middle">
//         <a>Invite {record.name}</a>
//         <a>Delete</a>
//       </Space>
//     ),
//   },
// ];
// const data = [
//   {
//     name: 'John Brown',
//     age: 32,
//     address: 'New York No. 1 Lake Park',
//     tags: ['nice', 'developer'],
//   },
//   {
//     key: '2',
//     name: 'Jim Green',
//     age: 42,
//     address: 'London No. 1 Lake Park',
//     tags: ['loser'],
//   },
//   {
//     key: '3',
//     name: 'Joe Black',
//     age: 32,
//     address: 'Sydney No. 1 Lake Park',
//     tags: ['cool', 'teacher'],
//   },
// ];
// const ListProducts = () => <Table columns={columns} dataSource={data} />;
// export default ListProducts;