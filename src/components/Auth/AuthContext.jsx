import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);

      if (user) {
        await createProfileIfNotExists(user.id, user.email);
      }
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);

        if (event === "PASSWORD_RECOVERY") {
          setIsPasswordRecovery(true);
        } else {
          setIsPasswordRecovery(false);
        }

        if (currentUser) {
          await createProfileIfNotExists(currentUser.id, currentUser.email);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const createProfileIfNotExists = async (userId, email) => {
    try {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single();

      if (!existingProfile) {
        const { error: insertError } = await supabase.from("profiles").insert({
          id: userId,
          email,
          username: email.split("@")[0],
        });

        if (insertError) {
          console.error("Failed to create profile:", insertError);
          toast.error(`Failed to create profile: ${insertError.message}`);
        }
      }
    } catch (err) {
      console.error("Error checking/creating profile:", err);
    }
  };

  const signUp = async (email, password) => {
    const { error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) return toast.error(authError.message || "Signup failed");
    toast.success("Account created! Please check your email to confirm before logging in.");
  };

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return toast.error(error.message);
    toast.success("Login successful!");
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) toast.error(error.message || "Google sign-in failed");
  };

  const forgotPassword = async (email) => {
  if (!email) {
    toast.error("Please enter your email first");
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/reset-password",
  });

  if (error) {
    toast.error(error.message);
  } else {
    toast.success(
      "Password reset email sent! Check your inbox and click the link to reset your password."
    );
  }
};

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) return toast.error(error.message);

    toast.success("Logged out successfully");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isPasswordRecovery,
        signUp,
        signIn,
        signInWithGoogle,
        forgotPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
