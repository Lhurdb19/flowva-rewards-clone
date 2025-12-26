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
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
    setLoading(false);
  };

  getUser();

  const { data: listener } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      setUser(session?.user || null);

      if (event === "PASSWORD_RECOVERY") {
        setIsPasswordRecovery(true);
      } else {
        setIsPasswordRecovery(false);
      }

      setLoading(false);

      if (session?.user) {
        await createProfileIfNotExists(
          session.user.id,
          session.user.email
        );
      }
    }
  );

  return () => listener.subscription.unsubscribe();
}, []);

  const createProfileIfNotExists = async (userId, email) => {
    try {
      const { data: existingProfile, error } = await supabase
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
        } else {
          console.log("Profile created successfully");
        }
      }
    } catch (err) {
      console.error("Error checking/creating profile:", err);
    }
  };

  const signUp = async (email, password) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      toast.error(authError.message || "Signup failed");
      return;
    }

    toast.success(
      "Account created! Please check your email to confirm before logging in."
    );
  };

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return toast.error(error.message);
    toast.success("Login successful!");
  };

  const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin, // returns user back to your app
    },
  });

  if (error) {
    toast.error(error.message || "Google sign-in failed");
  }
};

const forgotPassword = async (email) => {
  if (!email) {
    toast.error("Please enter your email first");
    return;
  }

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/reset-password", // user lands on your ResetPassword page
  });

  if (error) {
    toast.error(error.message);
  } else {
    toast.success("Password reset email sent! Check your inbox.");
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
