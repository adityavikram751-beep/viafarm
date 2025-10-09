import React from "react";
import Topbar from "../manageapp/Topbar";
import ManageApp from "../manageapp/ManageApp";



function Page() {
  return (
    <div className="p-6 space-y-1 border-2">
      
      
      <Topbar /> 
      <div className="mt-4">
        <ManageApp/>
        
      
           
      </div>
    </div>
  );
}

export default Page;
