import React, { useContext, useEffect, useState } from "react"
import useLogout from "../hooks/useLogout";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import Design from "../components/Design";
import Navbar from "../components/Navbar";
function Store () {
  return (

    <>
    <Navbar/>
    <Design/>
    </>
  )
};

export default Store;
