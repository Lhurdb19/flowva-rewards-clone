
import { AuthProvider, useAuth } from "./components/Auth/AuthContext";
import AuthPage from "./pages/AuthPage";


import Rewards from "./pages/Rewards";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) return (
  <div className="page-loading"> 
  <p>Loading...</p>
  <img src="/flowva_logo.png" alt="loading" />
  </div>

  );

  return user ? <Rewards /> : <AuthPage />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

export default App;
