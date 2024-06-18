import React, { useEffect, useState } from 'react';
import { Avatar, Button, List, Skeleton} from 'antd';
import useGeneral from '../hooks/useGeneral';
import CustomModal from './CustomModal';
import axios from '../api/axios';
import useAuth from '../hooks/useAuth';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { Label } from '@radix-ui/react-dropdown-menu';
const Settings = () => {
  const {user} = useGeneral();
  const [open,setOpen] = useState('');
  const [show,setShow] = useState(false)
  const [title,setTitle]=useState('');
  const [newEmail,setNewEmail] = useState("")
  const [changePassword,setChangePassword] = useState({oldPassword:'',newPassword:'',confirmPassword:''})
  const [elements,setElements] = useState(<></>)
  const {auth} = useAuth();
  const [confirmLoading,setConfirmLoading] = useState(false);
  function changeEmail(){
return <>
          <CustomModal open={show} Title={"Change Email"} handleOk={onChangeEmail} setOpen={setShow}>
           <Input value={newEmail} placeholder="Enter new email" onChange={(e)=>setNewEmail(e.target.value)}/>
        </CustomModal>

    </>
  }
  function cPassword(){
return <>
          <CustomModal open={show} Title={"Change Password"} handleOk={onChangePassword} setOpen={setShow}>
            <div className='flex flex-col'>
      <Label className="mt-5" htmlFor="password">Old Password</Label>
           <Input type="password" value={changePassword.oldPassword} placeholder="Enter your old paswsord" onChange={(e)=>setChangePassword({...changePassword,oldPassword:e.target.value})}/>
      <Label className="mt-5" htmlFor="password">New Password</Label>
      <Input type="password" value={changePassword.newPassword} placeholder="Enter your new paswsord" onChange={(e)=>setChangePassword({...changePassword,newPassword:e.target.value})}/>
      <Label className="mt-5" htmlFor="password">Confirm Password</Label>
           <Input type="password" value={changePassword.confirmPassword} placeholder="confirm paswsord" onChange={(e)=>setChangePassword({...changePassword,confirmPassword:e.target.value})}/>
            </div>
        </CustomModal>

    </>
  }
  async function onChangeEmail(){
    setConfirmLoading(true)
    try{
      console.log(auth.token)
      const response = await axios.post('/users/updateuser',{email:newEmail},{
        headers:{
          'Authorization':auth.token,
          'Content-Type': 'application/json'
        },
        withCredentials:true
      })
      console.log(response.data);
      setOpen(false);
    }catch(err){
      toast.error(err.response.data);
    }finally{
      setConfirmLoading(false);
    }
  }
  async function onChangePassword(){
    setConfirmLoading(true)
    try{
      console.log(auth.token)
      const response = await axios.post('/users/updateuser',{newPassword:changePassword.newPassword,confirmPassword:changePassword.confirmPassword,oldPassword:changePassword.oldPassword},{
        headers:{
          'Authorization':auth.token,
          'Content-Type': 'application/json'
        },
        withCredentials:true
      })
      toast.success(response.data);
      setChangePassword({oldPassword:'',newPassword:'',confirmPassword:''})
      setOpen(false);
    }catch(err){
      toast.error(err.response.data);
    }finally{
      setConfirmLoading(false);
    }
  }



  // const loadMore =
  //   !initLoading && !loading ? (
  //     <div
  //       style={{
  //         textAlign: 'center',
  //         marginTop: 12,
  //         height: 32,
  //         lineHeight: '32px',
  //       }}
  //     >
  //       <Button onClick={onLoadMore}>loading more</Button>
  //     </div>
  //   ) : null;
  return (
    <>
    {open == 'cemail' && changeEmail()}
    {open == 'cpassword' && cPassword()}
    <List
      className="demo-loadmore-list"
      itemLayout="horizontal"
      >
      <List.Item
      actions={[<a key="list-loadmore-edit" onClick={()=>{
        setShow(true);
        setOpen('cemail')}}>edit</a>]}
      >
            <List.Item.Meta
              title={<a>Email</a>}
              description={user.email}
              />
        </List.Item>
        <List.Item
      actions={[<a key="list-loadmore-edit">add</a>, <a key="list-loadmore-more">more</a>]}
      >
            <List.Item.Meta
              title={<a>Address</a>}
              description={user.address==null ? 'Add at least one address to proceed with orders.':user.address}
              />
        </List.Item>
        <List.Item
      actions={[<a key="list-loadmore-edit" onClick={()=>{
        setShow(true);
        setOpen('cpassword')
      }}>edit</a>]}
      >
            <List.Item.Meta
              title={<a>Password</a>}
              description="Click edit to change password"
              />
        </List.Item>
      </List>
              </>
  );
};
export default Settings;