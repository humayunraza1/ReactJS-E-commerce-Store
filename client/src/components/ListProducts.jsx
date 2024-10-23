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
let data =[];


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
                }
            });
            const ldata = response.data.products;
            data = ldata?.flatMap((prod, index) =>
              {
                return ({key:index,itemName: prod.itemName, itemID:prod.itemID, children:prod.variants, url:prod.url, thumbnail:prod.thumbnail,isOOS:null,action:true})}  );
    console.log("data response: ", response)
    setProducts(data);
    setLoading(false);
    console.log("data: ",data)
    ldata.map(item => console.log(item.itemName))
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
      render: (text) => <img className="w-[42px]" src={text}/>
    },
    {
      title: 'Product Name',
      dataIndex: 'itemName',
      key: 'itemName',
      render: (text) => <h1>{text}</h1>
    },
    {
      title:'Variant',
      dataIndex:'Variant',
      key:'Variant'
  },
    {
      title:'Price',
      dataIndex:'price',
      key:'price'
  },
    {
      title:'SKU',
      dataIndex:'SKU',
      key:'SKU'
  },
  {
    title: 'Status',
    dataIndex: 'isOOS',
    key: 'isOOS',
    sorter: (a, b) => a.isOOS - b.isOOS,
    render: (text)=>text !== null ? <Tag color={text?"red":"green"}>{text?"Sold Out":"In Stock" }</Tag>:''
  },
  {
    title: 'Action',
    dataIndex: 'action',
    key: 'x',
    render: (text,record,index) => text && <Button type="dashed" onClick={()=>{handleOpenInNewTab(record.url)}} shape="circle" icon={<EditOutlined />} />,
  },

]

const varCol = [
  {
    title:'',
    dataIndex:'thumbnail',
    key:'varThumbnail',
    width:100,
    fixed:'left',
    render: (text)=> <img src={text} className="w-[60px]"/>
  },
  {
    title:'Variant',
    dataIndex:'Variant',
    width:100,
    key:'Var',
    render: (text)=> <Input type="text" value={text}/>
  },
  {
    title:'Price',
    dataIndex:'price',
    width:150,
    key:'price',
    render:(text)=><>
    <Input addonAfter="Rs" type="Number" value={text}/>
    </>
  },
  {
    title:'Stock',
    dataIndex:'stock',
    key:'stock',
    width:100,
    render:(text)=><>
    <Input type="Number" value={text}/>
    </>
  },
  {
    title:'SKU',
    width:100,
    dataIndex:'SKU',
    key:'SKU'
  },
  {
    title:'Available',
    width:100,
    dataIndex:'',
    key:'Available',
    render:(text,record)=><Switch defaultChecked value={!record.isOOS} onClick={()=>record.isOOS = !record.isOOS}/>
  },
]

  return (
<>
{/* <FloatButton icon={<PlusOutlined />}/> */}
    <Dialog open={Open} onOpenChange={()=>setOpen(false)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Product</DialogTitle>
    </DialogHeader>
    <div className="flex flex-col gap-1 items-center">
        <img className="w-[250px] rounded-xl border-2" src={Selected.thumbnail} alt={Selected.itemName}/>
        <Label className="text-blue-800 hover:cursor-pointer">Change thumbnail</Label>
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Product Name
            </Label>
            <Input id="Item Name" value={Selected.itemName} className="col-span-3" />
          </div>
          <div className="w-[460px]">
            <Table virtual bordered scroll={{x:400}} pagination={false} columns={varCol} dataSource={Selected.children}/>
          </div>
  </DialogContent>
</Dialog>
<div className="flex flex-col gap-2">
      <div className="flex justify-end">
      <Button type="primary" onClick={()=>handleAddNew()} icon={<PlusOutlined/>}>Add Product</Button>
      </div>
      <Table loading={Loading} expandable={{defaultExpandAllRows:true}} columns={columns} dataSource={Products} />
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