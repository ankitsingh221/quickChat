import { create } from "zustand";
import { createContactSlice } from "./slices/contactSlice";
import { createUISlice } from "./slices/uiSlice";
import { createMessageSlice } from "./slices/messageSlice";

export const useChatStore = create((set, get, ...a) => ({
  ...createContactSlice(set, get, ...a),
  ...createUISlice(set, get, ...a),
  ...createMessageSlice(set, get, ...a), 
}));