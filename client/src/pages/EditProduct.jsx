import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios, { axiosPrivate } from "../api/axios";
import { Label } from "../components/ui/label";
import { Button, Input, Space, Switch, Table, Popover, FloatButton } from "antd";
import { EditOutlined,DeleteOutlined,PlusOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import useAuth from "../hooks/useAuth";
import { toast } from "sonner"
let cats = [];

function EditProduct() {
  const { productName } = useParams();
  const [Categories, setCategories] = useState([
    { key: "", label: "", children: [{ key: "", label: "" }] },
  ]);
  const varImageRef = useRef("");
  const varNameRef = useRef("");
  const varStockRef = useRef(0);
  const varPriceRef = useRef(0);
  const [varIsOOS,setVarIsOOS] = useState(false);
  const [varIsAvailable,setVarIsAvailable] = useState(true);
  const [isSubmit,setIsSubmit] = useState(false);
  const [selectedKey, setSelectedKey] = useState([""]);
  const [Loading, setLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("Select Category");
  const [Item, setItem] = useState({});
  const [newVarThumb, setNewVarThumb] = useState("");
  const navigate = useNavigate();
  const {auth} = useAuth();
  const [open, setOpen] = useState(false);
  const [AddVar, setAddVar] = useState(false);
  const [openPop, setOpenPop] = useState(false)
  useEffect(() => {
    getData();
  }, [productName]);

  async function getData() {
    setLoading(true);
    const item = await axios.post(
      "/users/getItem",
      { url: productName },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const categories = await axios.get("/users/categories", {
      headers: { "Content-Type": "application/json" },
    });

    cats = categories.data.category.map((category, idx) => ({
      key: `${idx}`,
      label: category.Name,
      children: category.type.map((typeName, index) => ({
        key: `${idx}-${index}`, // Using a combination of ID and index as a unique key
        label: typeName,
      })),
    }));

    findCategoryKeyAndLabel(cats, item.data.item[0]);
    setCategories(cats);
    setItem(item.data.item[0]);
  }

  function handleClick({ key }) {
    setSelectedKey(key);
    const indices = key.split("-"); // Split the key into indices
    const categoryIndex = parseInt(indices[0], 10); // First index for category
    const typeIndex = parseInt(indices[1], 10); // Second index for type
    const category = Categories[categoryIndex];
    const type = category?.children[typeIndex];
    if (category && type) {
      setSelectedLabel(`${category.label} > ${type.label}`); // Format the labels
    }
    setSelectedKey(key);
  }

  const hide = () => {
    setOpen(false);
  };

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
  };

  function findCategoryKeyAndLabel(categories, item) {
    const matchedCategory = categories.find(
      (category) => category.label === item.category
    );

    if (!matchedCategory) {
      console.log("Category not found");
      return { key: null, label: "Category not found" };
    }

    const matchedType = matchedCategory.children.find(
      (type) => type.label === item.type
    );

    if (!matchedType) {
      console.log("Type not found");
      return { key: null, label: "Type not found" };
    }

    setSelectedKey(matchedType.key);
    setSelectedLabel(`${matchedCategory.label} > ${matchedType.label}`);
    setLoading(false);
  }

  const handleItemChange = (key, value) => {
    setItem((prevItem) => ({
      ...prevItem,
      [key]: value,
    }));
  };

  const handleVariantChange = (index, key, value) => {
    setItem((prevItem) => {
      const updatedVariants = [...prevItem.variants];
      updatedVariants[index] = {
        ...updatedVariants[index],
        [key]: value,
      };
      return {
        ...prevItem,
        variants: updatedVariants,
      };
    });
  };

  const varCol = [
    {
      title: '',
      dataIndex: 'thumbnail',
      key: 'varThumbnail',
      width: 100,
      fixed: 'left',
      render: (text, record, index) => (
        <div className="flex items-center">
          <img src={text} className="w-[60px]" />
          <Popover
            content={<>
              <Input value={text} onChange={(e) => handleVariantChange(index, 'thumbnail', e.target.value)} />
              <a onClick={hide}>Close</a>
            </>}
            title="Add/Edit Thumbnail"
            trigger="click"
            open={open}
            onOpenChange={handleOpenChange}
          >
            <Button type="text" icon={<EditOutlined />} />
          </Popover>
        </div>
      ),
    },
    {
      title: 'Variant',
      dataIndex: 'Variant',
      width: 100,
      key: 'Var',
      render: (text, record, index) => (
        <Input
          type="text"
          value={text}
          onChange={(e) => handleVariantChange(index, 'Variant', e.target.value)}
        />
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      width: 150,
      key: 'price',
      render: (text, record, index) => (
        <Input
          addonAfter="Rs"
          type="Number"
          value={text}
          onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
        />
      ),
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      width: 100,
      render: (text, record, index) => (
        <Input
          type="Number"
          value={text}
          onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
        />
      ),
    },
    {
      title: 'SKU',
      width: 100,
      dataIndex: 'SKU',
      key: 'SKU',
    },
    {
      title: 'Available',
      width: 60,
      dataIndex: '',
      key: 'Available',
      render: (text, record, index) => (
        <Switch
          defaultChecked={record.isAvailable}
          checked={record.isAvailable}
          onChange={() => handleVariantChange(index, 'isAvailable', !record.isAvailable)}
        />
      ),
    },
    {
      title: '',
      width: 45,
      dataIndex: '',
      fixed:'right',
      key: '',
      render: (text, record, index) => (
        <Button danger type="primary" onClick={()=>console.log(index)} icon={<DeleteOutlined />
        }/>
      ),
    },
  ];

  function handleDialogClose(){
    setOpenPop(false);
    setAddVar(false);

  }
  function uploadPicture(){
    const inputValue = varImageRef.current?.input?.value; // Access the input value using the ref
    setNewVarThumb(inputValue);
    setOpenPop(false)
  }

  async function handleVarSubmit(){
    setIsSubmit(true);
    const isValidImageLink = /^(https?:\/\/.*\.(jpg|jpeg|png|gif|bmp|webp|svg))$/i;
    // setAddVariant((prev)=>({...prev,Variant:varNameRef.current?.input?.value,price:varPriceRef.current?.input?.value,stock:varStockRef.current?.input?.value,isAvailable:varIsAvailable,isOOS:varIsOOS}))
    if(varPriceRef.current?.input?.value<=0 ||varPriceRef.current?.input?.value == null){
      toast.error("Price should be greater than 0")
      setIsSubmit(false);
      return;
    }
    if (!varNameRef.current?.input?.value.trim()) {
      toast.error("Invalid variant name");
      setIsSubmit(false);
      return;
    }
    
    if(varStockRef.current?.input?.value<=0 || varStockRef.current?.input?.value == null){
      toast.error("Stock value should be greater than 0")
      setIsSubmit(false);
      return;
    }

    if (!newVarThumb || !isValidImageLink.test(newVarThumb)) {
      // Valid image link with a supported extension
     toast.error("Invalid image link. Please provide a valid URL ending with a supported image extension.");
     setIsSubmit(false); 
     return
    }
    const newVar= {
        thumbnail: newVarThumb, // Fixed spelling
        Variant:varNameRef.current?.input?.value,price:varPriceRef.current?.input?.value,stock:varStockRef.current?.input?.value,isAvailable:varIsAvailable,isOOS:varIsOOS,SKU:''
      }
    
    
    try{
      const data = await axiosPrivate.post('/admin/add-variant',{itemID: Item.itemID,newVariant:newVar},{headers:{'Authorization':auth.token,'Content-Type':'application/json'}})
      console.log(data);
      setIsSubmit(false);
    }catch(err){
      console.log(err);
      toast.error(err.response.data.message)
      setIsSubmit(false);
    }
  }

  return (
    <>
      <Dialog open={AddVar} onOpenChange={() => handleDialogClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Variant</DialogTitle>
          </DialogHeader>
          <div className="w-full bg-slate-100 flex flex-col items-center">
          <div onClick={()=>setOpenPop(true)} className="border-2 border-slate-300 flex justify-center items-center text-slate-400 font-Bebas rounded-xl w-[150px] h-[150px] text-[6rem] hover:cursor-pointer">
            {newVarThumb === '' ? (
              <h1>+</h1>
            ) : (
              <img className="w-[140px] rounded-lg" src={newVarThumb} alt="new variant thumbnail" />
            )}
          </div>
            </div>
            {openPop &&     <Space.Compact style={{ width: '100%' }}>
      <Input defaultValue={newVarThumb} ref={varImageRef} placeholder="Paste URL Here..."/>
      <Button type="primary" onClick={()=>uploadPicture()}>Save</Button>
    </Space.Compact>}
    <Label>Variant Name</Label>
    <Input disabled={isSubmit} ref={varNameRef} placeholder="Color or custom name..."/>
    <Label>Price</Label>
    <Input disabled={isSubmit} ref={varPriceRef} type="number" placeholder="Enter variant price..."/>
    <Label>Stock</Label>
    <Input disabled={isSubmit} ref={varStockRef} type="number" placeholder="Enter stock count..."/>
    
    <Label>Available</Label>
    <Switch disabled={isSubmit} style={{width:"40px"}} checked={varIsAvailable} onChange={()=>setVarIsAvailable((prev)=>!prev)}/>
    <Label>In Stock</Label>
    <Switch disabled={isSubmit} style={{width:"40px"}} checked={!varIsOOS} onChange={()=>setVarIsOOS((prev)=>!prev)}/>
    
    <Space.Compact block className="justify-end">
      <Button onClick={()=>handleDialogClose()} disabled={isSubmit}>Cancel</Button>
      <Button type="primary" loading={isSubmit} onClick={()=>handleVarSubmit()} disabled={isSubmit}>Save</Button>
      </Space.Compact>
        </DialogContent>
      </Dialog>
      <div className="bg-slate-50 w-screen h-screen flex justify-center">
        <div className="p-4 flex flex-col gap-5 bg-white rounded-xl w-screen md:w-[80dvw] lg:w-[60dvw]">
          <div className="p-4 rounded-xl shadow bg-slate-50">
            <h2 className="font-medium text-2xl mb-6">Basic Information</h2>
            <div className="flex flex-col md:flex-row items-center md:items-start md:justify-start gap-4">
              <div className="w-[200px] text-center flex flex-col gap-1">
                <div className="w-[200px] h-[150px] rounded-xl border-2 flex justify-center items-center">
                  <img className="rounded-lg w-[190px] h-[140px]" src={Item.thumbnail} alt="Product thumbnail" />
                </div>
                  <Button type="text" className="text-blue-800 font-medium">Change thumbnail</Button>
              </div>
              <div className="flex flex-col gap-2">
              <div>
                <Label>Product Title</Label>
                <Input
                  value={Item.itemName}
                  onChange={(e) => handleItemChange('itemName', e.target.value)}
                  />
              </div>
              <div>
                <Label>Product Description</Label>
                <Input
                  value={Item.itemDescription}
                  onChange={(e) => handleItemChange('itemDescription', e.target.value)}
                  />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Category</Label>
                <Dropdown
                  menu={{ items: cats, onClick: handleClick, selectable:true }}
                  trigger={["click"]}
                  arrow={{ pointAtCenter: true }}
                  placement="bottomLeft"
                  >
                  <Button>{selectedLabel}</Button>
                </Dropdown>
              </div>
                  </div>
            </div>
          </div>
          <div className="bg-slate-50">
            <h2 className="font-medium text-2xl mb-6">Variants</h2>
            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button
                  onClick={() => setAddVar(true)}
                  className="bg-cyan-700"
                  type="primary"
                >
                  Add
                </Button>
              </div>
            </div>
            <Table
              columns={varCol}
              dataSource={Item.variants}
              rowKey="key"
              pagination={{ pageSize: 5 }}
              scroll={{ x: 1000 }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default EditProduct;
