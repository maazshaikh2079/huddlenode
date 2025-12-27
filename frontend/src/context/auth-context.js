import { createContext } from "react";

export const AuthContext = createContext({
  isLoggedIn: false,
  userId: null,
  username: null,
  email: null,
  pfp: null,
  token: null,
  loginHandler: () => {},
  logoutHandler: () => {},
});
