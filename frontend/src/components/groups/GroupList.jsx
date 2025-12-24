import { useEffect, useMemo } from "react";
import { useChatStore } from "../../store/useChatStore";
import UsersLoadingSkeleton from "../UsersLoadingSkeleton";
import GroupCard from "./GroupCard";
import { Users } from "lucide-react";

function GroupList() {
  const {
    groups,
    isGroupsLoading,
    setSelectedGroup,
    selectedGroup,
    setSelectedUser,
    searchQuery,
    getGroups,
  } = useChatStore();

  // Fetch groups on mount
  useEffect(() => {
    if (getGroups) getGroups();
  }, [getGroups]);

  // Memoized filter and sort logic
  const filteredGroups = useMemo(() => {
    // Ensure groups is an array to prevent .filter errors
    const groupArray = Array.isArray(groups) ? groups : [];

    return groupArray
      .filter((group) =>
        // FIX: Changed group.name to group.groupName to match your schema
        (group.groupName || "")
          .toLowerCase()
          .includes((searchQuery || "").toLowerCase())
      )
      .sort((a, b) => {
        // Sort by last message date or creation date
        const aTime = a.lastMessage?.createdAt 
          ? new Date(a.lastMessage.createdAt).getTime() 
          : new Date(a.createdAt || 0).getTime();
          
        const bTime = b.lastMessage?.createdAt 
          ? new Date(b.lastMessage.createdAt).getTime() 
          : new Date(b.createdAt || 0).getTime();
          
        return bTime - aTime;
      });
  }, [groups, searchQuery]);

  // Loading State
  if (isGroupsLoading) return <UsersLoadingSkeleton />;

  // Empty State
  if (filteredGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center mt-10 px-4 text-center">
        <div className="bg-slate-800/50 p-4 rounded-full mb-4">
          <Users className="size-8 text-slate-500" />
        </div>
        <p className="text-slate-400 text-sm">
          {searchQuery ? "No matching groups" : "No groups found"}
        </p>
        <p className="text-slate-500 text-xs mt-1">
          {searchQuery ? "Try a different search term" : "Create a group to start chatting with multiple people."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 overflow-y-auto max-h-full custom-scrollbar">
      {filteredGroups.map((group) => (
        <GroupCard
          key={group._id}
          group={group}
          isActive={selectedGroup?._id === group._id}
          onClick={() => {
            // Logic to switch context from Private to Group
            setSelectedUser(null); 
            setSelectedGroup(group);
          }}
        />
      ))}
    </div>
  );
}

export default GroupList;