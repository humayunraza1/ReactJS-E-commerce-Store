import { Fragment, useEffect, useState } from 'react'
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
  Transition,
} from '@headlessui/react'
import {
  ArrowPathIcon,
  Bars3Icon,
  ChartPieIcon,
  CursorArrowRaysIcon,
  FingerPrintIcon,
  SquaresPlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { ChevronDownIcon, PhoneIcon, PlayCircleIcon } from '@heroicons/react/20/solid'
import DarkSwitch from './DarkSwitch'
import useGeneral from '../hooks/useGeneral'
import { axiosPrivate } from '../api/axios'
import useAuth from '../hooks/useAuth'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import useLogout from '../hooks/useLogout'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import AvatarComp from './Avatar'
import CustomPopOver from './CustomPopOver'
import Cart from './Cart'

const products = [
  { name: 'Analytics', description: 'Get a better understanding of your traffic', href: '#', icon: ChartPieIcon },
  { name: 'Engagement', description: 'Speak directly to your customers', href: '#', icon: CursorArrowRaysIcon },
  { name: 'Security', description: 'Your customers’ data will be safe and secure', href: '#', icon: FingerPrintIcon },
  { name: 'Integrations', description: 'Connect with third-party tools', href: '#', icon: SquaresPlusIcon },
  { name: 'Automations', description: 'Build strategic funnels that will convert', href: '#', icon: ArrowPathIcon },
]
const callsToAction = [
  { name: 'Watch demo', href: '#', icon: PlayCircleIcon },
  { name: 'Contact sales', href: '#', icon: PhoneIcon },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useLogout();
  const axiosPrivate = useAxiosPrivate();
  
    const {darkMode,isLoggedIn,wishlist,setWishlist,setCart,cart} = useGeneral();
    const {auth,setAuth} = useAuth(); 
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [details, setDetails] = useState({Name:"",Email:"" ,Role:""})
  async function getwishlist(){
    try{

      const response = await axiosPrivate.get('/users/getwishlist',{
        headers:{
          'Authorization':auth.token,
          'Content-Type':'application/json'
        }
      })
      console.log(response.data);
      if(response.data.items == []){
       return setWishlist([])
      }
      console.log(response.data)
      setWishlist(response.data.wishlist.items)
    }catch(err){
      console.log(err);
    }
    }

async function getCart(){
  try{
    const response = await axiosPrivate.get('/users/getcart',{
      headers:{
        'Authorization':auth.token,
        'Content-Type': 'application/json'
      }
    })
    setCart(response.data.cart)
  }catch(err){
    console.log(err)
  }
}

async function getDetails(){
  try{
    const response = await axiosPrivate.get('/users/dashboard',{
      headers:{'Content-Type': 'application/json',
      'Authorization' : auth.token
    },
    withCredentials:true      
  })
  
  const data = response.data
  setDetails({Name: data.user.name, Email: data.user.email, Role: data.user.role})
  // console.log(data);
}catch(err){
  console.log(err)
  setAuth({user:{}, token:""});
}
}
async function signout(){
  await logout();
  navigate('/');
}
useEffect(()=>{
  if(auth.token !== ""){
  getDetails()
  getwishlist()
  getCart()
  }
},[auth])


  return (
    <header className={darkMode ? 'bg-black':'bg-white'}>
      <nav className={`mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8`} aria-label="Global">
        <div className="flex lg:flex-1">
          <a href="#" className="-m-1.5 p-1.5">
            <span className="sr-only">Your Company</span>
            <img className="h-8 w-auto" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600" alt="" />
          </a>
          <DarkSwitch/>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <PopoverGroup className={`${darkMode ? 'text-white':'text-black'} hidden lg:flex lg:gap-x-12`}>
          <Popover className="relative">
            <PopoverButton className="flex items-center gap-x-1 text-sm font-semibold leading-6">
              Product
              <ChevronDownIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
            </PopoverButton>

            <Transition
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <PopoverPanel className={`absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl shadow-lg ring-1 ring-gray-900/5 ${darkMode ? 'bg-slate-900':'bg-white'}`}>
                <div className="p-4">
                  {products.map((item) => (
                    <div
                      key={item.name}
                      className={`group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 ${darkMode ? 'hover:bg-slate-700':'hover:bg-gray-50'}`}
                    >
                      <div className={`flex h-11 w-11 flex-none items-center justify-center rounded-lg ${darkMode ? 'bg-black':'bg-gray-50'} ${darkMode ? 'group-hover:bg-slate-800':'group-hover:bg-white'}`}>
                        <item.icon className={`${darkMode ? 'text-white':'text-gray-600'} h-6 w-6 group-hover:text-indigo-600" aria-hidden="true`} />
                      </div>
                      <div className="flex-auto">
                        <a href={item.href} className="block font-semibold">
                          {item.name}
                          <span className="absolute inset-0" />
                        </a>
                        <p className={`mt-1 ${darkMode ? 'text-slate-200':'text-gray-600'}`}>{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={`grid grid-cols-2 divide-x divide-gray-900/5 ${darkMode ? 'text-white':'text-gray-900'}`}>
                  {callsToAction.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="flex items-center justify-center gap-x-2.5 p-3 text-sm font-semibold leading-6 hover:bg-gray-100"
                    >
                      <item.icon className={`h-5 w-5 flex-none ${darkMode ? 'text-white':'text-gray-400'}`} aria-hidden="true" />
                      {item.name}
                    </a>
                  ))}
                </div>
              </PopoverPanel>
            </Transition>
          </Popover>

          <a href="#" className="text-sm font-semibold leading-6">
            Features
          </a>
          <a href="#" className="text-sm font-semibold leading-6 ">
            Marketplace
          </a>
          <a href="#" className="text-sm font-semibold leading-6">
            Company
          </a>
        </PopoverGroup>
        <Cart/>
<div className={`hidden lg:flex lg:flex-1 lg:justify-end ${darkMode ? 'text-white':'text-black'}`}>
{ isLoggedIn  ?     <div><PopoverGroup className={`${darkMode ? 'text-white':'text-black'} hidden lg:flex lg:gap-x-12`}>
      <Popover className="relative" >
          <PopoverButton className="flex items-center gap-x-1 text-sm font-semibold leading-6"> 
           <AvatarComp/>
          </PopoverButton>

        <Transition 
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
        >
          <PopoverPanel className={`absolute ${darkMode ? 'text-white':'text-black'} -left-8 top-full z-10 mt-3 w-[250px] overflow-hidden rounded-3xl shadow-lg ring-1 ring-gray-900/5 ${darkMode ? 'bg-slate-900':'bg-white'}`} anchor="bottom" >
          <div className="p-4">
                
                    <div
                      key="Dashboard"
                      className={`group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 ${darkMode ? 'hover:bg-slate-700':'hover:bg-gray-50'}`}
                    >
                      {/* <div className={`flex h-11 w-11 flex-none items-center justify-center rounded-lg ${darkMode ? 'bg-black':'bg-gray-50'} ${darkMode ? 'group-hover:bg-slate-800':'group-hover:bg-white'}`}>
                        <item.icon className={`${darkMode ? 'text-white':'text-gray-600'} h-6 w-6 group-hover:text-indigo-600" aria-hidden="true`} />
                      </div> */}
                      <div className="flex-auto">
                        <a href="/dashboard" className="block font-semibold">
                          Dashboard
                          <span className="absolute inset-0" />
                        </a>
                      </div>
                    </div>
                    <div
                      key="Order History"
                      className={`group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 ${darkMode ? 'hover:bg-slate-700':'hover:bg-gray-50'}`}
                    >
                      {/* <div className={`flex h-11 w-11 flex-none items-center justify-center rounded-lg ${darkMode ? 'bg-black':'bg-gray-50'} ${darkMode ? 'group-hover:bg-slate-800':'group-hover:bg-white'}`}>
                        <item.icon className={`${darkMode ? 'text-white':'text-gray-600'} h-6 w-6 group-hover:text-indigo-600" aria-hidden="true`} />
                      </div> */}
                      <div className="flex-auto">
                        <a href="/dashboard?tab=order-history" className="block font-semibold">
                          Order History
                          <span className="absolute inset-0" />
                        </a>
                      </div>
                    </div>
                    <div
                      key="Logout"
                      className={`group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 ${darkMode ? 'hover:bg-slate-700':'hover:bg-gray-50'}`}
                    >
                      {/* <div className={`flex h-11 w-11 flex-none items-center justify-center rounded-lg ${darkMode ? 'bg-black':'bg-gray-50'} ${darkMode ? 'group-hover:bg-slate-800':'group-hover:bg-white'}`}>
                        <item.icon className={`${darkMode ? 'text-white':'text-gray-600'} h-6 w-6 group-hover:text-indigo-600" aria-hidden="true`} />
                      </div> */}
                      <div className="flex-auto">
                        <a href="#" onClick={()=>signout()} className="block font-semibold">
                          Logout
                          <span className="absolute inset-0" />
                        </a>
                      </div>
                    </div>
                
                
                </div>
          </PopoverPanel>

        </Transition>

      </Popover>
    </PopoverGroup></div>   :         <a onClick={()=>navigate('/login')} className="text-sm font-semibold leading-6">
            Log in <span aria-hidden="true">&rarr;</span>
          </a>
          }
        </div>
        
      </nav>
      <Dialog className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-10" />
        <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <img
                className="h-8 w-auto"
                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                alt=""
              />
            </a>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                <Disclosure as="div" className="-mx-3">
                  {({ open }) => (
                    <>
                      <DisclosureButton className="flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                        Product
                        <ChevronDownIcon
                          className={classNames(open ? 'rotate-180' : '', 'h-5 w-5 flex-none')}
                          aria-hidden="true"
                        />
                      </DisclosureButton>
                      <DisclosurePanel className="mt-2 space-y-2">
                        {[...products, ...callsToAction].map((item) => (
                          <DisclosureButton
                            key={item.name}
                            as="a"
                            href={item.href}
                            className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                          >
                            {item.name}
                          </DisclosureButton>
                        ))}
                      </DisclosurePanel>
                    </>
                  )}
                </Disclosure>
                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  Features
                </a>
                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  Marketplace
                </a>
                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  Company
                </a>
              </div>
              <div className="py-6">
                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  Log in
                </a>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  )
}
