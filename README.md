# 💬 Real-Time MERN Chat Application

This is a full-stack, real-time chat application built using the MERN stack (MongoDB, Express, React, Node.js) and powered by Socket.io for instant message delivery. It features secure user authentication and dynamic display of conversation history.

## ✨ Features

* **Secure Authentication:** User registration and login protected by JWT (JSON Web Tokens) and bcrypt password hashing.
* **Protected Routes:** All API endpoints requiring user data (e.g., fetching users, sending messages) are secured using custom Express middleware.
* **Real-Time Messaging:** Instant, bi-directional communication between users using **Socket.io**.
* **User Management:** Fetching and displaying a list of all registered users (excluding the logged-in user).
* **Conversation History:** Loading existing messages between two users upon selecting a chat target.
* **Modular Architecture:** Clean separation of concerns using controllers, routes, services, and middleware.

## 🚀 Technology Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend (Server)** | Node.js, Express, Socket.io | API handling, routing, and real-time communication. |
| **Database** | MongoDB / Mongoose | Object Data Modeling and persistent data storage. |
| **Authentication** | JWT, bcryptjs | Token-based security and password hashing. |
| **Frontend (Client)** | React, Vite, Axios | User interface, state management, and API calls. |
| **Routing** | React Router DOM | Client-side navigation and protected routes. |

## 🛠️ Getting Started

Follow these steps to get your MERN chat application running locally.

### Prerequisites

* **Node.js** (v18+) & **npm**
* A running instance of **MongoDB** (local or MongoDB Atlas)
* Git

### Installation and Setup

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/swarnika-cmd/Real-Time-Chat-Application.git](https://github.com/swarnika-cmd/Real-Time-Chat-Application.git)
    cd Real-Time-Chat-Application
    ```

2.  **Setup Backend (Server)**

    a. Install dependencies and navigate:
    ```bash
    cd server
    npm install
    ```

    b. **Create a `.env` file** in the `server` directory and add your credentials:
    ```
    # MongoDB Connection URI
    MONGODB_URI=mongodb+srv://[user]:[password]@[cluster]/[dbname]?retryWrites=true
    
    # JSON Web Token Secret (MUST be long and random)
    JWT_SECRET=your_very_long_and_random_secret_key_here
    ```

3.  **Setup Frontend (Client)**

    a. Install dependencies and navigate:
    ```bash
    cd ../client 
    npm install
    ```

### Running the Application

You must run the backend and frontend simultaneously in two separate terminal windows/tabs.

| Folder | Command | Purpose | Port |
| :--- | :--- | :--- | :--- |
| **Terminal 1 (`/server`)** | `npm run dev` | Starts the **Backend API** and **Socket Server** | `5000` |
| **Terminal 2 (`/client`)** | `npm run dev` | Starts the **Frontend React App** | `5173` |

Open your browser to **`http://localhost:5173/`** to begin using the application.

***

## 🔗 API Endpoints

All endpoints are prefixed with `/api`.

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| **POST** | `/users/register` | Creates a new user. | Public |
| **POST** | `/users/login` | Authenticates user and returns JWT. | Public |
| **GET** | `/users/all` | Retrieves all users (for sidebar). | Private |
| **POST** | `/messages` | Saves a new message to DB and triggers socket broadcast. | Private |
| **GET** | `/messages/:id` | Retrieves conversation history with specified user ID. | Private |

## 🌐 Socket.io Events

| Event | Direction | Purpose |
| :--- | :--- | :--- |
| **`join_chat`** | Client → Server | Client asks to join a specific conversation room. |
| **`new_message`** | Client → Server | Client sends saved message data for immediate broadcast. |
| **`message_received`** | Server → Client | Server broadcasts the message to all clients in the chat room. |

***

## 2. How to Directly Enter the README on GitHub

The easiest and most common way to add the initial README (or any file) to a repository that's already pushed is through the GitHub website interface.

1.  **Go to your Repository:** Navigate to `https://github.com/swarnika-cmd/Real-Time-Chat-Application.git` in your web browser.
2.  **Click "Add file":** On the main page of your repository, look for the **"Add file"** button, then select **"Create new file"**.
3.  **Name the File:** In the filename field, type **`README.md`** (GitHub will automatically recognize this name and format the file).
4.  **Paste Content:** Paste the entire Markdown content provided above into the editing window.
5.  **Commit:** Scroll to the bottom and add a commit message (e.g., "DOCS: Add initial project README.md file").
6.  Click the **"Commit new file"** button.

The file will instantly be committed to your repository's `main` branch and will display as the main landing page for your project.
