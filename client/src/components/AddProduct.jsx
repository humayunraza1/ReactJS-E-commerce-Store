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
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import {$generateHtmlFromNodes} from '@lexical/html'
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
import {
  EditorState,
  RichUtils,
  AtomicBlockUtils,
  convertToRaw,
} from "draft-js";
import "draft-js/dist/Draft.css";
import "./css/editor2.css";
import RichTextEditor from "./RichTextEditor";
import Editor2 from "./Editor2";
import TestingEditor from "./TestingEditor";

const { TextArea } = Input;
let cats = [];

function AddProduct() {
  const [isLoading, setLoading] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const editorRef = useRef(null);
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isItalicActive, setIsItalicActive] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("Select Category");
  const [prodThumbnail, setProdThumbnail] = useState("");
  const [Variants, setVariants] = useState([
    { thumbnail: "", Variant: "", stock: 0, price: 0, isAvailable: true },
  ]);
  const productNameRef = useRef("");
  const productThumbnailRef = useRef("");
  const [isError, setIsError] = useState(false);
  const { auth } = useAuth();
  const productBrandNameRef = useRef("");
  const [CustomUrl, setCustomUrl] = useState(false);
  const [newURL, setNewURL] = useState("");
  const productDescRef = useRef("");
  const [itemCategory, setItemCategory] = useState({ Category: "", Type: "" });
  const [selectedKey, setSelectedKey] = useState([""]);
  const [Categories, setCategories] = useState([
    { key: "", label: "", children: [{ key: "", label: "" }] },
  ]);

  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  // Function to handle text style changes (bold, italic, etc.)
  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  // Function to toggle inline styles (Bold, Italic)
  // Function to toggle inline styles (Bold, Italic)
  const toggleInlineStyle = (style) => {
    const selection = editorState.getSelection();
    // Check if there's a current selection or text is about to be typed
    const isCollapsed = selection.isCollapsed();

    // If there’s no text selected (collapsed selection), apply style for future typing
    if (isCollapsed) {
      // Apply the style for the typing position
      const currentStyle = editorState.getCurrentInlineStyle();

      // If the style is already active, remove it; otherwise, add it
      console.log(currentStyle.has(style));
      console.log(style);
      console.log(editorState.getCurrentInlineStyle());
      const newEditorState = currentStyle.has(style)
        ? RichUtils.toggleInlineStyle(editorState, style) // Remove style
        : RichUtils.toggleInlineStyle(editorState, style); // Apply style
      console.log(currentStyle.has(style));

      setEditorState(newEditorState);
      setTimeout(() => editorRef.current.focus(), 0); // Delay focus slightly
      console.log(newEditorState);
    } else {
      // If text is selected, apply/remove the style for the selection
      setEditorState(RichUtils.toggleInlineStyle(editorState, style));
      setTimeout(() => editorRef.current.focus(), 0); // Delay focus slightly
    }
  };

  // Save content with styles as raw JSON
  const saveContent = () => {
    // const contentState = editorState.getCurrentContent();
    // const rawContent = convertToRaw(contentState);
    // // This is where you would send rawContent to your database
    // console.log("Saving content:", JSON.stringify(rawContent));
    // editor.update(() => {
    //   const htmlString = $generateHtmlFromNodes(editor);
    //   console.log(htmlString); // Store the HTML string in state
    // });
  };

  async function getData() {
    setLoading(true);
    try {
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
      setCategories(cats);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  }

  const handleVariantChange = (index, key, value) => {
    console.log(key);
    setVariants((prevVar) => {
      const updatedVariants = [...prevVar];
      updatedVariants[index] = {
        ...updatedVariants[index],
        [key]: value,
      };
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

  useEffect(() => {
    getData();
  }, []);

  const hide = () => {
    setOpen(false);
  };
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

  let columns = [
    {
      title: "",
      dataIndex: "thumbnail",
      key: "varThumbnail",
      width: 60,
      fixed: "left",
      render: (text, record, index) => (
        <div className="flex gap-2 items-center w-[96px]">
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
    const varData = {
      thumbnail: "",
      Variant: "",
      Stock: 0,
      Price: 0,
      isAvailable: true,
    };
    setVariants((prev) => [...prev, varData]);
  }

  async function onSubmit() {
    setIsSubmit(true);
    const contentState = editorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);

    try {
      const data = await axiosPrivate.post(
        "/admin/add-item",
        {
          itemName: productNameRef.current?.input?.value,
          description: productDescRef.current?.input?.value,
          url: newURL,
          thumbnail: prodThumbnail,
          variants: Variants,
          type: itemCategory.Type,
          category: itemCategory.Category,
        },
        {
          headers: {
            Authorization: auth.token,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(data.data.message);
      toast.success(data.data.message);
      setIsSubmit(false);
    } catch (err) {
      toast.error(err.response.data.message);
      setIsSubmit(false);
    }

    const prodDetails = {
      itemName: productNameRef.current?.input?.value,
      description: rawContent,
      url: newURL,
      thumbnail: prodThumbnail,
      variants: Variants,
      type: itemCategory.Type,
      category: itemCategory.Category,
    };
    console.log(prodDetails);
  }

  const handleUndo = () => {
    setEditorState(EditorState.undo(editorState));
  };

  // Redo functionality
  const handleRedo = () => {
    setEditorState(EditorState.redo(editorState));
  };

  // Function to handle image upload and insert into the editor
  const addImage = (url) => {
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      "IMAGE",
      "IMMUTABLE",
      { src: url }
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity,
    });
    setEditorState(
      AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, " ")
    );
  };

  // Custom Image component for rendering inside the editor
  const ImageComponent = (props) => {
    const { src } = props.contentState
      .getEntity(props.block.getEntityAt(0))
      .getData();
    return <img src={src} alt="Editor content" style={{ maxWidth: "100%" }} />;
  };

  // Custom block renderer for handling images
  const blockRendererFn = (contentBlock) => {
    if (contentBlock.getType() === "atomic") {
      return {
        component: ImageComponent,
        editable: false,
      };
    }
    return null;
  };
  const toggleBold = () => {
    setIsBoldActive((prev) => !prev);

    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      // Apply or remove bold for the selected text
      const newEditorState = RichUtils.toggleInlineStyle(editorState, "BOLD");
      setEditorState(newEditorState);
    }

    // No need to change the editor state here for future typing
    editorRef.current.focus();
  };

  // Toggle italic style
  const toggleItalic = () => {
    setIsItalicActive((prev) => !prev);

    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      // Apply or remove italic for the selected text
      const newEditorState = RichUtils.toggleInlineStyle(editorState, "ITALIC");
      setEditorState(newEditorState);
    }

    editorRef.current.focus();
  };

  // Apply active styles (for future typing)
  const applyActiveStyles = (editorState) => {
    let newEditorState = editorState;

    // Apply BOLD style if bold toggle is active
    if (isBoldActive) {
      if (!editorState.getCurrentInlineStyle().has("BOLD")) {
        newEditorState = RichUtils.toggleInlineStyle(newEditorState, "BOLD");
      }
    } else if (editorState.getCurrentInlineStyle().has("BOLD")) {
      // Remove BOLD if it's currently applied but toggle is off
      newEditorState = RichUtils.toggleInlineStyle(newEditorState, "BOLD");
    }

    // Apply ITALIC style if italic toggle is active
    if (isItalicActive) {
      if (!editorState.getCurrentInlineStyle().has("ITALIC")) {
        newEditorState = RichUtils.toggleInlineStyle(newEditorState, "ITALIC");
      }
    } else if (editorState.getCurrentInlineStyle().has("ITALIC")) {
      // Remove ITALIC if it's currently applied but toggle is off
      newEditorState = RichUtils.toggleInlineStyle(newEditorState, "ITALIC");
    }

    return newEditorState;
  };

  // Handle editor state changes and apply active styles
  const handleEditorChange = (newState) => {
    const newEditorState = applyActiveStyles(newState);
    setEditorState(newEditorState);
  };

  // Update toggle states based on selection
  const handleSelectionChange = () => {
    const currentStyle = editorState.getCurrentInlineStyle();
    setIsBoldActive(currentStyle.has("BOLD"));
    setIsItalicActive(currentStyle.has("ITALIC"));
  };

  return (
    <>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-semibold">Basic Information</h1>
          <div className="flex flex-col md:flex-row gap-3 mt-3 items-center md:items-start md:justify-center">
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
                        productNameRef.current?.input?.value + "'s thumbnail"
                      }
                    />
                  )}
                </div>
              </Popover>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Product Name</Label>
              <Input
                disabled={isSubmit}
                ref={productNameRef}
                onChange={() => formatName(productNameRef.current.input.value)}
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
              <Input disabled={isSubmit} ref={productDescRef} />
              <Label>Product Brand</Label>
              <Input disabled={isSubmit} ref={productBrandNameRef} />
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
              />
            </div>
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Description</h1>
          <div className="mt-3 border-2 rounded-xl lg:w-[800px] md:w-[600px] sm:w-[400px]">
            {/* <Space.Compact>
              <Toggle
                onPressedChange={toggleBold}
                pressed={isBoldActive}
                size="sm"
                aria-label="Toggle italic"
              >
                <BoldOutlined />
              </Toggle>
              <Toggle
                onPressedChange={toggleItalic}
                pressed={isItalicActive}
                size="sm"
                aria-label="Toggle italic"
              >
                <ItalicOutlined />
              </Toggle>
              <Button icon={<FileImageOutlined />} />
              <Button
                icon={<ItalicOutlined />}
                onClick={() => toggleInlineStyle("ITALIC")}
              >
                Italic
              </Button>
              <Button
                icon={<FontSizeOutlined />}
                onClick={() => toggleInlineStyle("BOLD")}
              >
                +
              </Button>
              <Button
                icon={<FontSizeOutlined />}
                onClick={() => toggleInlineStyle("BOLD")}
              >
                -
              </Button>
              <Button icon={<FontColorsOutlined />}>Change Color</Button>
              <Button icon={<UndoOutlined />} onClick={() => handleUndo()} />
              <Button icon={<RedoOutlined />} onClick={() => handleRedo()} />
              <button
                onClick={() => {
                  const url = window.prompt("Enter the URL of the image:");
                  if (url) addImage(url);
                }}
              >
                Add Image
              </button>
            </Space.Compact> */}
            {/* <TextArea showCount maxLength={2000} rows={16} autoSize={{ minRows: 16}} /> */}
            {/* <div className="editor border-2 border-slate-200 p-2 rounded-lg h-[500px] overflow-y-auto">
              <Editor
                editorState={editorState}
                handleKeyCommand={handleKeyCommand}
                onChange={(newState) => {
                  handleEditorChange(newState);
                  handleSelectionChange(); // Update toggles based on current selection
                }}
                blockRendererFn={blockRendererFn} // Handles rendering the image
                ref={editorRef}
              />
            </div> */}
            {/* <RichTextEditor/> */}
            <TestingEditor/>
          </div>
        </div>

        <div className="flex justify-end">
          <Space.Compact>
            <Button disabled={isSubmit}>Cancel</Button>
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
