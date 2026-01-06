import { X, Mail, Info, Calendar, ShieldCheck, User2 } from "lucide-react";

const UserInfoModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="absolute inset-0 z-[110] bg-slate-950 flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="h-[100px] bg-slate-900 flex items-end p-6 gap-6 border-b border-slate-800 shadow-lg shrink-0">
        <button 
          onClick={onClose} 
          className="text-slate-200 hover:bg-slate-800 p-2 rounded-full transition-all hover:scale-110 active:scale-95"
        >
          <X size={24} />
        </button>
        <h1 className="text-xl font-bold text-slate-100 mb-1">Contact Info</h1>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-slate-900 to-slate-950">
        
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center py-10 bg-slate-800/20 border-b border-slate-800/50">
          <div className="size-56 rounded-full overflow-hidden border-[6px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.3)] mb-6">
            <img 
              src={user.profilePic || "/avatar.png"} 
              alt={user.fullName} 
              className="size-full object-cover transition-transform duration-700 hover:scale-110" 
            />
          </div>
          <h1 className="text-3xl font-bold text-slate-100">{user.fullName}</h1>
          <p className="text-cyan-500 font-medium tracking-wide mt-1">{user.email}</p>
        </div>

        {/* Info Cards */}
        <div className="max-w-2xl mx-auto p-8 space-y-8">
          
          {/* About Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-500">
               <Info size={16} />
               <span className="text-xs font-bold uppercase tracking-[2px]">About</span>
            </div>
            <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-800 shadow-inner">
              <p className="text-slate-200 text-lg italic leading-relaxed">
                "{user.bio || "Hey there! I am using QucikChat"}"
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-2xl border border-slate-800/50">
              <div className="size-12 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400">
                <Mail size={22} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Email</p>
                <p className="text-sm text-slate-200 truncate max-w-[150px]">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-2xl border border-slate-800/50">
              <div className="size-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
                <Calendar size={22} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Joined</p>
                <p className="text-sm text-slate-200">
                   {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserInfoModal;