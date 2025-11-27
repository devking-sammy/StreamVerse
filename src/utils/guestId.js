// src/utils/guestId.js
import { v4 as uuidv4 } from "uuid";

// install uuid: npm i uuid
const KEY = "sv_guest_id";

export function getGuestId() {
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(KEY, id);
  }
  return id;
}
