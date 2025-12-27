import React, { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../context/auth-context.js";
import { useHttpClient } from "../hooks/http-hook.js";
import { MdEdit } from "react-icons/md";
import { BiSolidSave } from "react-icons/bi";
import { RiImageEditFill } from "react-icons/ri";
import TabbedPane from "../components/TabbedPane.jsx";

const Profile = () => {
  const auth = useContext(AuthContext);
  const { sendRequest } = useHttpClient();

  const [showPfpMenu, setShowPfpMenu] = useState(false);
  const [isLoadingNewPfp, setIsLoadingNewPfp] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isLoadingNewUsername, setIsLoadingNewUsername] = useState(false);

  const menuRef = useRef(null);
  const fileInputRef = useRef(null);
  const usernameInputRef = useRef(null);

  const changePfp = async (imageFile) => {
    try {
      setIsLoadingNewPfp(true);
      const formData = new FormData();
      formData.append("pfp", imageFile);

      const responseData = await sendRequest(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/edit/pfp`,
        "PATCH",
        formData,
        { Authorization: `Bearer ${auth.token}` }
      );

      if (responseData.updation?.user?.pfp) {
        auth.pfp = responseData.updation.user.pfp;
      }
    } catch (err) {
      console.log("log> Upload error:", err.message);
    } finally {
      setIsLoadingNewPfp(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const changeUsername = async (newUsername) => {
    if (!newUsername || newUsername === auth.username) {
      setIsEditingUsername(false);
      return;
    }

    try {
      setIsLoadingNewUsername(true);
      const responseData = await sendRequest(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/edit/username`,
        "PATCH",
        JSON.stringify({ username: newUsername }),
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        }
      );

      if (responseData.updation?.user?.username) {
        auth.username = responseData.updation.user.username;
      }
    } catch (err) {
      console.log("log> Username update error:", err.message);
    } finally {
      setIsLoadingNewUsername(false);
      setIsEditingUsername(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowPfpMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 p-4 md:p-8 text-sm">
      {/* -------------------- USER PFP SECTION -------------------- */}
      <div className="flex flex-col items-start gap-4">
        <div className="relative group" ref={menuRef}>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".jpg, .jpeg, .png"
            disabled={isLoadingNewPfp}
            onChange={(e) => {
              const imageFile = e.target.files[0];
              if (imageFile) {
                setShowPfpMenu(false);
                changePfp(imageFile);
              }
            }}
          />

          <div
            className={`relative cursor-pointer rounded-2xl border border-primary/20 hover:border-primary/50 shadow-md transition-all bg-zinc-100 overflow-hidden w-36 h-51 md:w-44 md:h-63 ${isLoadingNewPfp ? "opacity-50 cursor-wait" : ""}`}
            onClick={() => !isLoadingNewPfp && setShowPfpMenu(!showPfpMenu)}
          >
            <img
              src={auth.pfp || "https://i.ibb.co/VpwB5Hx3/default-avatar.webp"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
            <div
              className={`absolute inset-0 bg-black/25 flex items-center justify-center transition-opacity ${isLoadingNewPfp ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
            >
              {isLoadingNewPfp ? (
                <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <RiImageEditFill className="text-white text-4xl drop-shadow-lg" />
              )}
            </div>
          </div>

          {!isLoadingNewPfp && showPfpMenu && (
            <div className="absolute left-0 md:left-full md:ml-4 top-full md:top-0 mt-2 z-50">
              <div className="bg-white text-zinc-800 w-48 rounded-lg shadow-2xl py-2 border border-zinc-100 animate-in fade-in zoom-in duration-200">
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="w-full text-left px-4 py-3 hover:bg-zinc-50 transition-colors flex items-center gap-3 font-medium border-b border-zinc-50"
                >
                  <RiImageEditFill className="text-zinc-500 text-xl" />
                  Change Avatar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* -------------------- USERNAME SECTION -------------------- */}
      <div className="flex items-center justify-between w-full min-h-[50px]">
        <div className="flex-1 mr-4">
          {isEditingUsername ? (
            <input
              type="text"
              className="w-full bg-zinc-50 border border-zinc-300 text-3xl font-bold p-2 outline-none rounded-lg focus:ring-2 focus:ring-primary/20 transition-all"
              defaultValue={auth.username}
              disabled={isLoadingNewUsername}
              ref={usernameInputRef}
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-3">
              {isLoadingNewUsername ? (
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <h1 className="font-bold text-3xl md:text-4xl text-zinc-900 break-words">
                  {auth.username}
                </h1>
              )}
            </div>
          )}
        </div>

        <button
          disabled={isLoadingNewUsername}
          onClick={() =>
            isEditingUsername
              ? changeUsername(usernameInputRef.current.value)
              : setIsEditingUsername(true)
          }
          className="border border-zinc-200 p-3 rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          {isEditingUsername ? (
            <BiSolidSave className="text-xl" />
          ) : (
            <MdEdit className="text-xl" />
          )}
        </button>
      </div>

      <hr className="bg-zinc-200 h-[1px] border-none" />

      {/* ----------- CONTACT INFORMATION ----------- */}
      <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100">
        <p className="text-zinc-400 uppercase tracking-widest text-[10px] font-bold mb-4">
          Information
        </p>
        <div className="grid grid-cols-[120px_1fr] gap-y-3 text-zinc-700">
          <p className="font-medium text-zinc-500">Account ID:</p>
          <p className="text-primary font-medium truncate">{auth.email}</p>
        </div>
      </div>

      {/* ---------- TabbedPane for user created forums, posts and comments ---------- */}
      <TabbedPane />
    </div>
  );
};

export default Profile;
