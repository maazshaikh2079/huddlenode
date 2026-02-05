import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useHttpClient } from "../hooks/http-hook.js";
import { AuthContext } from "../context/auth-context.js";

// --- ICON IMPORTS ---
import {
  MdAdd,
  MdSearch,
  MdArrowBack,
  MdSave,
  MdDeleteForever,
} from "react-icons/md";
import { FaCommentAlt } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { BiSolidEditAlt } from "react-icons/bi";
import { RiImageEditFill } from "react-icons/ri";

// --- CHILD COMPONENT IMPORT ---
import PostList from "../components/PostList.jsx";

const ForumDetails = () => {
  // --- HOOKS & CONTEXT ---
  const { forumId } = useParams();
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const { isLoading, sendRequest } = useHttpClient();

  // --- COMPONENT STATE ---
  const [forum, setForum] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postSearchQuery, setPostSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);

  // --- REFS ---
  const menuRef = useRef(null);
  const imageMenuRef = useRef(null);
  const descriptionRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- CLICK OUTSIDE HANDLER ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target))
        setIsMenuOpen(false);
      if (imageMenuRef.current && !imageMenuRef.current.contains(event.target))
        setShowImageMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- HELPER FUNCTIONS ---
  const formatTimestamp = (dateString) => {
    if (!dateString) return "time";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  // --- API HANDLERS: FORUM MANAGEMENT ---

  // Update Cover Image via Cloudinary
  const changeCoverImage = async (imageFile) => {
    setIsUpdatingImage(true);
    try {
      const formData = new FormData();
      formData.append("coverImage", imageFile);
      const responseData = await sendRequest(
        `${import.meta.env.VITE_BACKEND_URL}/api/forums/${forumId}/edit/cover-image`,
        "PATCH",
        formData,
        { Authorization: `Bearer ${auth.token}` }
      );
      setForum({
        ...forum,
        coverImage: responseData.updation.forum.coverImage,
      });
      setShowImageMenu(false);
    } catch (err) {
      console.error("log> Error updating cover image:", err.message);
    } finally {
      setIsUpdatingImage(false);
    }
  };

  // Save Edited Title/Description
  const saveEditHandler = async () => {
    if (
      editForm.title.trim().length === 0 ||
      editForm.description.trim().length < 2
    )
      return;
    setIsSaving(true);
    try {
      const responseData = await sendRequest(
        `${import.meta.env.VITE_BACKEND_URL}/api/forums/${forumId}/edit/texts`,
        "PATCH",
        JSON.stringify(editForm),
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        }
      );
      setForum(responseData.updation.forum);
      setIsEditing(false);
    } catch (err) {
    } finally {
      setIsSaving(false);
    }
  };

  // Permanent Forum Deletion
  const deleteForumHandler = async () => {
    if (!window.confirm("Are you sure you want to FORCE DELETE this forum?"))
      return;
    const userInput = window.prompt(
      `To confirm delete type forum title "${forum.title}":`
    );
    if (userInput !== forum.title) return alert("Title match failed.");

    setIsDeleting(true);
    try {
      await sendRequest(
        `${import.meta.env.VITE_BACKEND_URL}/api/forums/${forumId}`,
        "DELETE",
        null,
        { Authorization: `Bearer ${auth.token}` }
      );
      navigate("/");
    } catch (err) {
    } finally {
      setIsDeleting(false);
    }
  };

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchAllData = async () => {
      if (!forumId || forumId === "user") return;
      try {
        const getForumRes = await sendRequest(
          `${import.meta.env.VITE_BACKEND_URL}/api/forums/${forumId}`
        );
        setForum(getForumRes.forum);
        setEditForm({
          title: getForumRes.forum.title,
          description: getForumRes.forum.description,
        });

        const getForumPostsRes = await sendRequest(
          `${import.meta.env.VITE_BACKEND_URL}/api/posts/forum/${forumId}`
        );
        setPosts(getForumPostsRes.forumPosts || []);
      } catch (err) {}
    };
    fetchAllData();
  }, [sendRequest, forumId]);

  // --- LOADING SCREEN ---
  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="w-full py-8 space-y-6">
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-zinc-500 hover:text-primary transition-colors mb-4"
      >
        <MdArrowBack className="text-xl" />
        <span>Back to Forums</span>
      </button>

      {forum && (
        <div
          className={`${auth.userId === forum.creator ? "bg-[#d4d9ff]/25" : "bg-white"} rounded-xl border border-zinc-300 overflow-hidden flex flex-col md:flex-row shadow-sm min-h-[300px] relative`}
        >
          {/* COVER IMAGE SECTION */}
          <div
            className={`${auth.userId === forum.creator ? "bg-[#d4d9ff]/26" : "bg-zinc-50"} md:w-1/3 flex items-center justify-center p-4 md:p-6 border-b md:border-b-0 md:border-r border-zinc-300 relative`}
          >
            {/* Hidden Input for uploading files */}
            {auth.userId === forum.creator && (
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".jpg, .jpeg, .png"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) changeCoverImage(file);
                }}
              />
            )}

            <div
              className={`relative w-full h-48 md:h-full rounded-lg overflow-hidden group ${auth.userId === forum.creator ? "cursor-pointer" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                if (auth.userId === forum.creator && !isUpdatingImage)
                  setShowImageMenu(!showImageMenu);
              }}
            >
              {forum.coverImage ? (
                <img
                  src={forum.coverImage}
                  alt={forum.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-zinc-400 text-center italic w-full h-full flex items-center justify-center bg-zinc-100">
                  <p className="text-sm md:text-lg">No forum cover image</p>
                </div>
              )}
              {/* Image Overlay for Creators */}
              {auth.userId === forum.creator && (
                <div
                  className={`absolute inset-0 bg-black/25 flex items-center justify-center transition-opacity ${isUpdatingImage ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                >
                  {isUpdatingImage ? (
                    <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <RiImageEditFill className="text-white text-3xl md:text-4xl drop-shadow-lg" />
                  )}
                </div>
              )}
            </div>

            {/* Floating Image Change Menu */}
            {auth.userId === forum.creator && showImageMenu && (
              <div
                className="absolute left-[50%] -translate-x-1/2 md:left-[85%] md:translate-x-0 top-1/4 z-50"
                ref={imageMenuRef}
              >
                <div className="bg-white text-zinc-800 w-44 md:w-52 rounded-lg shadow-2xl py-2 border border-zinc-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current.click();
                      setShowImageMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-zinc-50 transition-colors flex items-center gap-3 font-semibold text-zinc-700 text-xs md:text-sm whitespace-nowrap"
                  >
                    <RiImageEditFill className="text-zinc-500 text-base" />{" "}
                    Change Cover Image
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* FORUM TEXT & DETAILS SECTION */}
          <div className="md:w-2/3 p-6 md:p-10 flex flex-col relative">
            {/* Creator-only Management Dropdown (Dots) */}
            {auth.userId === forum.creator && (
              <div
                className="absolute top-4 right-4 md:top-10 md:right-10 z-30 flex flex-col items-end"
                ref={menuRef}
              >
                {isEditing ? (
                  <button
                    disabled={isSaving}
                    onClick={saveEditHandler}
                    className="bg-primary text-white p-2 px-4 rounded-md flex items-center gap-2 hover:opacity-90 shadow-sm mb-4"
                  >
                    <MdSave className="text-xl" />{" "}
                    <span className="font-semibold">
                      {isSaving ? "Saving..." : "Save"}
                    </span>
                  </button>
                ) : (
                  <button
                    disabled={isDeleting}
                    className={`p-2 rounded-full transition-colors ${isMenuOpen ? "bg-zinc-200 text-zinc-900" : "text-zinc-600 hover:bg-zinc-200/50"}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                    <BsThreeDotsVertical className="text-xl" />
                  </button>
                )}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 shadow-xl rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 border-b border-zinc-100"
                      onClick={() => {
                        setIsEditing(true);
                        setIsMenuOpen(false);
                      }}
                    >
                      <BiSolidEditAlt className="text-lg text-zinc-500" /> Edit
                      Text
                    </button>
                    <button
                      disabled={isDeleting}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                      onClick={deleteForumHandler}
                    >
                      <MdDeleteForever className="text-xl" /> Force Delete Forum
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Conditional Rendering: Edit Mode Form vs View Mode Content */}
            {isEditing ? (
              <div className="space-y-6 mt-12 md:mt-0">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase">
                    Title
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white border-b border-primary focus:border-b-2 outline-none py-1 text-2xl font-semibold transition-all"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    autoFocus
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase">
                    Description
                  </label>
                  <textarea
                    ref={descriptionRef}
                    className="w-full bg-white border-b border-primary focus:border-b-2 outline-none py-1 text-lg text-zinc-500 transition-all resize-none overflow-hidden"
                    rows={1}
                    value={editForm.description}
                    onChange={(e) => {
                      e.target.style.height = "auto";
                      e.target.style.height = `${e.target.scrollHeight}px`;
                      setEditForm({ ...editForm, description: e.target.value });
                    }}
                  />
                </div>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({
                      title: forum.title,
                      description: forum.description,
                    });
                  }}
                  className="text-xs font-bold text-zinc-400 hover:text-zinc-600 underline"
                >
                  Cancel Editing
                </button>
              </div>
            ) : (
              <div className="mt-8 md:mt-0">
                <h1 className="text-2xl md:text-3xl font-semibold text-zinc-800 mb-4 pr-10">
                  {forum.title}
                </h1>
                <p className="text-zinc-500 text-base md:text-lg mb-8 leading-relaxed">
                  {forum.description}
                </p>
              </div>
            )}

            {/* Footer metadata for the forum card */}
            <div className="mt-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
              <div className="flex items-center gap-2 text-zinc-500 text-sm md:text-base">
                <FaCommentAlt className="text-sm" />
                <span>
                  {posts.length} {posts.length === 1 ? "post" : "posts"}
                </span>
              </div>
              <div className="text-[10px] md:text-[11px] text-zinc-400 text-left md:text-right leading-tight">
                <p>created at: {formatTimestamp(forum.createdAt)}</p>
                {forum.updatedAt !== forum.createdAt && (
                  <p>updated at: {formatTimestamp(forum.updatedAt)}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UTILITY BAR (Search & New Post Button) */}
      <div className="relative md:sticky md:top-16 z-20 bg-zinc-100/90 backdrop-blur-sm rounded-lg p-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm border border-zinc-200">
        <h2 className="text-2xl font-bold text-zinc-900">Posts</h2>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* Search Input Container */}
          <div className="relative w-full sm:w-72">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xl" />
            <input
              type="text"
              placeholder="Filter posts..."
              value={postSearchQuery}
              onChange={(e) => setPostSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
          {/* Action Button: New Post */}
          <button
            onClick={() =>
              auth.isLoggedIn
                ? navigate(`/forum/${forum.id || forum._id}/post/new-post`)
                : navigate(`/auth/Sign-In`)
            }
            className="bg-primary hover:opacity-80 text-white px-5 py-2 rounded-md flex items-center gap-2 font-medium transition-all shadow-sm active:scale-95"
          >
            <MdAdd className="text-xl" /> New Post
          </button>
        </div>
      </div>

      {/* CHILD POST LIST COMPONENT */}
      <PostList
        posts={posts}
        postSearchQuery={postSearchQuery}
        formatTimestamp={formatTimestamp}
      />
    </div>
  );
};

export default ForumDetails;
