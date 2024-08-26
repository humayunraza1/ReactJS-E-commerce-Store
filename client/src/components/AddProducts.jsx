import React, { useEffect, useState } from "react"
import { axiosPrivate } from "../api/axios";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable
  } from "@tanstack/react-table"
  import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
  
  import { Button } from "../components/ui/button"
  import { Label } from "../components/ui/label"
  import { Checkbox } from "../components/ui/checkbox"
  import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
  } from "../components/ui/dropdown-menu"
  import { Input } from "../components/ui/input"
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
  } from "../components/ui/table"
  
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "../components/ui/dialog"
  

  let data = []
function AddProducts () {
    const [Selected,setSelected] = useState({});
    const [sorting, setSorting] = useState([])
    const [Open,setOpen] = useState(false);
    const [columnFilters, setColumnFilters] = useState([])
    const [columnVisibility, setColumnVisibility] = useState({})
    const [rowSelection, setRowSelection] = useState({})
    useEffect(()=>{
        getProducts();
    },[])


const columns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: "thumbnail",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
        >
        </Button>
      )
    },
    cell: ({ row }) => <div>
        <img className="w-[32px]" src={row.getValue("thumbnail")} alt={row.getValue("itemName")+" "+row.getValue("variant")}/>
        </div>
  },
  {
    accessorKey: "itemName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Product Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.getValue("itemName")}</div>
  },
  {
    accessorKey: "variant",
    header: () => {
      return (
        <div
        >
            Variant
        </div>
      )
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("variant")}</div>
  },
  {
    accessorKey: "SKU",
    header: () => {
      return (
        <div
        >
            SKU
        </div>
      )
    },
    cell: ({ row }) => <div>{row.getValue("SKU")}</div>
  },
  {
    accessorKey: "price",
    header: ({column}) => {return (<Button
    variant="ghost"
    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  >
    Price
    <ArrowUpDown className="ml-2 h-4 w-4" />
  </Button>)},
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price"))

      // Format the amount as a dollar amount
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "PKR"
      }).format(amount)

      return <div className="font-medium">{formatted}</div>
    }
  },
  {
    accessorKey: "stock",
    header: ({column}) => {return (<Button
    variant="ghost"
    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  >
    Stock
    <ArrowUpDown className="ml-2 h-4 w-4" />
  </Button>)},
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("stock"))
      return <div className="font-medium text-center">{amount}</div>
    }
  },
  {
    accessorKey: "isOOS",
    header: () => {
      return (
        <div
        >
            Instock
        </div>
      )
    },
    cell: ({ row }) => <div>{row.getValue("isOOS") ? 'No':'Yes'}</div>
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const item = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
            onClick={()=>{setOpen(true); setSelected(item)}}
            >
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]


    async function getProducts(){
        const response = await axiosPrivate.get('/users/products',{
          headers:{
            'Content-Type':'application/json'
          }
        });
        const ldata = response.data.products;
        data = ldata.flatMap((prod, index) => 
          prod.variants.map((item, i) => 
           {return ({itemName: prod.itemName, itemID:prod.itemID, variant:item.Variant,price:item.price,thumbnail:item.thumbnail, SKU:item.SKU,stock:item.stock,isOOS:item.isOOS})
          })
        );
        console.log("data: ",data)
        
      }

      const table = useReactTable({
        data,
         columns,
         onSortingChange: setSorting,
         onColumnFiltersChange: setColumnFilters,
         getCoreRowModel: getCoreRowModel(),
         getPaginationRowModel: getPaginationRowModel(),
         getSortedRowModel: getSortedRowModel(),
         getFilteredRowModel: getFilteredRowModel(),
         onColumnVisibilityChange: setColumnVisibility,
         onRowSelectionChange: setRowSelection,
         onActionsClick:setOpen,
         state: {
            Open,
           sorting,
           columnFilters,
           columnVisibility,
           rowSelection
         }
       })

  return (
    <>
<div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Search wishlist..."
          value={table.getColumn("itemName")?.getFilterValue() ?? ""}
          onChange={event =>
            table.getColumn("itemName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter(column => column.getCanHide())
              .map(column => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={value => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={row.original.isOOS && 'bg-red-100'}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
    <Dialog open={Open} onOpenChange={()=>setOpen(false)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Product</DialogTitle>
    </DialogHeader>
    <div>
        <img src={Selected.thumbnail} alt={Selected.itemName}/>
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Product Name
            </Label>
            <Input id="Item Name" value={Selected.itemName} className="col-span-3" />
          </div>
  </DialogContent>
</Dialog>

    </>

  )
};

export default AddProducts;





