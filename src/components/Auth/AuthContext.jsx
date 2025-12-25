import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(user);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        toast.error(authError.message || "Signup failed");
        return;
      }

      const userId = authData.user.id;
      if (!userId) throw new Error("No user ID returned from Supabase.");

      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        email,
        username: email.split("@")[0],
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        toast.error(`Failed to create profile: ${profileError.message}`);
        return;
      }

      toast.success(
        "Account created successfully! Please check your email to confirm."
      );
    } catch (err) {
      console.error("Unexpected signup error:", err);
      toast.error("Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Login successful!");
    } catch (err) {
      console.error(err);
      toast.error("Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) return toast.error(error.message);

      toast.success("Logged out successfully");
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      toast.error("Logout failed.");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
