import { AuthProvider, useAuth } from "./components/Auth/AuthContext";
import AuthPage from "./pages/AuthPage";
import Rewards from "./pages/Rewards";
import ResetPassword from "./pages/ResetPassword";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function AppContent() {
  const { user, loading, isPasswordRecovery } = useAuth();

  if (loading) {
    return (
      <div className="page-loading">
        <img src="/flowva_logo.png" alt="loading" />
      </div>
    );
  }

  if (isPasswordRecovery) {
    return <ResetPassword />;
  }

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
