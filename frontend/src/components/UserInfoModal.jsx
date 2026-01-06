import { X, Calendar, ShieldCheck, MessageSquare, Clock, Mail } from "lucide-react";
import { useChatStore } from "../store/useChatStore"; 

const UserInfoModal = ({ user, onClose }) => {
  const { setSelectedUser } = useChatStore(); // Pull the selection action

  if (!user) return null;

  const memberSince = new Date(user.createdAt);
  const accountAgeInDays = Math.floor((new Date() - memberSince) / (1000 * 60 * 60 * 24));
  const isAccountNew = accountAgeInDays < 7;
  const userRole = user.isAdmin ? "Administrator" : "Verified Member";


  const handleStartChat = () => {
    setSelectedUser(user); 
    onClose(); 
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      {/* Floating Card */}
      <div className="relative w-full max-w-md bg-[#0f172a] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300">
        
        {/* Banner */}
        <div className={`h-24 w-full ${user.isAdmin ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20' : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20'}`} />

        <div className="px-6 pb-8">
          {/* Avatar & Close */}
          <div className="relative -mt-12 mb-4 flex justify-between items-end">
            <div className="size-24 rounded-[2rem] overflow-hidden border-4 border-[#0f172a] shadow-2xl bg-slate-800">
              <img src={user.profilePic || "/avatar.png"} alt="" className="size-full object-cover" />
            </div>
            <button 
              onClick={onClose}
              className="mb-2 p-2.5 bg-slate-900/50 hover:bg-slate-800 text-slate-400 rounded-2xl border border-white/5 backdrop-blur-md transition-all active:scale-90"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Identity */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
               <h1 className="text-2xl font-black text-white tracking-tight">{user.fullName}</h1>
               {user.isAdmin && <ShieldCheck size={18} className="text-red-400" />}
            </div>
            <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
              <Mail size={14} className="text-cyan-500/50" /> {user.email}
            </p>
          </div>

          {/* Badges */}
          <div className="flex gap-2 mt-4">
            <span className="px-3 py-1 bg-slate-800/50 text-slate-300 text-[10px] font-black uppercase rounded-lg border border-white/5 tracking-widest">
              {userRole}
            </span>
            {isAccountNew && (
               <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase rounded-lg border border-cyan-500/20 tracking-widest">
                 New Member
               </span>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mt-8">
            <div className="p-4 bg-slate-900/40 rounded-[1.5rem] border border-white/5">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Calendar size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Joined</span>
              </div>
              <p className="text-sm text-slate-200 font-bold">
                {memberSince.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="p-4 bg-slate-900/40 rounded-[1.5rem] border border-white/5">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Clock size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Activity</span>
              </div>
              <p className="text-sm text-slate-200 font-bold">
                {accountAgeInDays === 0 ? "Today" : `${accountAgeInDays} days`}
              </p>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 block ml-1">About</label>
            <div className="text-slate-300 text-sm leading-relaxed p-4 bg-slate-950/50 rounded-2xl border border-white/5 italic min-h-[60px]">
              {user.bio ? `"${user.bio}"` : "No bio available."}
            </div>
          </div>

          {/* CTA Button */}
          <button 
            onClick={handleStartChat}
            className="w-full mt-8 py-4 bg-cyan-600 text-white font-black rounded-[1.5rem] hover:bg-cyan-400 transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-xl group"
          >
            <MessageSquare size={18} className="group-hover:scale-110 transition-transform" />
            Message {user.fullName?.split(" ")[0]}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInfoModal;