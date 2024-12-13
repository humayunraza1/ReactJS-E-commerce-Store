import { CustomerServiceTwoTone, DollarCircleTwoTone, ProductOutlined, SettingFilled, SettingTwoTone } from "@ant-design/icons";
import { Button, Col, Row } from "antd";
import React from "react"
import { Label } from "./ui/label";
import { Currency, Package2Icon, ReceiptIcon, ReceiptTextIcon } from "lucide-react";
import { ReceiptRefundIcon } from "@heroicons/react/24/outline";
import useAuth from "src/hooks/useAuth";

function ToolsMenu ({setCurrent,setSearchParams}) {
    const {auth} = useAuth()
    function settingParam(id,param){
        setCurrent(id)
        if(auth?.user?.role == 'Admin'){
            setSearchParams({ad:param})
        }
    }
  return (
    <div>
      <h2 className="font-Bebas text-2xl">Tools</h2>
      <div className="mt-2">
        <Row gutter={[16, 16]}>
            <Col span={8} className="text-center flex-col" sm={{flex:'100%'}}>
            <div className="flex flex-col items-center">
            <Button size="large" className="mb-1" icon={<SettingTwoTone/>} onClick={()=>{
                settingParam('1','settings')
            }}/>
            <Label className="text-slate-500 font-normal">Settings</Label>
            </div>
            </Col>
            <Col span={8} className="text-center flex-col" sm={{flex:'100%'}}>
            <div className="flex flex-col items-center">
            <Button size="large" className="mb-1" icon={<Package2Icon color="orange"/>} onClick={()=> settingParam('20','products')}/>
            <Label className="text-slate-500 font-normal">Products</Label>
            </div>
            </Col>
            <Col span={8} className="text-center flex-col" sm={{flex:'100%'}}>
            <div className="flex flex-col items-center">
            <Button size="large" className="mb-1"  icon={<ReceiptTextIcon color="purple"/>} onClick={()=> settingParam('50','orders')}/>
            <Label className="text-slate-500 font-normal">Orders</Label>
            </div>
            </Col>
            <Col span={8} className="text-center flex-col" sm={{flex:'100%'}}>
            <div className="flex flex-col items-center">
            <Button size="large" className="mb-1"  icon={<DollarCircleTwoTone twoToneColor="gold"/>}/>
            <Label className="text-slate-500 font-normal">Vouchers</Label>
            </div>
            </Col>
            <Col span={8} className="text-center flex-col" sm={{flex:'100%'}}>
            <div className="flex flex-col items-center">
            <Button size="large" className="mb-1"  icon={<CustomerServiceTwoTone/>}/>
            <Label className="text-slate-500 font-normal">Disputes</Label>
            </div>
            </Col>
            AKIAZPPF7XCVOP6CKZ5O
            VeFv2pWtIpyrLq/BZfNll7pAKavomsl03g3Ti2zw
        </Row>
      </div>
    </div>
  )
};

export default ToolsMenu;
