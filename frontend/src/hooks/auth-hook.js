import { useState, useCallback, useEffect } from "react";
import { useHttpClient } from "./http-hook.js";
import { useNavigate } from "react-router-dom";

let logoutTimer;

export const useAuth = () => {
  const navigate = useNavigate();

  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  const [username, setUsername] = useState(null);
  const [email, setEmail] = useState(null);
  const [pfp, setPfp] = useState(null);

  const [tokenExpirationDate, setTokenExpirationDate] = useState(null);

  const { sendRequest } = useHttpClient();

  const loginHandler = useCallback(
    async (uid, token, expirationDate) => {
      setUserId(uid);
      setToken(token);

      // console.log("log> App.jsx - loginHandler() -");
      console.log("log> auth-hook.js - loginHandler() -");
      console.log(`log> token: ${token}`);
      console.log(`log> uid: ${uid}`);
      expirationDate &&
        console.log(
          `log> expirationDate.toISOString(): ${expirationDate.toISOString()}`
        );

      const expiration =
        expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
      // expirationDate || new Date(new Date().getTime() + 10000);

      setTokenExpirationDate(expiration); // For auto-logout

      try {
        const responseData = await sendRequest(
          // url:
          `${import.meta.env.VITE_BACKEND_URL}/api/users/${uid}`
        );

        setUsername(responseData.user.username);
        setEmail(responseData.user.email);
        setPfp(responseData.user.pfp);

        localStorage.setItem(
          "userData",
          JSON.stringify({
            userId: uid,
            token,
            expiration: expiration.toISOString(),
          })
        );
      } catch (err) {
        console.log(
          "log> Failed to fetch user after login - Error:",
          err.message
        );
      }
    },
    [sendRequest]
  );

  const logoutHandler = useCallback(() => {
    setToken(null);
    setUserId(null);

    setUsername(null);
    setEmail(null);
    setPfp(null);

    setTokenExpirationDate(null); // For auto-logout

    localStorage.removeItem("userData");

    navigate("/");
  }, []);

  // auto-login useEffect
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("userData"));

    if (
      storedData &&
      storedData.token &&
      new Date(storedData.expiration) > new Date()
    ) {
      // console.log("log> App.jsx - useEffect() -");
      console.log("log> auth-hook.js - useEffect() -");
      console.log(`log> token: ${storedData.token}`);
      console.log(`log> userId: ${storedData.userId}`);
      console.log(`log> expiration: ${storedData.expiration}`);

      loginHandler(
        storedData.userId,
        storedData.token,
        new Date(storedData.expiration)
      );

      // console.log("log> App.jsx - useEffect() -");
      console.log("log> auth-hook.js - useEffect() -");
      console.log("log> User auto-logged-in!");
    } else {
      // console.log("log> App.jsx - useEffect() -");
      console.log("log> auth-hook.js - useEffect() -");

      if (!storedData || !storedData.token) {
        console.log(
          "log> `!storedData` or `!storedData.token` i.e. localStorage is empty, log-in!"
        );
      } else {
        console.log(
          "log> token-expiration-date-time < current-date-time i.e. token expired, cannot auto-login, log-in again manually."
        );
      }

      navigate("/");
    }
  }, [loginHandler]);

  // auto-logout useEffect
  useEffect(() => {
    // when manaul-login or auto-login
    if (token && tokenExpirationDate) {
      const remainingTime =
        tokenExpirationDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logoutHandler, remainingTime);
    }
    // when manaul-logout
    // if token == null
    else {
      clearTimeout(logoutTimer);
    }
  }, [token, tokenExpirationDate, logoutHandler]);

  return {
    token,
    userId,
    username,
    email,
    pfp,
    loginHandler,
    logoutHandler,
  };
};
