import { useState, useEffect } from "react";
import { useChatStore } from "../../store/useChatStore";
import { X, Search, UserPlus, Check, Loader2, Users } from "lucide-react";

function AddMembersModal({ group, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const { allContacts, getAllContacts, addMembersToGroup, isUpdatingGroup } =
    useChatStore();

  useEffect(() => {
    if (allContacts.length === 0) {
      getAllContacts();
    }
  }, [allContacts.length, getAllContacts]);

  const availableContacts = allContacts.filter((contact) => {
    const isAlreadyMember = group.members?.some((m) => {
      const memberId = typeof m === "string" ? m : m._id;
      return memberId.toString() === contact._id.toString();
    });
    return !isAlreadyMember;
  });

  const filteredContacts = availableContacts.filter((contact) =>
    contact.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMember = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleAddSubmit = async () => {
    if (selectedIds.length === 0) return;

    const success = await addMembersToGroup(group._id, selectedIds);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200">
      <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-xl text-green-400">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-white font-semibold">Add Members</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium">
                {selectedIds.length} Selected
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-5 pt-4 pb-2">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
              size={18}
            />
            <input
              type="text"
              className="w-full bg-white/10 border border-white/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar min-h-[300px]">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <div
                key={contact._id}
                onClick={() => toggleMember(contact._id)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                  selectedIds.includes(contact._id)
                    ? "bg-cyan-500/20 border-cyan-500/30"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={contact.profilePic || "/avatar.png"}
                      className="size-10 rounded-full object-cover border border-white/20"
                      alt=""
                    />
                    {selectedIds.includes(contact._id) && (
                      <div className="absolute -top-1 -right-1 bg-cyan-500 rounded-full p-0.5 border-2 border-black/50">
                        <Check
                          size={10}
                          className="text-white"
                          strokeWidth={4}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80">
                      {contact.fullName}
                    </p>
                    <p className="text-[11px] text-white/30">Available</p>
                  </div>
                </div>

                <div
                  className={`size-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    selectedIds.includes(contact._id)
                      ? "bg-cyan-500 border-cyan-500"
                      : "border-white/30"
                  }`}
                >
                  {selectedIds.includes(contact._id) && (
                    <Check
                      size={12}
                      className="text-white"
                      strokeWidth={3}
                    />
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-10 text-white/30">
              <Users size={40} className="opacity-20 mb-2" />
              <p className="text-sm">No new members to add</p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="px-5 py-4 border-t border-white/10 bg-white/5">
          <button
            onClick={handleAddSubmit}
            disabled={selectedIds.length === 0 || isUpdatingGroup}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {isUpdatingGroup ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <UserPlus size={18} />
                <span>Add {selectedIds.length} Member{selectedIds.length !== 1 && 's'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddMembersModal;