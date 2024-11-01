import React, { useEffect, useState } from 'react';
import { Avatar, Button, List, Skeleton, Tooltip} from 'antd';
import useGeneral from '../hooks/useGeneral';
import CustomModal from './CustomModal';
import axios from '../api/axios';
import useAuth from '../hooks/useAuth2';
import { Input } from './ui/input';
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { toast } from 'sonner';
import { Label } from '@radix-ui/react-dropdown-menu';
import { Checkbox } from './ui/checkbox';
import {EditOutlined } from '@ant-design/icons';
const Settings = ({className}) => {
  const {user} = useGeneral();
  const [open, setOpen] = useState('');
  const [show, setShow] = useState(false);
  const [editAddr,setEditAddr] = useState({address:'',idx:0})
  const addrIndex = user.address.findIndex(addr => addr.isDefault)
  const [defaultAddrIdx,setDefaultAddrIndex] = useState(addrIndex);
  const [addr, setAddr] = useState({ address: '', isDefault: false });
  const [newEmail, setNewEmail] = useState('');
  const [changePassword, setChangePassword] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const { auth } = useAuth();
  const [confirmLoading, setConfirmLoading] = useState(false);

  function changeEmail() {
    return (
      <CustomModal open={show} Title={"Change Email"} handleOk={onChangeEmail} setOpen={setShow}>
        <Label>New Email</Label>
        <Input value={newEmail} placeholder="Enter new email" onChange={(e) => setNewEmail(e.target.value)} />
      </CustomModal>
    );
  }

  function addAddress() {
    return (
      <CustomModal open={show} Title={"Add new address"} handleOk={onAddAddr} setOpen={setShow}>
        <Label>Address</Label>
        <Input value={addr.address} placeholder="Add new address" onChange={(e) => setAddr({ ...addr, address: e.target.value })} />
        <div className="flex items-center space-x-2 mt-2">
          <Checkbox checked={addr.isDefault} onCheckedChange={() => setAddr({ ...addr, isDefault: !addr.isDefault })} />
          <label>Set as default</label>
        </div>
      </CustomModal>
    );
  }
  function editAddress(idx) {
    return (
      <CustomModal open={show} Title={"Edit address"} handleOk={onEditAddr} setOpen={setShow}>
        <Label>Address</Label>
        <Input value={editAddr.address} onChange={(e) => setEditAddr({...editAddr,address:e.target.value})} />
      </CustomModal>
    );
  }

  function cPassword() {
    return (
      <CustomModal open={show} Title={"Change Password"} handleOk={onChangePassword} setOpen={setShow}>
        <div className='flex flex-col'>
          <Label className="mt-5" htmlFor="password">Old Password</Label>
          <Input type="password" value={changePassword.oldPassword} placeholder="Enter your old password" onChange={(e) => setChangePassword({ ...changePassword, oldPassword: e.target.value })} />
          <Label className="mt-5" htmlFor="password">New Password</Label>
          <Input type="password" value={changePassword.newPassword} placeholder="Enter your new password" onChange={(e) => setChangePassword({ ...changePassword, newPassword: e.target.value })} />
          <Label className="mt-5" htmlFor="password">Confirm Password</Label>
          <Input type="password" value={changePassword.confirmPassword} placeholder="Confirm password" onChange={(e) => setChangePassword({ ...changePassword, confirmPassword: e.target.value })} />
        </div>
      </CustomModal>
    );
  }


  function showAllAddress(){
    return (<>
      <CustomModal className="p-5" open={show} Title="Address Book" handleOk={changeDefAddr} setOpen={setShow}>
      <RadioGroup value={defaultAddrIdx} onValueChange={(data)=>setDefaultAddrIndex(data)}>
      
  { user.address.map((addr,index)=> <div className="flex items-center space-x-2 rounded-lg border-2 p-4 border-slate-50">
    <RadioGroupItem key={index} value={index} id={`address-${index}`} />
    <Label htmlFor="option-one">{addr.address}</Label>
    <div className='absolute right-10'>
      <Tooltip placement='right' title="edit">
    <a value={index} onClick={()=>{ 
      setOpen('editAddr');
      setEditAddr({address:addr.address,idx:index})
    }} ghost type='link'>Edit</a>
      </Tooltip>
    </div>
  </div>  )
  
  }
</RadioGroup>
      </CustomModal>
    </>)
  }

  async function changeDefAddr(){
    if(defaultAddrIdx == addrIndex){
      setShow(false);
      setOpen('');
      return 0
    }
    try{
      const response = await axios.post('/users/updateuser',{changeDefAddr:defaultAddrIdx},{
        headers:{
          'Authorization':auth.token,
          'Content-Type':'application/json'
        },
        withCredentials:true
        
      })
      console.log(response.data);
      toast.success(response.data+'. Kindly refresh');
    }catch(err){
      console.log(err)
    }finally{
      setShow(false);
      setOpen('')
    }

  }


  async function onAddAddr() {
    setConfirmLoading(true);
    try {
      const response = await axios.post('/users/updateuser', { address: addr }, {
        headers: {
          'Authorization': auth.token,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      console.log(response.data);
      toast.success("Address added successfully!. Kindly refresh");
      setShow(false);
    } catch (err) {
      toast.error(err.response.data);
    } finally {
      setConfirmLoading(false);
    }
  }

  async function onEditAddr(){
    console.log(editAddr)
    user.address[editAddr.idx].address = editAddr.address
    try{

      const response = await axios.post('/users/updateuser',{updateAddress:user.address},{
        headers:{
          'Authorization':auth.token,
          'Content-Type':'application/json'
        },
        withCredentials:true
      })
      toast.success(response.data)
      setShow(false)
      setOpen('')
    }catch(err){
      console.log(err)
    }
  }

  async function onChangeEmail() {
    setConfirmLoading(true);
    try {
      const response = await axios.post('/users/updateuser', { email: newEmail }, {
        headers: {
          'Authorization': auth.token,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      console.log(response.data);
      toast.success("Email updated successfully!. Kindly refresh");
      setShow(false);
    } catch (err) {
      toast.error(err.response.data);
    } finally {
      setConfirmLoading(false);
    }
  }

  async function onChangePassword() {
    setConfirmLoading(true);
    try {
      const response = await axios.post('/users/updateuser', { newPassword: changePassword.newPassword, confirmPassword: changePassword.confirmPassword, oldPassword: changePassword.oldPassword }, {
        headers: {
          'Authorization': auth.token,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      toast.success(response.data);
      setChangePassword({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShow(false);
    } catch (err) {
      toast.error(err.response.data);
    } finally {
      setConfirmLoading(false);
    }
  }

  const defaultAddress = user.address.find(addr => addr.isDefault);
  
  return (
    <div className={className}>
      {open == 'cemail' && changeEmail()}
      {open == 'cpassword' && cPassword()}
      {open == 'addAddr' && addAddress()}
      {open == 'addrBook' && showAllAddress()}
      {open == 'editAddr' && editAddress()}
      <List className="demo-loadmore-list" itemLayout="horizontal">
        <List.Item actions={[<a key="list-loadmore-edit" onClick={() => { setShow(true); setOpen('cemail') }}>edit</a>]}>
          <List.Item.Meta title={<a>Email</a>} description={user.email} />
        </List.Item>
        <List.Item actions={[<a key="list-loadmore-edit" onClick={() => { setShow(true); setOpen('addAddr') }}>add</a>, <a key="list-loadmore-more" onClick={()=>{
          setDefaultAddrIndex(user.address.findIndex(addr => addr.isDefault))
          setShow(true);
          setOpen('addrBook');
        }}>more</a>]}>
          <List.Item.Meta
            title={<a>Address</a>}
            description={defaultAddress ? `${defaultAddress.address} (Default)` : 'Add at least one address to proceed with orders.'}
          />
        </List.Item>
        <List.Item actions={[<a key="list-loadmore-edit" onClick={() => { setShow(true); setOpen('cpassword') }}>edit</a>]}>
          <List.Item.Meta title={<a>Password</a>} description="Click edit to change password" />
        </List.Item>
      </List>
    </div>
  );
};

export default Settings;
