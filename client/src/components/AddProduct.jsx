import {
  Button,
  Dropdown,
  Switch,
  Popover,
  Input,
  Table,
  Popconfirm,
  message,
  Space,
  Checkbox,
  Tag,
  Upload,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import { Label } from "./ui/label";
import { Toggle } from "./ui/toggle";
import axios, { axiosPrivate } from "../api/axios";
import {
  EditOutlined,
  DeleteOutlined,
  ItalicOutlined,
  UndoOutlined,
  RedoOutlined,
  BoldOutlined,
  FileImageOutlined,
  FontSizeOutlined,
  FontColorsOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import useAuth from "../hooks/useAuth";
import "./css/editor2.css";
import {TestingEditor} from "./TestingEditor";
import { useParams, useSearchParams } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
let cats = [];

function AddProduct() {
  const [editingProd,setEditingProd] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [Item,setItem] = useState({});
  const [open, setOpen] = useState(false);
  const childSaveContentRef = useRef();
  const [value, setValue] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("Select Category");
  const [prodThumbnail, setProdThumbnail] = useState("");
  const [Variants, setVariants] = useState([
    { thumbnail: "", Variant: "",SKU:"", stock: 0, price: 0, isAvailable: true },
  ]);
  const [prodName,setProdName] = useState("");
  const productThumbnailRef = useRef("");
  const [isError, setIsError] = useState(false);
  const { auth } = useAuth();
  const [prodBrand,setProdBrand] =useState("");
  const [CustomUrl, setCustomUrl] = useState(false);
  const [newURL, setNewURL] = useState("");
  const [prodDesc,setProdDesc] = useState("");
  const [itemCategory, setItemCategory] = useState({ Category: "", Type: "" });
  const [selectedKey, setSelectedKey] = useState([""]);
  const [Categories, setCategories] = useState([
    { key: "", label: "", children: [{ key: "", label: "" }] },
  ]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [uploadImage, setUploadImage] = useState('')
  const adValue = searchParams.get('ad')
  const prodValue = searchParams.get('prod')
// Edit Product Code
useEffect(() => {

  
  if(adValue=='add-product'){
    console.log("Adding New Product")
    setEditingProd(false);
  }else if(adValue == 'edit-product'){
    setEditingProd(true);
    if(prodValue){
      getItemData();
    }else{
      toast.error("Invalid product selected.")
      setSearchParams({ad:'products'})
    }
  }
}, [adValue,prodValue]);

async function getItemData() {
  setLoading(true);
  console.log("getting product")
  try{
    const item = await axios.post(
      "/users/getItem",
      { url: prodValue },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials:true
      }
    );
    setLoading(false);
    setItem(item.data.item[0])
    console.log(item.data.item[0]);
    console.log(item.data.item[0]);
    setValue(item.data.item[0].itemSpecifications)
    setProdName(item.data.item[0].itemName)
    setProdThumbnail(item.data.item[0].thumbnail)
    setProdBrand(item.data.item[0].brand)
    setProdDesc(item.data.item[0].itemDescription)
    setNewURL(item.data.item[0].url)
    const mappedVariants = item.data.item[0].variants.map(variant => ({
      thumbnail: variant.thumbnail || "",
      Variant: variant.Variant || "",
      stock: variant.stock || 0,
      isOOS:variant.isOOS || false,
      SKU: variant.SKU || "TBA",
      price: variant.price || 0,
      isAvailable: variant.isAvailable || false
    }));
    console.log(mappedVariants);
    setVariants(mappedVariants);
  }catch(err){
    setLoading(false);
    console.log(err)
  }
}


// ---------------------

  async function getData() {
    setLoading(true);
    try {
      const categories = await axios.get("/users/categories", {
        headers: { "Content-Type": "application/json" },withCredentials:true});

      cats = categories.data.category.map((category, idx) => ({
        key: `${idx}`,
        label: category.Name,
        children: category.type.map((typeName, index) => ({
          key: `${idx}-${index}`, // Using a combination of ID and index as a unique key
          label: typeName,
        })),
      }));
      setCategories(cats);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  }

  const handleVariantChange = (index, key, value) => {
    setVariants((prevVar) => {
      const updatedVariants = [...prevVar];
      const variantToUpdate = updatedVariants[index];
  
      if (key === "Variant") {
        let newSKU;
  
        // Check if the SKU contains a second '-' (SKU format: SKU-d26659-White)
        if (variantToUpdate.SKU.includes('-') && variantToUpdate.SKU.split('-').length > 2) {
          // Modify text after the second '-' to current Variant value
          const skuParts = variantToUpdate.SKU.split('-');
          skuParts[2] = value; // Update the text after the second '-'
          newSKU = skuParts.join('-');
        } else {
          // Add `-${value}` to SKU if the second part does not exist
          newSKU = `${variantToUpdate.SKU}-${value}`;
        }
  
        // Update the variant with the new SKU
        updatedVariants[index] = {
          ...variantToUpdate,
          SKU: newSKU,
          [key]: value, // Update the Variant key as well
        };
      } else if (key === "stock") {
        // Ensure stock is a non-negative integer
        const sanitizedStock = Math.max(0, Math.floor(value));
  
        // Update stock and set isOOS based on the stock value
        updatedVariants[index] = {
          ...variantToUpdate,
          stock: sanitizedStock,
          isOOS: sanitizedStock > 0 ? false : true, // Set isOOS based on sanitized stock
        };
      } else {
        // If the key is not "Variant" or "stock", just update the key-value pair
        updatedVariants[index] = {
          ...variantToUpdate,
          [key]: value,
        };
      }
  
      return updatedVariants;
    });
  };
  
  
  function handleClick({ key }) {
    setSelectedKey(key);
    const indices = key.split("-"); // Split the key into indices
    const categoryIndex = parseInt(indices[0], 10); // First index for category
    const typeIndex = parseInt(indices[1], 10); // Second index for type
    const category = Categories[categoryIndex];
    const type = category?.children[typeIndex];
    if (category && type) {
      setSelectedLabel(`${category.label} > ${type.label}`); // Format the labels
      setItemCategory({ Category: category.label, Type: type.label });
    }
    setSelectedKey(key);
  }

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
    setItemCategory({Category:matchedCategory.label,Type:matchedType.label})
    setLoading(false);
  }


  function generateShortUUID() {
    // Generate UUID
    const fullUUID = uuidv4();

    // Truncate UUID to 5 characters
    const shortUUID = fullUUID.substr(0, 6);

    return shortUUID;
}

function generateUniqueSKU() {
  let newSKU;
  const existingSKUs = new Set(Variants.map(variant => variant.SKU));
  do {
    // Generate a short UUID for SKU
    const shortUUID = generateShortUUID();

    // Create the new SKU format
    newSKU = `SKU-${shortUUID}`;
    console.log(shortUUID)
    // Check if the newSKU already exists in the variants array
  } while (existingSKUs.has(newSKU));
  console.log(newSKU)
  return newSKU;
}

  useEffect(() => {
    getData();
  }, []);
  useEffect(() => {
    findCategoryKeyAndLabel(Categories,Item)
  }, [Categories,Item]);

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
  };

  const confirm = (index) => {
    if (Variants.length == 1) {
      toast.error("Should have at least 1 variant.");
      return;
    }
    setVariants((prevVar) => prevVar.filter((_, i) => i !== index));
  };
  const cancel = (e) => {
    console.log(e);
    message.error("Click on No");
  };

  const formatName = (name) => {
    if (!CustomUrl) {
      setNewURL(name.trim().replace(/\s+/g, "-").toLowerCase());
    }
  };

  
  const checkForChanges = (oldVariants, newVariants) => {
    if (oldVariants.length !== newVariants.length) {
      return true; // If the number of variants has changed
    }
  
    for (let i = 0; i < oldVariants.length; i++) {
      const oldVariant = oldVariants[i];
      const newVariant = newVariants[i];
  
      // Check each field to see if it differs
      if (
        oldVariant.Variant !== newVariant.Variant ||
        oldVariant.thumbnail !== newVariant.thumbnail ||
        oldVariant.stock !== parseInt(newVariant.stock) || // Convert stock to number if it's a string
        oldVariant.price !== parseFloat(newVariant.price) || // Convert price to number
        oldVariant.SKU !== newVariant.SKU ||
        oldVariant.isAvailable !== newVariant.isAvailable
      ) {
        return true; // Return true if any field differs
      }
    }
  
    return false; // Return false if no differences found
  };

  const handleCancel = () => {
    const hasChanges = checkForChanges(Item.variants, Variants); // Compare arrays
    const hasMainChanges = 
    prodName !== Item.itemName ||
    prodDesc !== Item.itemDescription ||
    prodThumbnail !== Item.thumbnail ||
    itemCategory.Type !== Item.type ||
    itemCategory.Category !== Item.category ||
    prodBrand !== Item.brand;

    console.log(value)
    console.log(Item.itemSpecifications)
    if (hasChanges || hasMainChanges) {
      if (window.confirm("You have unsaved changes. Do you really want to cancel?")) {
        // Logic to cancel changes
        console.log("Changes canceled.");
      } else {
        // Do nothing, stay on the form
        console.log("Continue editing.");
      }
    } else {
      // No changes, so just cancel
      console.log("No changes detected, canceling.");
    }
  };
  



  let columns = [
    {
      title: "",
      dataIndex: "thumbnail",
      key: "varThumbnail",
      width: 60,
      fixed: "left",
      render: (text, record, index) => (
        <div className={`flex items-center w-[96px]}`}>
          {text == "" ? (
            <div className="w-[60px] h-[60px] rounded-xl border-2 border-dashed border-slate-200">
              <p className="flex items-center justify-center text-slate-300 text-5xl">
                +
              </p>
            </div>
          ) : (
            <img src={text} className="w-[60px]" />
          )}
          <Popover
            content={
              <>
                <Input
                  value={text}
                  onChange={(e) =>
                    handleVariantChange(index, "thumbnail", e.target.value)
                  }
                />
              </>
            }
            title="Add/Edit Thumbnail"
            trigger="click"
          >
            <Button type="text" icon={<EditOutlined />} />
          </Popover>
        </div>
      ),
    },
    {
      title: "Variant",
      dataIndex: "Variant",
      width: 100,
      key: "Var",
      render: (text, record, index) => (
        <Input
          type="text"
          value={text}
          onChange={(e) =>
            handleVariantChange(index, "Variant", e.target.value)
          }
        />
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      width: 150,
      key: "price",
      render: (text, record, index) => (
        <Input
          addonAfter="Rs"
          type="Number"
          value={text}
          onChange={(e) => handleVariantChange(index, "price", e.target.value)}
        />
      ),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      width: 100,
      render: (text, record, index) => (
        <Input
          type="Number"
          value={text}
          onChange={(e) => handleVariantChange(index, "stock", e.target.value)}
        />
      ),
    },
    {
      title: "SKU",
      dataIndex: "SKU",
      key: "SKU",
      width: 100,
      render: (text, record, index) => (
        <p>{text}</p>
      ),
    },
    {
      title: "Status",
      width: 60,
      dataIndex: "isOOS",
      key: "isOOS",
      render: (text, record, index) => (
        <>
        <Tag color={record.isOOS ? 'red':'green'}>{record.isOOS ? 'Sold Out':'In Stock'}</Tag>
        </>
      ),
    },
    {
      title: "Available",
      width: 60,
      dataIndex: "",
      key: "Available",
      render: (text, record, index) => (
        <Switch
          defaultChecked={record.isAvailable}
          checked={record.isAvailable}
          onChange={(e) =>
            handleVariantChange(index, "isAvailable", !record.isAvailable)
          }
        />
      ),
    },
    {
      title: "",
      width: 45,
      dataIndex: "",
      fixed: "right",
      key: "",
      render: (text, record, index) => (
        <Popconfirm
          title="Delete the variant"
          description="Are you sure to delete this variant?"
          onConfirm={() => confirm(index)}
          onCancel={cancel}
          okText="Yes"
          cancelText="No"
        >
          <Button danger type="primary" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  function checkImageFile(file){
    if(file.type !== "image/webp"){
      toast.error("Invalid format. Upload WEBP images only")
      return
    }
    if(file.size /1024/1024 > 2 ){
      toast.error("Invalid file size. Max 2MB")
      return
    }

    setUploadImage(file);
  }
  const validateImageUrl = () => {
    // Regular expression to check if the URL is valid
    const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+.*)$/;
    // List of common image extensions
    const imageExtensions = [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "bmp",
      "svg",
      "webp",
      "tiff",
      "ico",
    ];
    const input = productThumbnailRef.current.input.value;
    // Check if the text matches the URL regex
    if (!urlRegex.test(input)) {
      setIsError(true);
      return;
    }

    // Extract the file extension from the URL
    const extension = input.split(".").pop().toLowerCase();

    // Check if the extension is in the list of image extensions
    if (!imageExtensions.includes(extension)) {
      setIsError(true);
      return;
    }
    setProdThumbnail(input);
    console.log(input);
    setIsError(false);
  };

  function addVariant() {
   const s = generateUniqueSKU();
    if(editingProd){
      const varData = {
        thumbnail: "",
        Variant: "",
        SKU:s,
        Stock: 0,
        Price: 0,
        isAvailable: true,
      };
      setVariants((prev) => [...prev, varData]);
    }else{
      const varData = {
        thumbnail: "",
        Variant: "",
        Stock: 0,
        Price: 0,
        isAvailable: true,
      };
      setVariants((prev) => [...prev, varData]);
    }
  }

  async function onSubmit() {
    setIsSubmit(true);
    console.log(Item);
    if(!editingProd){
      
    try {
      const data = await axiosPrivate.post(
        "/admin/add-item",
        {
          itemName: prodName,
          description: prodDesc,
          specifications: value,
          url: newURL,
          thumbnail: prodThumbnail,
          variants: Variants,
          brand:prodBrand,
          type: itemCategory.Type,
          category: itemCategory.Category,
        },
        {
          headers: {
            Authorization: auth.token,
            "Content-Type": "application/json",
          },
          withCredentials:true
        }
      );
      console.log(data.data.message);
      toast.success(data.data.message);
      setSearchParams({ad:'products'})
      setIsSubmit(false);
    } catch (err) {
      toast.error(err.response.data.message);
      setIsSubmit(false);
    }
 
  }else{
    try{
      const response = await axiosPrivate.put('/admin/updateItem', {
        itemName: prodName,
        itemID:Item.itemID,
        description: prodDesc,
        specifications: value,
        url: newURL,
        thumbnail: prodThumbnail,
        variants: Variants,
        brand:prodBrand,
        type: itemCategory.Type,
        category: itemCategory.Category,
      }, {
        headers: {
          Authorization: auth.token,
          "Content-Type": "application/json",
        },
        withCredentials:true
      })
      console.log(response.data)
      toast.success('Changes Saved.')
      setIsSubmit(false);
      setSearchParams({ad:'products'})
    }catch(err){
      console.log(err)
      toast.error(err.response.data.message)
      setIsSubmit(false);
    }
    }
   
  }

  async function uploadImageServer(req, res) {
    const formData = new FormData();
    formData.append('file', uploadImage);  // Assuming uploadImage is the selected file
  
    try {
      const response = await axiosPrivate.post('/admin/upload', formData, {
        headers: {
          'Authorization': auth.token,
          'Content-Type': 'multipart/form-data', // Correct content-type for file uploads
        },
        withCredentials: true
      });
      toast.success(response.data.message);
      setProdThumbnail(response.data.fileUrl)
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-semibold">Basic Information</h1>
          <div className="flex flex-col md:flex-row gap-3 mt-3 items-center md:items-start md:justify-center">
            <div className="text-center flex flex-col gap-1">

            <div className="mt-5">
              <Popover
                content={
                  <>
                    <Input
                      placeholder="paste image link here..."
                      ref={productThumbnailRef}
                      onChange={() => validateImageUrl()}
                    />{" "}
                    <p
                      className={`${isError ? "block" : "hidden"} text-red-700`}
                      >
                      Invalid Image URL
                    </p>
                  </>
                }
                title="Add/Change Thumbnail"
                trigger="click"
                open={open}
                onOpenChange={handleOpenChange}
                >
                <div className="w-[150px] h-[150px] flex justify-center items-center border-2 hover:cursor-pointer border-slate-100 rounded-xl">
                  {prodThumbnail == "" ? (
                    <p className="font-Bebas text-8xl text-slate-500">+</p>
                  ) : (
                    <img
                    src={prodThumbnail}
                    alt={
                      prodName + "'s thumbnail"
                    }
                    />
                  )}
                </div>
              </Popover>
            </div> 
            <Upload accept="image/webp" showUploadList={false} customRequest={uploadImageServer} beforeUpload={(file)=>checkImageFile(file)}><Button>Upload Image</Button></Upload>
              </div>
            <div className="flex flex-col gap-2">
              <Label>Product Name</Label>
              <Input
                disabled={isSubmit}
                value={prodName}
                onChange={(e) => {
                  setProdName(e.target.value)
                  formatName(e.target.value)}}
              />
              <Label>Product URL</Label>
              <Space.Compact style={{ width: "100%" }}>
                <Input
                  disabled={!CustomUrl || isSubmit}
                  value={newURL}
                  onChange={(e) => setNewURL(e.target.value)}
                />
                <Button
                  disabled={isSubmit}
                  onClick={() => setCustomUrl((prev) => !prev)}
                  type="primary"
                >
                  Custom
                </Button>
              </Space.Compact>
              <Label>Product Description</Label>
              <Input disabled={isSubmit} value={prodDesc} onChange={(e)=>setProdDesc(e.target.value)} />
              <Label>Product Brand</Label>
              <Input disabled={isSubmit} value={prodBrand} onChange={(e)=>setProdBrand(e.target.value)} />
              <Label>Category</Label>
              <div className="w-[500px]">
                <Dropdown.Button
                  disabled={isSubmit}
                  menu={{ items: cats, onClick: handleClick, selectable: true }}
                  trigger={["click"]}
                  arrow={{ pointAtCenter: true }}
                  placement="bottomLeft"
                  loading={isLoading}
                >
                  {selectedLabel}
                </Dropdown.Button>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Variants</h1>
          <div className="mt-5">
            <div className="flex justify-end mb-2">
              <Button
                disabled={isSubmit}
                type="primary"
                onClick={() => addVariant()}
              >
                Add Variant
              </Button>
            </div>
            <div>
              <Table
                disabled={isSubmit}
                scroll={{ x: 1000, y: 300 }}
                columns={columns}
                dataSource={Variants}
                rowClassName={(record,index)=>{ return record.isOOS ? 'bg-red-50':'' }}
              />
            </div>
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Description</h1>
          <div className="mt-3 border-2 rounded-xl lg:w-[800px] md:w-[600px] sm:w-[400px]">
            <TestingEditor value={value} onChange={(newValue) => setValue(newValue)} ref={childSaveContentRef}/>
          </div>
        </div>

        <div className="flex justify-end">
          <Space.Compact>
            <Button disabled={isSubmit} onClick={()=>handleCancel()}>Cancel</Button>
            <Button
              loading={isSubmit}
              type="primary"
              onClick={() => onSubmit()}
            >
              Save
            </Button>
          </Space.Compact>
        </div>
      </div>
    </>
  );
}

export default AddProduct;
