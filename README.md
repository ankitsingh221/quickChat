# 🚀 QuickChat

A full-stack real-time chat application built using the **MERN stack** that enables seamless one-to-one and group communication with advanced messaging controls and real-time updates.

---

## 📌 Overview

**QuickChat** replicates modern messaging platforms with production-level features like real-time communication, group permissions, and interactive UI.

It goes beyond a basic chat app by implementing **fine-grained control over messages, users, and groups**, making it closer to real-world systems like **WhatsApp**.

---

## 🔗 Live Demo

👉 https://quickchat-2gsw.onrender.com/

---

## ✨ Features

### 💬 Messaging System

* ⚡ Real-time messaging using **Socket.IO**
* ✏️ Edit messages (time-restricted)
* ❌ Delete messages (for self / for everyone within 5 minutes)
* 🔁 Forward messages (users & groups, bulk supported)
* 🔍 Message search
* 🧹 Clear chat / bulk delete
* Message read receipts (single tick / double tick / seen count)

---

### 🟢 Real-Time Indicators

* 👀 Online/offline status
* ⌨️ Typing indicator
* 🔊 Typing sound feedback
* 🕒 Last seen timestamps

---

### 😀 Interaction Features

* ❤️ Emoji reactions
* 🖼️ Image sharing
* 🔔 Toast notifications

---

### 👥 Group Chat System

* ➕ Add/remove members
* 🛡️ Admin roles
* 👑 Creator privileges
* 🗑️ Delete group

#### ⚙️ Group Controls

* Only admins can send messages
* Only admins can edit group info
* Configurable permissions

---

### 👤 User Features

* 🖼️ Profile image update
* ✏️ Username & bio editing

---

### 📊 Chat Management

* 📩 Unread message count
* 🧾 Last message preview
* 🗂️ Chat cleanup
* 📅 Messages grouped by date

---

## 🧱 Tech Stack

### Frontend

* React (Vite)
* Zustand
* Tailwind CSS + DaisyUI
* Socket.IO Client
* Axios
* Day.js
* React Hot Toast

### Backend

* Node.js + Express
* MongoDB + Mongoose
* Socket.IO
* JWT Authentication
* Cloudinary
* Bcrypt
* Express Rate Limiting

---

## 🔐 Authentication

* JWT-based authentication
* Secure password hashing (bcrypt)
* Protected routes using middleware

---

## 🚀 Key Highlights

* Real-time bidirectional communication
* Advanced message lifecycle handling
* Scalable group permission system
* Clean modular architecture
* Responsive modern UI

---

## 🖼️ Screenshots

### 🔐 Authentication

| Signup                                                                                                                                            | Login                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| ![Signup](https://github.com/ankitsingh221/quickChat/blob/c6eed7b16b60469fe50189432e7f0099de5ce414/UI_image/Screenshot%202026-04-15%20225223.png) | ![Login](https://github.com/ankitsingh221/quickChat/blob/c6eed7b16b60469fe50189432e7f0099de5ce414/UI_image/Screenshot%202026-04-15%20225213.png) |

---

### 💬 Chat Dashboard

| Empty                                                                                                                                            | Active                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![Empty](https://github.com/ankitsingh221/quickChat/blob/c6eed7b16b60469fe50189432e7f0099de5ce414/UI_image/Screenshot%202026-04-15%20225809.png) | ![Active](https://github.com/ankitsingh221/quickChat/blob/c6eed7b16b60469fe50189432e7f0099de5ce414/UI_image/Screenshot%202026-04-15%20225853.png) |

---

### 🧑‍🤝‍🧑 One-to-One Chat

![Chat](https://github.com/ankitsingh221/quickChat/blob/7c5c4ead4efa6a32062ce8da14bf3b9f7a224e5b/UI_image/Screenshot%202026-04-15%20232228.png)

---

### ⚡ Message Features

| Actions                                                                                                                                            | Forward                                                                                                                                            | Info                                                                                                                                            |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| ![Actions](https://github.com/ankitsingh221/quickChat/blob/c6eed7b16b60469fe50189432e7f0099de5ce414/UI_image/Screenshot%202026-04-15%20225902.png) | ![Forward](https://github.com/ankitsingh221/quickChat/blob/c6eed7b16b60469fe50189432e7f0099de5ce414/UI_image/Screenshot%202026-04-15%20230245.png) | ![Info](https://github.com/ankitsingh221/quickChat/blob/c6eed7b16b60469fe50189432e7f0099de5ce414/UI_image/Screenshot%202026-04-15%20230444.png) |

---

### 👥 Group Features

| Create                                                                                                                                            | Chat                                                                                                                                             | Info                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| ![Create](https://github.com/ankitsingh221/quickChat/blob/7c5c4ead4efa6a32062ce8da14bf3b9f7a224e5b/UI_image/Screenshot%202026-04-15%20225915.png) | ![Group](https://github.com/ankitsingh221/quickChat/blob/c6eed7b16b60469fe50189432e7f0099de5ce414/UI_image/Screenshot%202026-04-15%20230228.png) | ![Info](https://github.com/ankitsingh221/quickChat/blob/c6eed7b16b60469fe50189432e7f0099de5ce414/UI_image/Screenshot%202026-04-15%20225947.png) |

---

### ⚙️ Group Management

| Settings                                                                                                                                            | Add Members                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![Settings](https://github.com/ankitsingh221/quickChat/blob/c6eed7b16b60469fe50189432e7f0099de5ce414/UI_image/Screenshot%202026-04-15%20230001.png) | ![Members](https://github.com/ankitsingh221/quickChat/blob/c6eed7b16b60469fe50189432e7f0099de5ce414/UI_image/Screenshot%202026-04-15%20230025.png) |

---

### 🔍 Extras

| Unread                                                                                                                                            | Search                                                                                                                                            | Profile                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![Unread](https://github.com/ankitsingh221/quickChat/blob/7c5c4ead4efa6a32062ce8da14bf3b9f7a224e5b/UI_image/Screenshot%202026-04-15%20232124.png) | ![Search](https://github.com/ankitsingh221/quickChat/blob/7c5c4ead4efa6a32062ce8da14bf3b9f7a224e5b/UI_image/Screenshot%202026-04-15%20230331.png) | ![Profile](https://github.com/ankitsingh221/quickChat/blob/7c5c4ead4efa6a32062ce8da14bf3b9f7a224e5b/UI_image/Screenshot%202026-04-15%20232040.png) |

---

## 🔮 Future Improvements

* 🎥 Voice & video calling
* 🔐 End-to-End Encryption
* 📲 Push notifications
* 📎 File sharing
* 🛠️ Advanced admin tools

---

## 👨‍💻 Author

**Ankit Kumar**
🔗 https://github.com/ankitsingh221
