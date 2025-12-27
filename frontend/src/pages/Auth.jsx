import React, { useContext, useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useHttpClient } from "./../hooks/http-hook.js";
import { AuthContext } from "../context/auth-context.js";

const Auth = () => {
  const auth = useContext(AuthContext);

  const navigate = useNavigate();
  const { authMode } = useParams();

  const { sendRequest } = useHttpClient();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pfp, setPfp] = useState(null);

  const filePickerRef = useRef();

  const pickImageHandler = (event) => {
    if (event.target.files && event.target.files.length === 1) {
      setPfp(event.target.files[0]);
    }
  };

  const authSubmitHandler = async (event) => {
    event.preventDefault();

    console.log("log> authMode:", authMode);

    // authmode -> login
    if (authMode === "Sign-In") {
      try {
        const responseData = await sendRequest(
          // url:
          `${import.meta.env.VITE_BACKEND_URL}/api/users/login`,
          // method:
          "POST",
          // body:
          JSON.stringify({
            email,
            password,
          }),
          // header:
          { "Content-Type": "application/json" }
        );

        console.log("log> responseData:-");
        console.log(responseData);

        // console.log("log> User logged-in");
        console.log(`log> ${responseData.login.message}!`);
        alert(`log> ${responseData.login.message}!`);

        auth.loginHandler(responseData.login.userId, responseData.login.token);

        navigate("/");
      } catch (err) {
        console.log(`log> Error: ${err.message}`);
      }
    }
    // authmode -> sign-up / register
    else {
      try {
        const formData = new FormData();
        formData.append("email", email);
        formData.append("username", username);
        formData.append("password", password);
        if (pfp) {
          formData.append("pfp", pfp);
        }

        const responseData = await sendRequest(
          // url:
          `${import.meta.env.VITE_BACKEND_URL}/api/users/signup`,
          // method:
          "POST",
          // body:
          formData
        );

        console.log("log> responseData:-");
        console.log(responseData);

        console.log(`log> ${responseData.registeration.message}!`);

        auth.loginHandler(
          responseData.registeration.userId,
          responseData.registeration.token
        );

        navigate("/");
      } catch (err) {
        console.log(`log> Error: ${err.message}`);
      }
    }
  };

  return (
    // border
    <form
      onSubmit={authSubmitHandler}
      className=" min-h-[80vh] flex items-center"
    >
      <div className="border border-zinc-200 flex flex-col gap-3 m-auto items-start p-8 min-w-85 sm:min-w-96 rounded-xl text-zinc-600 text-sm shadow-lg">
        <p className="text-2xl font-semibold">
          {authMode === "Sign-In" ? "Login" : "Create Account"}
        </p>
        <p>
          Please {authMode === "Sign-In" ? "log-in" : "sign-up"} to book
          appointment
        </p>
        {authMode === "Sign-Up" ? (
          <>
            <div className="w-full">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                required
                onChange={(event) => setUsername(event.target.value)}
                className="border border-zinc-300 rounded w-full p-2 mt-1"
              />
            </div>
            <div className="w-full">
              <label htmlFor="pfp">Profile Picture (.jpg, .png, .jpeg)</label>
              <input
                ref={filePickerRef}
                id="pfp"
                type="file"
                accept=".jpg,.png,.jpeg"
                onChange={pickImageHandler}
                className="border border-zinc-300 rounded w-full p-2 mt-1"
              />
            </div>
          </>
        ) : null}
        <div className="w-full">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            required
            onChange={(event) => setEmail(event.target.value)}
            className="border border-zinc-300 rounded w-full p-2 mt-1"
          />
        </div>
        <div className="w-full">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            required
            onChange={(event) => setPassword(event.target.value)}
            className="border border-zinc-300 rounded w-full p-2 mt-1"
          />
        </div>

        {/* <button className="bg-primary text-white w-full py-2 rounded-md text-base">
          {authMode === "Sign-In" ? "Login" : "Register"}
        </button> */}

        <input
          type="submit"
          value={authMode === "Sign-In" ? "Login" : "Register"}
          className="bg-primary hover:opacity-80 text-white w-full py-2 rounded-md text-base"
        />

        {authMode === "Sign-In" ? (
          <p>
            Create a new account?{" "}
            <span
              //   onClick={() => setAuthMode("Sign-Up")}
              onClick={() => navigate("/auth/Sign-Up")}
              className="text-primary underline cursor-pointer"
            >
              Click here
            </span>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <span
              //   onClick={() => setAuthMode("Sign-In")}
              onClick={() => navigate("/auth/Sign-In")}
              className="text-primary underline cursor-pointer"
            >
              Login here
            </span>
          </p>
        )}
      </div>
    </form>
  );
};

export default Auth;
