import { Popover, PopoverButton, PopoverGroup, PopoverPanel, Transition } from "@headlessui/react";
import useGeneral from "../hooks/useGeneral";

function CustomPopOver ({children, products=[], width="250px", position="bottom"}) {
  const {darkMode} = useGeneral();
  return (
    <PopoverGroup className={`${darkMode ? 'text-white':'text-black'} hidden lg:flex lg:gap-x-12`}>
      <Popover className="relative" >
          <PopoverButton className="flex items-center gap-x-1 text-sm font-semibold leading-6"> 
            {children}
          </PopoverButton>

        <Transition 
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
        >
          <PopoverPanel className={`absolute ${darkMode ? 'text-white':'text-black'} -left-8 top-full z-10 mt-3 w-[${width}] overflow-hidden rounded-3xl shadow-lg ring-1 ring-gray-900/5 ${darkMode ? 'bg-slate-900':'bg-white'}`} anchor={position} >
          <div className="p-4">
                  {products.map((item) => (
                    <div
                      key={item.name}
                      className={`group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 ${darkMode ? 'hover:bg-slate-700':'hover:bg-gray-50'}`}
                    >
                      {/* <div className={`flex h-11 w-11 flex-none items-center justify-center rounded-lg ${darkMode ? 'bg-black':'bg-gray-50'} ${darkMode ? 'group-hover:bg-slate-800':'group-hover:bg-white'}`}>
                        <item.icon className={`${darkMode ? 'text-white':'text-gray-600'} h-6 w-6 group-hover:text-indigo-600" aria-hidden="true`} />
                      </div> */}
                      <div className="flex-auto">
                        <a href="#" onClick={()=>item.func} className="block font-semibold">
                          {item.name}
                          <span className="absolute inset-0" />
                        </a>
                        <p className={`mt-1 ${darkMode ? 'text-slate-200':'text-gray-600'}`}>{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
          </PopoverPanel>

        </Transition>

      </Popover>
    </PopoverGroup>
  )
};

export default CustomPopOver;
