import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { LoginRequest, RegisterRequest, LoginResponse } from "../types/auth";
import type { AuthUser } from "../utils/authStorage";
import { loginUser, registerUser } from "../api/authApi";
import { saveAuth, getAuthUser, getToken, clearAuth } from "../utils/authStorage";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (payload: LoginRequest) => Promise<AuthUser>;
  register: (payload: RegisterRequest) => Promise<AuthUser>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapLoginResponseToAuthUser(data: LoginResponse): AuthUser {
  return {
    userId: data.userId,
    name: data.name,
    email: data.email,
    role: data.role,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Login Function
  const login = async (payload: LoginRequest): Promise<AuthUser> => {
  try {
    const data = await loginUser(payload);
    const authUser = mapLoginResponseToAuthUser(data);
    
    saveAuth(data.token, authUser);
    setUser(authUser);
    
    return authUser;
  } catch (error: any) {
    // 1. Log the error to console so you can see the exact backend response
    console.error("Login API Error:", error.response?.data);

    // 2. Extract the message. 
    // If it's a 404 (Unregistered) or 401 (Wrong PW), it usually lives in error.response.data.message
    const errorMessage = error.response?.data?.message || "Invalid email or password";
    
    // 3. Throw a clean error
    throw new Error(errorMessage);
  }
};

  // Register Function - Improved
  const register = async (payload: RegisterRequest): Promise<AuthUser> => {
    try {
      // First register the user
      await registerUser(payload);

      // Then automatically login
      const loginData = await loginUser({
        email: payload.email,
        password: payload.password,
      });

      const authUser = mapLoginResponseToAuthUser(loginData);
      saveAuth(loginData.token, authUser);
      setUser(authUser);
      return authUser;
    } catch (error: any) {
      console.error("Register error:", error);
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Registration failed. Please try again.";
      throw new Error(message);
    }
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  // Initialize user from localStorage on app start
  useEffect(() => {
    const initAuth = async () => {
      try {
        const localUser = getAuthUser();
        if (localUser) {
          setUser(localUser);
        } else {
          const token = getToken();
          if (token) {
            logout(); // Clear invalid token
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};