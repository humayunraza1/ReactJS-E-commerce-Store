import { SearchOutlined } from "@ant-design/icons";
import { Button, Input, Space, Table, Tag } from "antd";
import React, { useEffect, useState } from "react"
import { axiosPrivate } from "src/api/axios";
import useAuth from "src/hooks/useAuth";
import { MoreHorizontal } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
  } from "../components/ui/dropdown-menu"
import { width } from "@mui/system";
import { toast } from "sonner";
import { Dialog } from "./ui/dialog";

let ordersWithKey = []

function AllOrders () {
  const {auth} = useAuth();
  const [Orders,setOrders] = useState([]);
  const [loading,setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [Value,setValue] = useState(null);

  async function getOrders(){
    setLoading(true);
    try{

        const response = await axiosPrivate.get('/admin/orders',{headers:{'Authorization':auth.token, 'Content-Type':'application/json'},withCredentials:true});
        console.log(response.data.orders)
        ordersWithKey = response.data.orders.map((order, index) => ({
            ...order,    // Spread the original order properties
            key: index // Add the index property
        }));

        setOrders(ordersWithKey.reverse())
        setLoading(false);
    }catch(err){
        console.log(err)
        setLoading(false)
    }
  
}
  useEffect(()=>{
    getOrders();
  },[])

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    }
  };

const orderCol = [
    {
        title: "Order ID",
        dataIndex: "orderID",
        key: "id",
        width: 40,
        render: (text, record, index) => (
          <div key={index} className={`flex items-center w-[96px]}`}>
            {text}
          </div>
        ),
      },
    {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 40,
        filters: [
            {
              text: 'Pending',
              value: 'Pending',
            },
            {
              text: 'Accepted',
              value: 'Accepted',
            },
            {
              text: 'Shipped',
              value: 'Shipped',
            },
            {
              text: 'Delivered',
              value: 'Delivered',
            },
            {
              text: 'Disputed',
              value: 'Disputed',
            },
            {
              text: 'Cancelled',
              value: 'Cancelled',
            },
          ],
          onFilter: (value, record) => record.status.indexOf(value) === 0,
        render: (text, record, index) => (
            <Tag color={`${text == 'Pending' ? '#FFC107': text == 'Accepted' ? '#4CAF50' : text == 'Shipped' ? '#42A5F5' : text == 'Delivered' ? '#388E3C':'#E53935'}`}>{text}</Tag>
        ),
      },
      {
        title: "Order Date",
        dataIndex: "createdAt",
        key: "date",
        width: 100,
        render: (text, record, index) => (
            <div key={index} className="flex items-center w-[96px]">
                {text}
            </div>
        ),
    },
    {
        title: "No. Of Items",
        dataIndex: "cart",
        key: "Cart",
        width: 100,
        render: (text, record, index) => (
          <div key={index} className={`flex items-center w-[96px]}`}>
            {record.cart[0].items?.length}
          </div>
        ),
      },
    {
        title: "Total",
        dataIndex: "totalAmount",
        key: "total",
        width: 100,
        render: (text, record, index) => {
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "PKR"
              }).format(text)

          return <div key={index} className={`flex items-center w-[96px]}`}>
            {formatted}
          </div>
            }
        ,
      },
      {
        title:'',
        key: "actions",
        width:40,
        fixed:"right",
        dataIndex:'orderID',
        render: (text,record,index) => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem key="Accepted" onSelect={()=>updateStatus(text,"Accepted")}>Accept</DropdownMenuItem>
                <DropdownMenuItem key="Cancel" onSelect={()=>updateStatus(text,"Cancelled")}>Cancel</DropdownMenuItem>
                <DropdownMenuItem key="Shipped" onSelect={()=>updateStatus(text,"Shipped")}>Shipped</DropdownMenuItem>
                <DropdownMenuItem key="Delivered" onSelect={()=>updateStatus(text,"Delivered")}>Delivered</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }
      }
]

async function updateStatus(orderID,status){
    try{
        const response = await axiosPrivate.post('/admin/updatestatus', {orderID,updateStatus:status}, {headers:{'Authorization':auth.token,'Content-Type':'application/json'},withCredentials:true})
        toast(response.data.msg)
        setOrders(response.data.orders.reverse())
    }catch(err){
        console.log(err)
    }
}


const expandCol = [
    {
        title:'Customer Info',
        children: [
            {
                title:'Name',
                dataIndex:'customerInfo',
                key:'ph',
                render: (text, record, index) => (
                    <div key={index} className={`flex items-center w-[96px]}`}>
                      {text.name}
                    </div>
                  ),
            },
            {
                title:'Phone No.',
                dataIndex:'customerInfo',
                key:'ph',
                render: (text, record, index) => (
                    <div key={index} className={`flex items-center w-[96px]}`}>
                      {text.number}
                    </div>
                  ),
            },
            {
                title:'Address',
                dataIndex:'customerInfo',
                key:'addr',
                render: (text, record, index) => (
                    <div key={index} className={`flex items-center w-[96px]}`}>
                      {text.address}
                    </div>
                  ),
            },
            {
                title:'Email',
                dataIndex:'customerInfo',
                key:'email',
                render: (text, record, index) => (
                    <div key={index} className={`flex items-center w-[96px]}`}>
                      {text.email}
                    </div>
                  ),
            },
        ]
    },
    {
        title:'Items Ordered',
        children:[
            {
                title:'Item Name',
                key:'iname',
                dataIndex:'cart',
                render:(text,record,index) => {
                    return <div>
                        {
                            text[0].items.map((item,index)=> {return <><p>{`${index+1}. `+item.name}</p></>})
                        }
                    </div>
                }
            },
            {
                title:'Variant',
                key:'ivar',
                dataIndex:'cart',
                render:(text,record,index) => {
                    return <div>
                        {
                            text[0].items.map((item)=> {return <p>{item.variant}</p>})
                        }
                    </div>
                }
            },
            {
                title:'Qty',
                key:'iqty',
                dataIndex:'cart',
                render:(text,record,index) => {
                    return <div>
                        {
                            text[0].items.map((item)=> {return <p>{item.qty}x</p>})
                        }
                    </div>
                }
            },
            {
                title:'Price',
                key:'iprice',
                dataIndex:'cart',
                render:(text,record,index) => {
                    return <div>
                        {
                            text[0].items.map((item)=> {
                                const formatted = new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "PKR"
                                  }).format(item.cost)
                                return <p>{formatted}</p> })
                        }
                    </div>
                }
            },

        ]

    }
    

]

const expandedRowRender = (record) => (
    <Table
        scroll={{x:900}}
        columns={expandCol}
        dataSource={[record]} // Pass only the specific order
        pagination={false}
    />
);

function searchOrders(id){
    if(!id){
        setOrders(ordersWithKey)
    }else{
        
        setOrders(ordersWithKey.filter((order)=> String(order.orderID).includes(String(id))))
    }


}


  return (
    <>
        <h2 className="text-4xl font-Bebas mb-2">Orders <span className="text-3xl text-slate-500">({Orders.length})</span></h2>
        <Space.Compact className="mb-2"><Input size="medium" type="number" placeholder="Search order id..." prefix={<SearchOutlined />} value={Value} onChange={(e)=>{
            setValue(e.target.value) 
            searchOrders(e.target.value) }}
                /></Space.Compact>
        <Table scroll={{x:900}} rowSelection={rowSelection} columns={orderCol}    expandable={{
        expandedRowRender: (record) =>expandedRowRender(record), // Pass the current record
    }} dataSource={Orders}/>
    </>
  )
};

export default AllOrders;
