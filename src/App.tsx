// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Home from "./pages/Home";
import ProtectedRoute from "./component/ProtectedRoute";
import { useState } from "react";

function App() {

  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [loggedInEmail, setLoggedInEmail] = useState<string>('');
  const [logo, setLogo] = useState('');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage setLoggedIn={setLoggedIn} setLogo={setLogo} setLoggedInEmail={setLoggedInEmail} loggedInEmail={loggedInEmail} />} />
        <Route path="/home" element={<Home loggedIn={loggedIn} setLoggedIn={setLoggedIn} logo={logo} setLoggedInEmail={setLoggedInEmail} setLogo={setLogo} loggedInEmail={loggedInEmail} />} />
      </Routes>
    </Router>
  );
}

export default App;
