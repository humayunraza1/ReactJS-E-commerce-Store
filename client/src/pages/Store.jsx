import React, { useContext, useEffect, useState } from "react"
import useLogout from "../hooks/useLogout";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import Design from "../components/Design";
function Store () {
  return (

    <>
    <Design/>
    </>
  )
};

export default Store;
