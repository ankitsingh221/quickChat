# 🚀 QuickChat

A full-stack real-time chat application built using the **MERN stack** that supports one-to-one and group communication with advanced messaging controls, real-time updates, and rich user interactions.

---

## 📌 Overview

**QuickChat** replicates modern messaging platforms with production-level features like real-time communication, group permissions, message control, and interactive UI elements.

It goes beyond a basic chat app by implementing **fine-grained control over messages, users, and groups**, making it closer to real-world systems like **WhatsApp**

---
## 🔗 Live Demo

Check out the live version of **QuickChat** here: [Live Demo](https://quickchat-2gsw.onrender.com/)

## ✨ Features

### 💬 Messaging System
- ⚡ Real-time messaging using **WebSockets (Socket.IO)**
- ✏️ Edit messages (with time restriction for everyone)
- ❌ Delete messages:
  - For yourself
  - For everyone (within 5 minutes)
- 🔁 Forward messages:
  - To individual users
  - To groups
  - Bulk forwarding support
- 🔍 Message search functionality
- 🧹 Clear chat / bulk message deletion

---
## 👁️ Message Read Receipts (Planned Feature)
- Real-time message read status for both **one-to-one** and **group chats**

### 💬 One-to-One Chat
- When a message is delivered → single tick
- When the receiver reads the message → double blue tick

### 👥 Group Chat
- Shows how many members have seen the message
- Displays remaining users who haven’t seen it yet
- Real-time updates as users read the message
---

### 🟢 Real-Time Indicators
- 👀 Online/offline user status
- ⌨️ Typing indicator (one-to-one & group)
- 🔊 Typing sound feedback
- 🕒 Last seen (date & time)

---

### 😀 Interaction Features
- ❤️ Emoji reactions on messages
- 🖼️ Image sharing (1-to-1 & group chats)
- 🔔 Toast notifications for actions (group updates, profile changes, etc.)

---

### 👥 Group Chat System
- ➕ Add/remove members
- 🛡️ Admin role management
- 👑 Creator privileges (always override restrictions)
- 🗑️ Delete group

#### ⚙️ Group Controls
- Only admins can send messages
- Only admins can edit group info (name & image)
- Settings can be toggled by admin/creator

---

### 👤 User Features
- 🖼️ Update profile image
- ✏️ Update username & about section

---

### 📊 Chat Management
- 📩 Unread message count
- 🧾 Last message preview in chat list
- 🗂️ Chat removal on clear (moves to contacts)
- 📅 Messages grouped by date (like WhatsApp)

---

## 🧱 Tech Stack

### Frontend
- React (Vite)
- Zustand (state management)
- Tailwind CSS + DaisyUI
- Socket.IO Client
- Axios
- Day.js
- React Hot Toast

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- JWT Authentication
- Cloudinary (image uploads)
- Bcrypt (password hashing)
- Express Rate Limiting

## 🔐 Authentication
- JWT-based authentication  
- Password hashing using **bcrypt**  
- Secure API handling using middleware  

---

## 🚀 Key Highlights
- Real-time bidirectional communication (**Socket.IO**)  
- Advanced message lifecycle management  
- Scalable group permission system  
- Clean and modular architecture  
- Modern, responsive UI  

---
## 🖼️ Screenshots

### Main Interface
*Main dashboard showing chat selection view*
![Main Dashboard](https://github.com/ankitsingh221/quickChat/blob/3d80bcf59955d397e31c97e03e0074382c2dd15c/UI_image/Screenshot%202026-04-12%20235759.png)

### Contact List
*Contact list with online status indicators*
![Contacts View](https://github.com/ankitsingh221/quickChat/blob/3d80bcf59955d397e31c97e03e0074382c2dd15c/UI_image/Screenshot%202026-04-12%20235831.png)

### Group Chat
*Group conversation interface with member list*
![Group Chat](https://github.com/ankitsingh221/quickChat/blob/3d80bcf59955d397e31c97e03e0074382c2dd15c/UI_image/Screenshot%202026-04-12%20235813.png).


###  One to One Chat Interface
![Chat Window](https://github.com/ankitsingh221/quickChat/blob/ec94d663fbcc37fd8bbde223c84c4ee6ec767a49/UI_image/Screenshot%202026-04-13%20004014.png)


###  Group Chat Interface
![Chat Window](https://github.com/ankitsingh221/quickChat/blob/1870fe6090cd20a32659f08c17c5a37e369a664f/UI_image/Screenshot%202026-04-13%20004359.png)


### Message Actions
*Context menu for message operations (Reply, Forward, Edit, Delete)*
![Message Actions](https://github.com/ankitsingh221/quickChat/blob/3d80bcf59955d397e31c97e03e0074382c2dd15c/UI_image/Screenshot%202026-04-13%20000357.png)

### Unread Message Count
![Message Actions](https://github.com/ankitsingh221/quickChat/blob/ecd20a4b98b21331e4a634b167308f843177463f/UI_image/Screenshot%202026-04-13%20005930.png)


### Message Info
*Context menu for message operations (Reply, Forward, Edit, Delete)*
![Message Actions](https://github.com/ankitsingh221/quickChat/blob/4105ec997edd6fc6d28fa8ab5d71522e6a2c39d5/UI_image/Screenshot%202026-04-13%20004708.png)


### Profile Management
*User profile editing interface*
![Profile Section](https://github.com/ankitsingh221/quickChat/blob/3d80bcf59955d397e31c97e03e0074382c2dd15c/UI_image/Screenshot%202026-04-13%20000522.png)


### Group Management
*Group information and settings panel*
![Group Info](https://github.com/ankitsingh221/quickChat/blob/3d80bcf59955d397e31c97e03e0074382c2dd15c/UI_image/Screenshot%202026-04-13%20000506.png)

---

## 🔮 Future Improvements
- Voice & video calling  
- End-to-End message encryption (E2E)  
- Push notifications  
- File sharing (documents, videos)  
- Admin Features 
---
## 👨‍💻 Author

**Ankit kumar**  

GitHub: [https://github.com/ankitsingh221](https://github.com/ankitsingh221)
