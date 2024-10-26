import { SearchOutlined } from "@ant-design/icons";
import { Button, Input, Space, Table, Tag } from "antd";
import React, { useEffect, useState } from "react"
import { axiosPrivate } from "src/api/axios";
import useAuth from "src/hooks/useAuth";

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

        const response = await axiosPrivate.get('/admin/orders',{headers:{'Authorization':auth.token, 'Content-Type':'application/json'}});
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
        fixed: "left",
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
            <Tag color={`${text == 'Pending' ? '#FFC107': text == 'Accepted' ? '#4CAF50' : text == 'Shipped' ? 'blue' : text == 'Delivered' ? 'dark green':'red'}`}>{text}</Tag>
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
        dataIndex: "cart[0].items",
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
]

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
                            text[0].items.map((item)=> {return <p>{item.name}</p>})
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
                            text[0].items.map((item)=> {return <p>{item.cost}Rs</p> })
                        }
                    </div>
                }
            },

        ]

    }
    

]

const expandedRowRender = (record) => (
    <Table
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
        <Table rowSelection={rowSelection} columns={orderCol}    expandable={{
        expandedRowRender: (record) => expandedRowRender(record), // Pass the current record
    }} dataSource={Orders}/>
    </>
  )
};

export default AllOrders;
