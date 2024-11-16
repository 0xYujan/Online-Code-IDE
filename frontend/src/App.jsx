import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Home from './pages/Home';
import NoPage from './pages/NoPage';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Editior from './pages/Editior';
import { Toaster } from 'react-hot-toast';

// PrivateRoute component that checks login status before rendering protected routes
const PrivateRoute = ({ children }) => {
  let isLoggedIn = localStorage.getItem("isLoggedIn");
  return isLoggedIn ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <>
      <div>
        <Toaster
          position='top-right'
          toastOptions={{
            success: {
              theme: {
                primary: '#4aed88',
              },
            },
          }}
        />
      </div>

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/signUp" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/editior/:projectID" element={<PrivateRoute><Editior /></PrivateRoute>} />
          <Route path="*" element={<PrivateRoute><NoPage /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
