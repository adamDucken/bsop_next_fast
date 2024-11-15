// pages/index.js

import BSOP from "@/components/bsop";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen">
    <div className="fixed top-0 right-0 p-4">
      <ModeToggle />
    </div>
      <div>
        <BSOP/>
      </div>    
    </div>
  );
}




