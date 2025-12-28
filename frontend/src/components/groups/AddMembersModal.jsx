import { useState, useEffect } from "react";
import { useChatStore } from "../../store/useChatStore";
import { X, Search, UserPlus, Check, Loader2, Users } from "lucide-react";

function AddMembersModal({ group, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const { allContacts, getAllContacts, addMembersToGroup, isUpdatingGroup } =
    useChatStore();

  //  Fetch contacts if the list is empty when modal opens
  useEffect(() => {
    if (allContacts.length === 0) {
      getAllContacts();
    }
  }, [allContacts.length, getAllContacts]);

  //  Filter: Remove contacts who are already members of this group
  //  use .toString() to compare IDs safely
  const availableContacts = allContacts.filter((contact) => {
    const isAlreadyMember = group.members?.some((m) => {
      const memberId = typeof m === "string" ? m : m._id;
      return memberId.toString() === contact._id.toString();
    });
    return !isAlreadyMember;
  });

  //  Search: Filter the available contacts by name
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

    // Pass the array of selected IDs to the store
    const success = await addMembersToGroup(group._id, selectedIds);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-xl text-green-400">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-white font-bold">Add Members</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                {selectedIds.length} Selected
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={18}
            />
            <input
              type="text"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-cyan-500 outline-none transition-all"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar min-h-[300px]">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <div
                key={contact._id}
                onClick={() => toggleMember(contact._id)}
                className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${
                  selectedIds.includes(contact._id)
                    ? "bg-cyan-500/10 border-cyan-500/30"
                    : "hover:bg-slate-800 border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={contact.profilePic || "/avatar.png"}
                      className="size-11 rounded-full object-cover border border-slate-700"
                      alt=""
                    />
                    {selectedIds.includes(contact._id) && (
                      <div className="absolute -top-1 -right-1 bg-cyan-500 rounded-full p-0.5 border-2 border-slate-900">
                        <Check
                          size={10}
                          className="text-slate-900"
                          strokeWidth={4}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">
                      {contact.fullName}
                    </p>
                    <p className="text-[11px] text-slate-500">Available</p>
                  </div>
                </div>

                <div
                  className={`size-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    selectedIds.includes(contact._id)
                      ? "bg-cyan-500 border-cyan-500"
                      : "border-slate-700"
                  }`}
                >
                  {selectedIds.includes(contact._id) && (
                    <Check
                      size={12}
                      className="text-slate-900"
                      strokeWidth={3}
                    />
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-10 text-slate-500">
              <Users size={40} className="opacity-10 mb-2" />
              <p className="text-sm">No new members to add</p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="p-5 border-t border-slate-800">
          <button
            onClick={handleAddSubmit}
            disabled={selectedIds.length === 0 || isUpdatingGroup}
            className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed text-slate-900 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
          >
            {isUpdatingGroup ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <UserPlus size={18} />
                <span>Add {selectedIds.length} Members</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddMembersModal;
