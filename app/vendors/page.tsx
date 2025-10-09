import React from "react";
import Topbar from "./Topbar"; 
import VendorsTable from "../vendors/VendorsTable";

function Page() {
  return (
    <div className="p-6 space-y-1 border-2">
      
      
      <Topbar /> 
      <div className="mt-4">
      <VendorsTable/>
           
      </div>
    </div>
  );
}

export default Page;
