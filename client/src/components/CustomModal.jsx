import { Modal } from "antd";
import React from "react"

function CustomModal ({handleOk,confirmLoading,open,setOpen,Title,children}) {
  return (
    <Modal
    title={Title}
    open={open}
    onOk={handleOk}
    confirmLoading={confirmLoading}
    onCancel={()=>setOpen(false)}
  >
    {children}
  </Modal>
  )
};

export default CustomModal;
