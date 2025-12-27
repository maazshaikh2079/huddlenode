import React, { useContext, useState } from "react";
import {
  cross_icon,
  dropdown_icon,
  logoTitle,
  menu_icon,
} from "../assets/assets.js";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context.js";

const Navbar = () => {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  const [showMenu, setShowMenu] = useState(false);

  // Helper to handle navigation and close mobile menu simultaneously
  const handleMobileNavigate = (path) => {
    setShowMenu(false);
    navigate(path);
  };

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-zinc-400 px-4 sm:px-[5%] sticky top-0 bg-white z-40">
      {/* ---------------- LOGO-TITLE ---------------- */}
      <img
        onClick={() => navigate("/")}
        className="w-32 sm:w-48 cursor-pointer object-contain hover:opacity-80 transition-opacity"
        src={logoTitle}
        alt="logoTitle"
      />

      {/* ---------------- DESKTOP NAV ---------------- */}
      <ul className="hidden md:flex items-center gap-6 font-medium">
        <NavLink to="/" className="flex flex-col items-center gap-1 group">
          <li className="py-1 uppercase tracking-wider">Forums</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </NavLink>
      </ul>

      {/* ---------------- RIGHT SIDE (AUTH/PROFILE) ---------------- */}
      <div className="flex items-center gap-4">
        {auth.isLoggedIn ? (
          <div className="flex items-center gap-2 cursor-pointer group relative">
            <img
              className="w-8 h-8 rounded-full border border-gray-200 object-cover"
              src={auth?.pfp || "https://i.ibb.co/VpwB5Hx3/default-avatar.webp"}
              alt="Profile"
            />
            <img
              className="w-2.5 transition-transform group-hover:rotate-180"
              src={dropdown_icon}
              alt=""
            />

            {/* Dropdown Menu */}
            <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-50 hidden group-hover:block transition-all">
              <div className="min-w-48 bg-stone-100 rounded-lg shadow-xl flex flex-col gap-2 p-4 border border-gray-200">
                <p
                  onClick={() => navigate("/profile")}
                  className="hover:text-primary transition-colors cursor-pointer py-1"
                >
                  View Profile
                </p>
                <hr className="border-gray-200" />
                <p
                  onClick={() => {
                    auth.logoutHandler();
                    navigate("/");
                  }}
                  className="hover:text-red-500 transition-colors cursor-pointer py-1"
                >
                  Logout
                </p>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate("/auth/Sign-In")}
            className="hidden md:block bg-primary hover:opacity-80 text-white px-7 py-2.5 rounded-full font-medium hover:scale-105 active:scale-95 transition-all shadow-md"
          >
            SIGN IN
          </button>
        )}

        {/* Mobile Menu Toggle Icon */}
        <img
          src={menu_icon}
          alt="menu_icon"
          onClick={() => setShowMenu(true)}
          className="w-6 md:hidden cursor-pointer active:scale-90 transition-transform"
        />

        {/* ---------------- MOBILE MENU ---------------- */}
        <div
          className={`fixed inset-0 z-50 bg-white transition-all duration-300 ease-in-out md:hidden ${
            showMenu
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex items-center justify-between px-5 py-6 border-b">
            <img
              src={logoTitle}
              className="w-36"
              alt="logoTitle"
              onClick={() => handleMobileNavigate("/")}
            />
            <img
              onClick={() => setShowMenu(false)}
              src={cross_icon}
              className="w-7 cursor-pointer active:scale-90 transition-transform"
              alt="Close"
            />
          </div>

          <ul className="flex flex-col items-center gap-4 mt-10 px-5 text-lg font-medium text-gray-700">
            {!auth.isLoggedIn && (
              <button
                onClick={() => handleMobileNavigate("/auth/Sign-In")}
                className="w-full text-center py-3 bg-primary hover:opacity-80 text-white rounded-lg shadow-sm"
              >
                SIGN IN
              </button>
            )}

            <NavLink
              onClick={() => setShowMenu(false)}
              to="/"
              className={({ isActive }) =>
                `w-full text-center py-2 rounded transition-colors ${isActive ? "text-primary bg-stone-50" : "hover:bg-gray-50"}`
              }
            >
              FORUMS
            </NavLink>

            {auth.isLoggedIn && (
              <NavLink
                onClick={() => setShowMenu(false)}
                to="/profile"
                className={({ isActive }) =>
                  `w-full text-center py-2 rounded transition-colors ${isActive ? "text-primary bg-stone-50" : "hover:bg-gray-50"}`
                }
              >
                VIEW PROFILE
              </NavLink>
            )}

            {auth.isLoggedIn && (
              <button
                onClick={() => {
                  auth.logoutHandler();
                  handleMobileNavigate("/");
                }}
                className="w-full text-center py-2 text-red-500 mt-4 border border-red-100 rounded hover:bg-red-50"
              >
                LOGOUT
              </button>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
