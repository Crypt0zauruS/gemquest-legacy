import { useState, useCallback } from "react";
import { IProvider } from "@web3auth/base";
import { getWeb3AuthInstance } from "../lib/web3-auth";
import AuthService from "../services/auth-service";

export const useAuth = () => {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [authService, setAuthService] = useState<AuthService | null>(null);

  const initAuth = useCallback(async () => {
    try {
      console.log("Initializing AuthService");
      const response = await fetch("/api/web3auth");
      const data = await response.json();
      const clientId = data.clientId;
      // console.log("Web3Auth client ID:", clientId);
      const web3auth = await getWeb3AuthInstance(clientId);
      const authServiceInstance = new AuthService(web3auth);
      setAuthService(authServiceInstance);

      await authServiceInstance.initWeb3authModal();
    } catch (error) {
      console.error("Error during initAuth:", error);
    }
  }, []);

  const handleLogin = useCallback(async () => {
    if (!authService) {
      console.log("AuthService not initialized yet");
      return;
    }

    try {
      console.log("Login requested");
      const result = await authService.login();
      if (result) {
        setLoggedIn(result.isConnected);
        setProvider(result.web3authProvider);
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  }, [authService]);

  const handleLogout = useCallback(async () => {
    if (!authService) {
      console.log("AuthService not initialized yet");
      return;
    }

    try {
      await authService.logout();
      setProvider(null);
      setLoggedIn(false);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }, [authService]);

  return {
    initAuth,
    handleLogin,
    handleLogout,
    provider,
    loggedIn,
  };
};
