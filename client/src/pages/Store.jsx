import React, { useContext, useEffect, useState } from "react"
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ProductsTable from "../components/ProductsTable";
function Store () {

  return (

    <>
    <Navbar/>
    <ProductsTable>
      <Hero/>
    </ProductsTable>
    </>
  )
};

export default Store;
