import { useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { X, Settings, ShieldAlert, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

function GroupSettingsModal({ group, isCreator, onClose }) {

  const [settings, setSettings] = useState({
    onlyAdminsCanSend: group?.settings?.onlyAdminsCanSend ?? false,
    onlyAdminsCanEditGroupInfo: group?.settings?.onlyAdminsCanEditGroupInfo ?? true,
  });

  const { updateGroupInfo, isUpdatingGroup } = useChatStore();

  const handleSaveSettings = async () => {
    if (!isCreator) {
      return toast.error("Only the group creator can modify these settings");
    }

    const success = await updateGroupInfo(group._id, { settings });
    if (success) {
      toast.success("Settings updated successfully");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col transition-all">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Settings className="text-cyan-400 size-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Group Settings</h2>
          </div>
          <button 
            onClick={onClose} 
            disabled={isUpdatingGroup}
            className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Switch 1: Messaging */}
          <div 
            className="flex items-center justify-between group cursor-pointer" 
            onClick={() => setSettings(p => ({...p, onlyAdminsCanSend: !p.onlyAdminsCanSend}))}
          >
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-white/80">Send Messages</p>
              <p className="text-[11px] text-white/40">Only admins can send messages</p>
            </div>
            
            <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${settings.onlyAdminsCanSend ? 'bg-cyan-500' : 'bg-white/20'}`}>
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${settings.onlyAdminsCanSend ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </div>

          {/* Switch 2: Group Info */}
          <div 
            className="flex items-center justify-between group cursor-pointer"
            onClick={() => setSettings(p => ({...p, onlyAdminsCanEditGroupInfo: !p.onlyAdminsCanEditGroupInfo}))}
          >
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-white/80">Edit Group Info</p>
              <p className="text-[11px] text-white/40">Only admins can change name & pic</p>
            </div>
            
            <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${settings.onlyAdminsCanEditGroupInfo ? 'bg-cyan-500' : 'bg-white/20'}`}>
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${settings.onlyAdminsCanEditGroupInfo ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex gap-3">
            <ShieldAlert className="text-amber-400 shrink-0" size={18} />
            <p className="text-[10px] text-amber-300/70 leading-relaxed">
              As the <strong className="text-amber-400">Creator</strong>, you always bypass these restrictions even if you aren't an admin.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/10 bg-white/5">
          <button 
            onClick={handleSaveSettings} 
            disabled={isUpdatingGroup || !isCreator} 
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUpdatingGroup ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              isCreator ? "Apply Changes" : "Creator Only"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GroupSettingsModal;