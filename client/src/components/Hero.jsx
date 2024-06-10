import React from "react"

function Hero () {
  return (
    <div className="flex justify-center bg-white p-10 h-[60dvh]">
    <div className="grid grid-rows-6 sm:grid-rows-4 sm:row-span-4 grid-flow-row sm:grid-flow-col gap-2 row-gap-2 bg-white w-[70dvw]">
        <div className="row-span-2 sm:col-span-2 sm:row-span-4 bg-blue-200">Deal 1</div>
            <div className=" row-span-2  bg-green-200">Deal 2</div>
            <div className=" row-span-2  bg-cyan-200">Deal 3</div>
    </div>
    </div>
  )
};

export default Hero;
