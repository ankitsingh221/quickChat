import React, { useState, useEffect, useMemo } from "react";
import { useChatStore } from "../../store/useChatStore";
import {
  X,
  Search,
  Send,
  CheckCircle2,
  Files,
  Loader2,
  Users,
  CheckSquare,
  Square,
} from "lucide-react";
import toast from "react-hot-toast";

const ForwardModal = () => {
  const {
    allContacts: users = [],
    groups = [],
    forwardingMessages = [],
    closeForwardModal,
    forwardMessages,
    getAllContacts,
    isUsersLoading,
  } = useChatStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTargets, setSelectedTargets] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [sentIds, setSentIds] = useState([]);

  useEffect(() => {
    if (forwardingMessages.length > 0) getAllContacts();
  }, [forwardingMessages, getAllContacts]);

  // sage combine list:  Handles different image property names
  const combinedList = useMemo(() => {
    const formattedUsers = (users || []).map((u) => ({
      ...u,
      _id: u._id,
      name: u.fullName || "Unknown",
      displayPic: u.profilePic,
      isGroup: false,
    }));

    const formattedGroups = (groups || []).map((g) => ({
      ...g,
      _id: g._id,
      name: g.groupName || "Unknown Group",
      displayPic: g.groupPic,
      isGroup: true,
    }));

    return [...formattedGroups, ...formattedUsers].filter((item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, groups, searchTerm]);

  if (forwardingMessages.length === 0) return null;

  const handleSelectAll = () => {
    if (selectedTargets.length === combinedList.length) {
      setSelectedTargets([]);
    } else {
      const allTargets = combinedList.map((t) => ({
        id: t._id,
        isGroup: t.isGroup,
      }));
      setSelectedTargets(allTargets);
    }
  };

  const toggleSelection = (id, isGroup) => {
    if (sentIds.includes(id)) return;
    setSelectedTargets((prev) => {
      const exists = prev.find((t) => t.id === id);
      if (exists) return prev.filter((t) => t.id !== id);
      return [...prev, { id, isGroup }];
    });
  };

  const handleFinalSend = async () => {
    if (selectedTargets.length === 0) return;
    setIsSending(true);
    let successCount = 0;

    for (const target of selectedTargets) {
      const success = await forwardMessages(target.id, target.isGroup);
      if (success) {
        setSentIds((prev) => [...prev, target.id]);
        successCount++;
      }
    }

    setIsSending(true); // Keep spinner until processing is done
    setTimeout(() => {
      setIsSending(false);
      setSelectedTargets([]);
      if (successCount > 0) {
        toast.success(`Forwarded to ${successCount} targets`);
        setTimeout(closeForwardModal, 800);
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={closeForwardModal}></div>

      <div className="relative bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl flex flex-col max-h-[600px] border border-slate-700/50 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/40">
          <div>
            <h3 className="font-bold text-slate-100 text-lg leading-tight">
              Forward to
            </h3>
            <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
              {forwardingMessages.length}{" "}
              {forwardingMessages.length === 1 ? "Item" : "Items"} selected
            </p>
          </div>
          <button
            onClick={closeForwardModal}
            className="p-2 hover:bg-slate-700 rounded-full text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 bg-slate-900 space-y-2">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search contacts or groups..."
              className="w-full bg-slate-800 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors px-1"
          >
            {selectedTargets.length === combinedList.length ? (
              <CheckSquare size={14} />
            ) : (
              <Square size={14} />
            )}
            {selectedTargets.length === combinedList.length
              ? "Deselect All"
              : "Select All"}
          </button>
        </div>

        {/* Combined List */}
        <div className="overflow-y-auto flex-1 p-2 bg-slate-900 min-h-[300px] custom-scrollbar">
          {isUsersLoading ? (
            <div className="flex justify-center py-10">
              <span className="loading loading-spinner text-cyan-500"></span>
            </div>
          ) : combinedList.length > 0 ? (
            combinedList.map((item) => {
              const isSelected = selectedTargets.some((t) => t.id === item._id);
              const isSent = sentIds.includes(item._id);

              return (
                <div
                  key={item._id}
                  onClick={() => toggleSelection(item._id, item.isGroup)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all mb-1 ${
                    isSelected ? "bg-cyan-500/10" : "hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {/* FIXED IMAGE LOGIC */}
                      <img
                        src={
                          item.displayPic ||
                          (item.isGroup ? "/group-avatar.png" : "/avatar.png")
                        }
                        className="w-9 h-9 rounded-full object-cover border border-slate-700 bg-slate-800"
                        alt=""
                        onError={(e) => {
                          e.target.src = item.isGroup
                            ? "/group-avatar.png"
                            : "/avatar.png";
                        }}
                      />
                      {item.isGroup && (
                        <div className="absolute -bottom-1 -right-1 bg-slate-800 rounded-full p-0.5 border border-slate-700">
                          <Users size={10} className="text-cyan-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <span
                        className={`font-medium text-sm block ${
                          isSelected ? "text-cyan-400" : "text-slate-300"
                        }`}
                      >
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">
                        {item.isGroup ? "Group" : "Contact"}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`flex items-center justify-center w-5 h-5 rounded border transition-all ${
                      isSent
                        ? "bg-green-500 border-green-500 text-white"
                        : isSelected
                        ? "bg-cyan-500 border-cyan-500 text-white"
                        : "border-slate-600 text-transparent"
                    }`}
                  >
                    <CheckCircle2 size={14} />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-slate-600 text-sm italic">
              No results found
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800/80 border-t border-slate-700/50 flex flex-col gap-3">
          <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-lg border border-slate-700/30">
            <div className="p-2 bg-cyan-500/10 rounded-md text-cyan-500">
              <Files size={16} />
            </div>
            <div className="truncate">
              <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest">
                Forwarding Content
              </p>
              <p className="text-xs text-slate-400 truncate italic">
                {forwardingMessages.length === 1
                  ? forwardingMessages[0].text || "📷 Image Content"
                  : `${forwardingMessages.length} messages selected`}
              </p>
            </div>
          </div>

          {selectedTargets.length > 0 ? (
            <button
              onClick={handleFinalSend}
              disabled={isSending}
              className="w-full btn btn-primary flex items-center justify-center gap-2 font-bold py-2.5"
            >
              {isSending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Send size={16} /> Send to {selectedTargets.length} target
                  {selectedTargets.length > 1 ? "s" : ""}
                </>
              )}
            </button>
          ) : sentIds.length > 0 ? (
            <button
              onClick={closeForwardModal}
              className="w-full btn btn-ghost text-cyan-500 border border-cyan-500/20"
            >
              Done
            </button>
          ) : (
            <p className="text-[10px] text-center text-slate-500 uppercase font-semibold">
              Select a target to forward
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForwardModal;
