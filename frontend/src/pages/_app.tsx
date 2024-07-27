import "@/styles/globals.css";
import "@/styles/app.css";
import "animate.css";
import "react-toastify/dist/ReactToastify.css";
import type { AppProps } from "next/app";
import { IconContext } from "react-icons";
import Head from "next/head";
import { useEffect } from "react";
import { useAuth } from "../hook/useAuth";
import { ThemeProvider } from "../lib/ThemeContext";

export default function App({ Component, pageProps }: AppProps) {
  const { initAuth, handleLogin, handleLogout, provider, loggedIn } = useAuth();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <ThemeProvider>
      <IconContext.Provider value={{ style: { verticalAlign: "middle" } }}>
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta
            name="description"
            content="Win gems, manage your amusement park rewards"
          />
          <meta name="author" content="GemQuest Team" />
          <link rel="icon" href="/favicon.ico" />
          <title>GemQuest</title>
        </Head>
        <Component
          {...pageProps}
          login={handleLogin}
          logout={handleLogout}
          loggedIn={loggedIn}
          provider={provider}
        />
      </IconContext.Provider>
    </ThemeProvider>
  );
}
