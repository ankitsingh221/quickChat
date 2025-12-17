import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { XIcon } from "lucide-react";

function ChatHeader() {
  const { selectedUser, setSelectedUser } = useChatStore();

  useEffect( () =>{
    const handleEscKey = (e) =>{
      if(e.key === "Escape") setSelectedUser(null);
    }
    window.addEventListener("keydown", handleEscKey);
    return() =>{
      window.removeEventListener("keydown", handleEscKey);
    }
  }, [setSelectedUser]);

  return (
    <div className="flex justify-between items-center bg-slate-800/50  border-b border-slate-700/50  max-h-[80px] px-6 flex-1">
      <div className=" flex items-center  gap-3">
        <div className=" avatar online">
          <div className="w-12 h-12 rounded-full border-2 overflow-hidden">
            <img
              src={selectedUser?.profilePic || "/avatar.png"}
              alt={selectedUser?.fullName}
            />
          </div>
        </div>
        <div>
          <h3 className=" text-slate-200 font-semibold text-lg">
            {selectedUser?.fullName}
          </h3>
          <div className=" text-sm text-slate-400">Online</div>
        </div>
      </div>
      <button>
        <XIcon
          onClick={() => setSelectedUser(null)}
          className=" text-slate-400 hover:text-slate-200 cursor-pointer"
        />
      </button>
    </div>
  );
}

export default ChatHeader;
