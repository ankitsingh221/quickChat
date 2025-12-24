import { create } from "zustand";
import { createContactSlice } from "./slices/contactSlice";
import { createUISlice } from "./slices/uiSlice";
import { createMessageSlice } from "./slices/messageSlice";
import {createGroupSlice} from "./slices/groupSlice"
import { persist, createJSONStorage } from "zustand/middleware";
export const useChatStore = create(
  persist(
    (set, get, ...a) => ({
      ...createContactSlice(set, get, ...a),
      ...createMessageSlice(set, get, ...a),
      ...createGroupSlice(set, get, ...a),
      ...createUISlice(set,get,...a),

    }),
    {
      name: "chat-app-storage", 
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        selectedUser: state.selectedUser, 
        selectedGroup: state.selectedGroup 
      }),
    }
  )
);