import React from "react";
import Topbar from "./Topbar"; 
import ProductTable from "./ProductTable";

function Page() {
  return (
    <div className="p-6 space-y-1 border-2">
      
      
      <Topbar /> 
      <div className="mt-4">
        <ProductTable/>
           
      </div>
    </div>
  );
}

export default Page;
