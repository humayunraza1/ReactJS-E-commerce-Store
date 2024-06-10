import React from "react"
import { Link, useNavigate } from "react-router-dom";


function Unauthorized () {
  const navigate = useNavigate();
  function goBack(){ navigate(-1)}

  return (
    <div>
      You are not authorized to be here
      <Link onClick={goBack}>Go Back</Link>
    </div>
  )
};

export default Unauthorized;
