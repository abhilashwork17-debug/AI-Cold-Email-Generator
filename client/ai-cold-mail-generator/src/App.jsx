import React, { useState } from "react";
import { useAuth } from './context/authContext'
import { Router } from "react-router-dom";
import LandingPage from "./pages/LandingPage";

function App() {
  const { user,loading } = useAuth();

  if(loading){
    return <p>Loading...</p>;
  }

  return (
    <Router>
      <Toaster position = "top-right"/>
      <Routes>
        <Routes path = "/" element = {<LandingPage/>} />
      </Routes>
    </Router>
  );
}

export default App;
