# Online Code IDE

Welcome to the **Online Code IDE**! This platform allows users to write, test, and run code in an online, collaborative, and user-friendly environment. Currently, it supports **HTML, CSS, and JavaScript**, with real-time collaboration features powered by Socket.IO.

## 🚀 Features

- **Real-Time Collaboration**: Collaborate with other developers and work on projects together, seeing live code updates as you type.
- **Custom Code Editor**: Fully customized code editor with syntax highlighting, line numbers, and tab indentation.
- **Syntax Highlighting**: Beautiful color-coded syntax for HTML, CSS, and JavaScript.
- **Live Preview**: Instantly see your HTML, CSS, and JavaScript output in real-time.
- **Theme Support**: Toggle between light and dark themes for comfortable coding.
- **Version History**: Track and view previous versions of your code.
- **Code Analysis**: Built-in lexical analyzer to tokenize and analyze your code.
- **User Authentication**: Secure login and signup with JWT-based authentication.
- **Project Management**: Create, save, and manage multiple projects.
- **Invite Collaboration**: Share project invite codes to collaborate with team members.
- **Auto-Save**: Automatic project saving with Ctrl+S support.

## 💻 Tech Stack

### Frontend
- **React.js 18.3.1**: Modern UI library
- **Vite 5.4.10**: Fast build tool and dev server
- **TailwindCSS 3.4.14**: Utility-first CSS framework
- **Custom Code Editor**: Built-in syntax highlighting and editor features
- **Socket.IO Client 4.8.1**: Real-time bidirectional communication
- **React Router DOM 6.28.0**: Client-side routing
- **React Hot Toast 2.4.1**: Beautiful toast notifications
- **React Icons 5.3.0**: Popular icon library

### Backend
- **Node.js & Express.js 4.21.1**: Server framework
- **Socket.IO 4.8.1**: Real-time collaboration
- **MongoDB & Mongoose 8.8.0**: Database and ODM
- **JWT (jsonwebtoken 9.0.2)**: Authentication
- **bcryptjs 2.4.3**: Password hashing
- **dotenv 16.4.5**: Environment variable management
- **CORS**: Cross-origin resource sharing

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

### Step 1: Clone the Repository
```bash
git clone https://github.com/0xYujan/Online-Code-IDE.git
cd Online-Code-IDE
```

### Step 2: Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install backend dependencies:
```bash
npm install
```

3. Create a `.env` file in the `backend` directory with the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

4. Start the backend server:
```bash
npm start
```

The backend server will run on [http://localhost:3000](http://localhost:3000)

### Step 3: Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install frontend dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on [http://localhost:5173](http://localhost:5173)

### Step 4: Access the Application

Open your browser and navigate to [http://localhost:5173](http://localhost:5173) to start using the Online Code IDE!

## 📖 Usage Guide

### Creating an Account
1. Navigate to the signup page
2. Enter your name, email, and password
3. Click "Sign Up" to create your account

### Logging In
1. Go to the login page
2. Enter your credentials
3. Click "Login" to access your dashboard

### Creating a Project
1. From the home page, click "Create New Project"
2. Enter a project name
3. Start coding in the Monaco editor

### Collaborating with Others
1. Open your project
2. Click the "Invite" button in the navbar
3. Copy the project invite code
4. Share the code with your collaborators
5. They can join using the invite code

### Real-Time Features
- **Live Code Updates**: See your collaborators' code changes in real-time
- **User Presence**: View who's currently working on the project
- **Instant Preview**: See output updates immediately in the preview pane

### Editor Features
- **Tab Switching**: Switch between HTML, CSS, and JavaScript tabs
- **Theme Toggle**: Click the sun/moon icon to switch themes
- **Expand View**: Click the expand icon to maximize the editor
- **Version History**: Click the history icon to view previous versions
- **Code Analysis**: Click the code icon to analyze your code with the lexical analyzer
- **Auto-Save**: Press Ctrl+S to manually save, or changes auto-save periodically

## 🎯 Project Structure

```
Online-Code-IDE/
├── backend/
│   ├── bin/
│   │   └── www              # Socket.IO server configuration
│   ├── models/
│   │   ├── userModel.js     # User schema
│   │   └── projectModel.js  # Project schema
│   ├── routes/
│   │   ├── index.js         # API routes
│   │   └── users.js         # User routes
│   ├── app.js               # Express app configuration
│   ├── server.js            # Server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── EditiorNavbar.jsx
│   │   │   ├── CodeAnalysis.jsx
│   │   │   ├── VersionHistory.jsx
│   │   │   └── Collaboration.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── SignUp.jsx
│   │   │   └── Editior.jsx
│   │   ├── utils/
│   │   │   └── lexicalAnalyzer.js
│   │   ├── socket.js        # Socket.IO client configuration
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or your MongoDB Atlas connection string is correct
- Check if your IP address is whitelisted in MongoDB Atlas

### Port Already in Use
- Backend (Port 3000): Change the PORT in `.env` file
- Frontend (Port 5173): Vite will automatically use the next available port

### Socket.IO Connection Failed
- Ensure both backend and frontend servers are running
- Check CORS configuration in backend if accessing from different domains
- Verify the socket URL in frontend matches your backend URL

### Icons Not Displaying
- Ensure `react-icons` is properly installed: `npm install react-icons`
- Clear browser cache and restart the dev server

## 🎯 Roadmap

### Current Features ✅
- Real-time collaborative editing
- HTML, CSS, JavaScript support
- Monaco Editor integration
- User authentication
- Project management
- Version history
- Code analysis (Lexical analyzer)

### Upcoming Features 🚀
- Support for additional programming languages (Python, Java, C++)
- File upload and import functionality
- Code execution in sandboxed environments
- Enhanced collaboration tools (cursor tracking, chat)
- AI-powered code suggestions
- Mobile responsive design improvements
- Export projects as zip files
- Syntax error highlighting
- Multiple file support per project

## 📋 How to Contribute

Contributions are welcome! If you have any ideas or improvements, feel free to fork the repo and submit a pull request.

### Contributing Steps:
1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

### Code Style Guidelines:
- Follow existing code formatting
- Write clear commit messages
- Add comments for complex logic
- Test your changes before submitting

## 🙏 Acknowledgments

- [Socket.IO](https://socket.io/) - Real-time bidirectional event-based communication
- [React Icons](https://react-icons.github.io/react-icons/) - Popular icon library
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vite](https://vitejs.dev/) - Next generation frontend tooling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
