import { useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import {
  X,
  Shield,
  UserMinus,
  Crown,
  Search,
  MoreVertical,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

function GroupMembersModal({ group, isAdmin, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  // Added isUpdatingGroup from store
  const { removeMemberFromGroup, makeAdmin, isUpdatingGroup } = useChatStore();
  const { authUser } = useAuthStore();

  if (!group) return null;

  const filteredMembers = group.members?.filter((member) =>
    member.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isMemberAdmin = (memberId) => {
    return group.admins?.some((admin) => {
      const adminId = typeof admin === "string" ? admin : admin._id;
      return adminId.toString() === memberId.toString();
    });
  };
 
  const handleRemoveMember = async (memberId) => {
    const confirmMessage = `Remove ${
      filteredMembers.find((m) => m._id === memberId)?.fullName
    } from the group?`;

    if (window.confirm(confirmMessage)) {
      try {
        //  Call the store
        const success = await removeMemberFromGroup(group._id, memberId);

        //  Optional: If store doesn't auto-update the 'group' object,
        //  might need to manually close or refresh.
        if (!success) {
          toast.error("Failed to remove member");
        }
      } catch (error) {
        console.error("Remove member error:", error);
      }
    }
  };

  const handleMakeAdmin = async (memberId) => {
    if (window.confirm("Promote this member to admin?")) {
      await makeAdmin(group._id, memberId);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
              {isUpdatingGroup ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <ShieldCheck size={20} />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Group Members</h2>
              <p className="text-xs text-slate-500">
                {group.members?.length || 0} participants
              </p>
            </div>
          </div>
          {/* Prevent closing while updating to avoid state desync */}
          <button
            onClick={onClose}
            disabled={isUpdatingGroup}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors disabled:opacity-30"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-900/50">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={18}
            />
            <input
              type="text"
              disabled={isUpdatingGroup}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members..."
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all text-sm disabled:opacity-50"
            />
          </div>
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {filteredMembers?.map((member) => {
            const memberIsAdmin = isMemberAdmin(member._id);
            const memberIsCreator =
              typeof group.createdBy === "string"
                ? group.createdBy === member._id
                : group.createdBy?._id === member._id;
            const isMe = member._id === authUser._id;

            return (
              <div
                key={member._id}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-800/60 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={member.profilePic || "/avatar.png"}
                      className="size-11 rounded-full object-cover border border-slate-700"
                      alt=""
                    />
                    {memberIsAdmin && (
                      <div className="absolute -bottom-1 -right-1 bg-slate-900 p-0.5 rounded-full">
                        <Shield
                          size={12}
                          className="text-cyan-400 fill-cyan-400/20"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      {member.fullName}
                      {isMe && (
                        <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-400">
                          You
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] font-medium uppercase tracking-wider">
                      {memberIsCreator ? (
                        <span className="text-amber-500 flex items-center gap-1">
                          <Crown size={10} /> Creator
                        </span>
                      ) : memberIsAdmin ? (
                        <span className="text-cyan-500 flex items-center gap-1">
                          <Shield size={10} /> Admin
                        </span>
                      ) : (
                        <span className="text-slate-500">Member</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Action Buttons - Disabled during update */}
                {isAdmin && !memberIsCreator && !isMe && (
                  <div className="relative group/menu">
                    <button
                      disabled={isUpdatingGroup}
                      className="p-2 hover:bg-slate-700 rounded-lg text-slate-500 transition-colors disabled:opacity-30"
                    >
                      <MoreVertical size={18} />
                    </button>

                    <div className="absolute right-0 top-0 hidden group-hover/menu:flex items-center gap-1 bg-slate-800 border border-slate-700 p-1 rounded-xl shadow-xl z-20">
                      {!memberIsAdmin && (
                        <button
                          onClick={() => handleMakeAdmin(member._id)}
                          disabled={isUpdatingGroup}
                          className="p-2 hover:bg-cyan-500/10 text-cyan-400 rounded-lg transition-colors disabled:cursor-not-allowed"
                          title="Make Admin"
                        >
                          <Shield size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveMember(member._id)}
                        disabled={isUpdatingGroup}
                        className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors disabled:cursor-not-allowed"
                        title="Remove Member"
                      >
                        <UserMinus size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <button
            onClick={onClose}
            disabled={isUpdatingGroup}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
          >
            {isUpdatingGroup && <Loader2 size={16} className="animate-spin" />}
            {isUpdatingGroup ? "Processing..." : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GroupMembersModal;
