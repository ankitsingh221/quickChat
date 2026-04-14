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
  const [failedIds, setFailedIds] = useState([]);
  const [processingIndex, setProcessingIndex] = useState(-1);

  useEffect(() => {
    if (forwardingMessages.length > 0) {
      getAllContacts();
    }
    // Reset states when modal opens
    setSelectedTargets([]);
    setSentIds([]);
    setFailedIds([]);
    setSearchTerm("");
    setProcessingIndex(-1);
  }, [forwardingMessages, getAllContacts]);

  // Combine list
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
        name: t.name,
      }));
      setSelectedTargets(allTargets);
    }
  };

  const toggleSelection = (id, isGroup, name) => {
    if (sentIds.includes(id)) return;
    setSelectedTargets((prev) => {
      const exists = prev.find((t) => t.id === id);
      if (exists) return prev.filter((t) => t.id !== id);
      return [...prev, { id, isGroup, name }];
    });
  };

  const handleFinalSend = async () => {
    if (selectedTargets.length === 0) return;

    setIsSending(true);
    let successCount = 0;
    let failCount = 0;
    const newSentIds = [];
    const newFailedIds = [];

    // Process each target with delay to avoid rate limiting
    for (let i = 0; i < selectedTargets.length; i++) {
      const target = selectedTargets[i];
      setProcessingIndex(i);
      
      try {
        // Send each message individually
        let allSuccess = true;
        
        for (const message of forwardingMessages) {
          const success = await forwardMessages(target.id, target.isGroup, message);
          if (!success) {
            allSuccess = false;
            break;
          }
        }
        
        if (allSuccess) {
          successCount++;
          newSentIds.push(target.id);
          toast.success(`Forwarded to ${target.name}`);
        } else {
          failCount++;
          newFailedIds.push(target.id);
          toast.error(`Failed to forward to ${target.name}`);
        }
      } catch (error) {
        console.error("Forward failed:", error);
        failCount++;
        newFailedIds.push(target.id);
        toast.error(`Error forwarding to ${target.name}`);
      }
      
      // Small delay between sends to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setSentIds((prev) => [...prev, ...newSentIds]);
    setFailedIds((prev) => [...prev, ...newFailedIds]);
    setProcessingIndex(-1);

    // Show final summary
    if (successCount > 0 && failCount === 0) {
      toast.success(
        `✅ Successfully forwarded to ${successCount} ${successCount === 1 ? "target" : "targets"}!`
      );
      setTimeout(() => {
        closeForwardModal();
      }, 1500);
    } else if (successCount > 0 && failCount > 0) {
      toast.success(
        `⚠️ Forwarded to ${successCount} targets, failed for ${failCount}`
      );
    } else if (failCount > 0 && successCount === 0) {
      toast.error(
        `❌ Failed to forward to ${failCount} ${failCount === 1 ? "target" : "targets"}`
      );
    }

    setSelectedTargets([]);
    setIsSending(false);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={closeForwardModal}></div>

      <div className="relative bg-black/60 backdrop-blur-xl w-full max-w-sm rounded-2xl shadow-2xl flex flex-col max-h-[600px] border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-transparent">
          <div>
            <h3 className="font-bold text-white text-lg leading-tight">
              Forward to
            </h3>
            <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
              {forwardingMessages.length}{" "}
              {forwardingMessages.length === 1 ? "Item" : "Items"} selected
            </p>
          </div>
          <button
            onClick={closeForwardModal}
            disabled={isSending}
            className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 bg-transparent space-y-2">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
              size={16}
            />
            <input
              type="text"
              placeholder="Search contacts or groups..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isSending}
            />
          </div>

          {!isSending && (
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-xs font-semibold text-white/40 hover:text-cyan-400 transition-colors px-1"
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
          )}
        </div>

        {/* Combined List */}
        <div className="overflow-y-auto flex-1 p-2 bg-transparent min-h-[300px] custom-scrollbar">
          {isUsersLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-cyan-400 size-6" />
            </div>
          ) : combinedList.length > 0 ? (
            combinedList.map((item, idx) => {
              const isSelected = selectedTargets.some((t) => t.id === item._id);
              const isSent = sentIds.includes(item._id);
              const isFailed = failedIds.includes(item._id);
              const isProcessing = processingIndex === idx;

              // Don't show already sent items
              if (isSent) return null;

              return (
                <div
                  key={item._id}
                  onClick={() => !isSending && toggleSelection(item._id, item.isGroup, item.name)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all mb-1 ${
                    isSelected
                      ? "bg-cyan-500/15 border border-cyan-500/30"
                      : isFailed
                      ? "bg-red-500/10 border border-red-500/30"
                      : isProcessing
                      ? "bg-yellow-500/10 border border-yellow-500/30"
                      : "hover:bg-white/5 border border-transparent"
                  } ${isSending ? "cursor-not-allowed opacity-70" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={
                          item.displayPic ||
                          (item.isGroup ? "/group-avatar.png" : "/avatar.png")
                        }
                        className="w-9 h-9 rounded-full object-cover border border-white/20 bg-white/5"
                        alt=""
                        onError={(e) => {
                          e.target.src = item.isGroup
                            ? "/group-avatar.png"
                            : "/avatar.png";
                        }}
                      />
                      {item.isGroup && (
                        <div className="absolute -bottom-1 -right-1 bg-black/60 rounded-full p-0.5 border border-white/20">
                          <Users size={10} className="text-cyan-400" />
                        </div>
                      )}
                      {isProcessing && (
                        <div className="absolute -top-1 -right-1">
                          <Loader2 size={12} className="animate-spin text-yellow-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <span
                        className={`font-medium text-sm block ${
                          isSelected 
                            ? "text-cyan-400" 
                            : isFailed
                            ? "text-red-400"
                            : isProcessing
                            ? "text-yellow-400"
                            : "text-white/80"
                        }`}
                      >
                        {item.name}
                      </span>
                      <span className="text-[10px] text-white/30 uppercase font-bold">
                        {item.isGroup ? "Group" : "Contact"}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`flex items-center justify-center w-5 h-5 rounded border transition-all ${
                      isSelected
                        ? "bg-cyan-500 border-cyan-500 text-white"
                        : isFailed
                        ? "bg-red-500 border-red-500 text-white"
                        : "border-white/30 text-transparent"
                    }`}
                  >
                    {isSelected && <CheckCircle2 size={14} />}
                    {isFailed && <X size={14} />}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-white/30 text-sm italic">
              No results found
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/5 border-t border-white/10 flex flex-col gap-3">
          <div className="flex items-center gap-3 bg-black/40 p-2 rounded-lg border border-white/10">
            <div className="p-2 bg-cyan-500/10 rounded-md text-cyan-400">
              <Files size={16} />
            </div>
            <div className="truncate">
              <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">
                Forwarding Content
              </p>
              <p className="text-xs text-white/40 truncate italic">
                {forwardingMessages.length === 1
                  ? forwardingMessages[0].text || "📷 Image Content"
                  : `${forwardingMessages.length} messages selected`}
              </p>
            </div>
          </div>

          {selectedTargets.length > 0 && !isSending && (
            <button
              onClick={handleFinalSend}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25"
            >
              <Send size={16} /> Send to {selectedTargets.length} target
              {selectedTargets.length > 1 ? "s" : ""}
            </button>
          )}

          {isSending && (
            <button
              disabled
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500/50 to-cyan-600/50 text-black/50 font-bold rounded-xl flex items-center justify-center gap-2"
            >
              <Loader2 size={16} className="animate-spin" />
              Sending... ({processingIndex + 1}/{selectedTargets.length})
            </button>
          )}

          {sentIds.length > 0 && !isSending && selectedTargets.length === 0 && (
            <button
              onClick={closeForwardModal}
              className="w-full py-2.5 bg-transparent border border-white/20 text-cyan-400 hover:bg-white/10 rounded-xl transition-all"
            >
              Done
            </button>
          )}

          {selectedTargets.length === 0 && sentIds.length === 0 && !isSending && (
            <p className="text-[10px] text-center text-white/30 uppercase font-semibold">
              Select a target to forward
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForwardModal;