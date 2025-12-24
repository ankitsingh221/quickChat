import { useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { X, Settings, ShieldAlert, Loader2 } from "lucide-react";
import toast from "react-hot-toast"; // Ensure toast is imported

function GroupSettingsModal({ group, onClose }) {
  // 1. Initialize state safely
  const [settings, setSettings] = useState({
    onlyAdminsCanSend: group?.settings?.onlyAdminsCanSend ?? false,
    onlyAdminsCanEditGroupInfo: group?.settings?.onlyAdminsCanEditGroupInfo ?? false,
  });

  const { updateGroupInfo, isUpdatingGroup } = useChatStore();

  const handleSaveSettings = async () => {
    // Send the nested settings object to match backend expectations
    const success = await updateGroupInfo(group._id, { settings });
    if (success) {
      toast.success("Settings updated successfully");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col transition-all">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
                <Settings className="text-cyan-400 size-5" />
            </div>
            <h2 className="text-lg font-bold text-white">Group Settings</h2>
          </div>
          <button 
            onClick={onClose} 
            disabled={isUpdatingGroup}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Switch 1: Messaging */}
          <div className="flex items-center justify-between group cursor-pointer" 
               onClick={() => setSettings(p => ({...p, onlyAdminsCanSend: !p.onlyAdminsCanSend}))}>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-slate-200">Send Messages</p>
              <p className="text-[11px] text-slate-500">Only admins can send messages</p>
            </div>
            
            {/* WhatsApp Style Toggle */}
            <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${settings.onlyAdminsCanSend ? 'bg-cyan-500' : 'bg-slate-700'}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${settings.onlyAdminsCanSend ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </div>

          {/* Switch 2: Group Info */}
          <div className="flex items-center justify-between group cursor-pointer"
               onClick={() => setSettings(p => ({...p, onlyAdminsCanEditGroupInfo: !p.onlyAdminsCanEditGroupInfo}))}>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-slate-200">Edit Group Info</p>
              <p className="text-[11px] text-slate-500">Only admins can change name & pic</p>
            </div>
            
            <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${settings.onlyAdminsCanEditGroupInfo ? 'bg-cyan-500' : 'bg-slate-700'}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${settings.onlyAdminsCanEditGroupInfo ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-2xl flex gap-3">
             <ShieldAlert className="text-amber-500 shrink-0" size={18} />
             <p className="text-[10px] text-amber-200/60 leading-relaxed">
               Admins always have full permissions. These settings only restrict regular members.
             </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/50 flex items-center gap-3">
          <button 
            onClick={handleSaveSettings} 
            disabled={isUpdatingGroup} 
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-xl text-sm font-bold transition-all shadow-lg shadow-cyan-500/10 active:scale-95 disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
          >
            {isUpdatingGroup ? (
                <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Saving...</span>
                </>
            ) : (
                "Apply Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GroupSettingsModal;