import React from "react";
import Settingspanel from "./Settingspanel";
 import Topbar from "../settings/Topbar";



function Page() {
  return (
     <div className="p-6 space-y-1 border-2">
      
      
      <Topbar /> 
       <div className="mt-4">
     <Settingspanel/>
           
       </div>
     </div>


  );
}

export default Page;
