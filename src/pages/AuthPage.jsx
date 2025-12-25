import { useState } from "react";
import { useAuth } from "../components/Auth/AuthContext";
import { toast } from "react-toastify";
import "../styles/authpage.css";

export default function AuthPage() {
  const { signUp, signIn, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setBtnLoading(true);
    if (isLogin) {
      await signIn(email, password);
    } else {
      await signUp(email, password);
    }
    setBtnLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>{isLogin ? "Log in to Flowva" : "Create Your Account"}</h2>
        {isLogin && <p>Log in to receive personalized recommendations</p>}
        {!isLogin && <p>Sign up to manage your tools</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          {!isLogin && (
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <span
                className="toggle-password"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </span>
            </div>
          )}

          {isLogin && <p className="forgot-password">Forgot Password?</p>}

          <button type="submit" className="submit-btn" disabled={btnLoading}>
            {btnLoading ? (
              <span className="btn-loading-spinner"></span>
            ) : isLogin ? (
              "Sign in"
            ) : (
              "Sign Up Account"
            )}
          </button>
        </form>

        <div className="divider">or</div>

        <button className="google-btn">
          <img src="/google-logo.png" alt="Google" />
          Sign in with Google
        </button>

        <p className="toggle-account">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            className="toggle-btn"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
