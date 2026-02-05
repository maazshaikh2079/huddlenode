import React, { useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useHttpClient } from "../hooks/http-hook.js";
import { AuthContext } from "../context/auth-context.js";

// --- ICON IMPORTS ---
import {
  MdImage,
  MdClose,
  MdDeleteForever,
  MdEdit,
  MdSave,
} from "react-icons/md";
import { IoPersonCircleSharp } from "react-icons/io5";
import { BsThreeDotsVertical } from "react-icons/bs";

const Comments = ({
  postId,
  comments,
  setComments,
  sortedComments,
  sortBy,
  setSortBy,
  formatTimestamp,
}) => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const { sendRequest } = useHttpClient();

  // --- LOCAL COMPONENT STATE ---
  const [commentText, setCommentText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [openCommentMenuId, setOpenCommentMenuId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [isSavingComment, setIsSavingComment] = useState(false);

  // --- REFS ---
  const textareaRef = useRef(null);
  const sortRef = useRef(null);
  const filePickerRef = useRef(null);
  const commentListRef = useRef(null);
  const editCommentRef = useRef(null);

  // --- IMAGE HANDLING LOGIC ---
  const pickedHandler = (event) => {
    if (event.target.files && event.target.files.length === 1) {
      const pickedImgFile = event.target.files[0];
      if (pickedImgFile.size > 2000000) {
        alert("File is too large! (Limit: 2MB)");
        event.target.value = null;
        return;
      }
      setSelectedImage(pickedImgFile);
      const fileReader = new FileReader();
      fileReader.onload = () => setImagePreview(fileReader.result);
      fileReader.readAsDataURL(pickedImgFile);
    }
  };

  const removeSelectedImageHandler = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (filePickerRef.current) filePickerRef.current.value = null;
  };

  // --- API HANDLERS: COMMENT OPERATIONS ---
  const commentSubmitHandler = async () => {
    if (!auth.isLoggedIn) return navigate("/auth/Sign-In");
    const formData = new FormData();
    formData.append("text", commentText);
    if (selectedImage) formData.append("image", selectedImage);
    try {
      const responseData = await sendRequest(
        `${import.meta.env.VITE_BACKEND_URL}/api/comments/post/${postId}`,
        "POST",
        formData,
        { Authorization: `Bearer ${auth.token}` }
      );
      setComments((prev) => [responseData.creation.comment, ...prev]);
      setCommentText("");
      removeSelectedImageHandler();
      setIsInputFocused(false);
    } catch (err) {}
  };

  const saveCommentEditHandler = async (commentId) => {
    if (editCommentText.trim().length === 0) return alert("Comment empty.");
    setIsSavingComment(true);
    try {
      const responseData = await sendRequest(
        `${import.meta.env.VITE_BACKEND_URL}/api/comments/${commentId}`,
        "PATCH",
        JSON.stringify({ text: editCommentText }),
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        }
      );
      setComments((prev) =>
        prev.map((c) =>
          (c.id || c._id) === commentId ? responseData.updation.comment : c
        )
      );
      setEditingCommentId(null);
    } catch (err) {
    } finally {
      setIsSavingComment(false);
    }
  };

  const deleteCommentHandler = async (commentId) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await sendRequest(
        `${import.meta.env.VITE_BACKEND_URL}/api/comments/${commentId}`,
        "DELETE",
        null,
        { Authorization: `Bearer ${auth.token}` }
      );
      setComments((prev) => prev.filter((c) => (c.id || c._id) !== commentId));
    } catch (err) {}
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5 md:p-8 shadow-sm space-y-6">
      {/* COMMENTS HEADER & SORTING */}
      <div className="flex items-center gap-4 relative" ref={sortRef}>
        <h2 className="text-lg md:text-xl font-bold text-zinc-800">
          {comments.length} Comments
        </h2>
        <button
          onClick={() => setIsSortOpen(!isSortOpen)}
          className="flex items-center gap-2 text-zinc-600 font-bold text-xs hover:text-zinc-900 border border-zinc-300 px-2 py-1 rounded"
        >
          Sort
        </button>
        {isSortOpen && (
          <div className="absolute top-10 left-28 w-32 bg-white border border-zinc-200 shadow-xl rounded-lg z-20">
            <button
              onClick={() => {
                setSortBy("newest");
                setIsSortOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-xs font-medium hover:bg-zinc-50 ${sortBy === "newest" ? "text-primary" : "text-zinc-700"}`}
            >
              Newest
            </button>
            <button
              onClick={() => {
                setSortBy("oldest");
                setIsSortOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-xs font-medium hover:bg-zinc-50 ${sortBy === "oldest" ? "text-primary" : "text-zinc-700"}`}
            >
              Oldest
            </button>
          </div>
        )}
      </div>

      {/* COMMENT INPUT SECTION */}
      <div className="flex gap-3 pt-4 border-b pb-6 border-zinc-100">
        <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-300">
          {auth.isLoggedIn && auth?.pfp ? (
            <img src={auth.pfp} className="w-full h-full object-cover" />
          ) : (
            <IoPersonCircleSharp className="w-full h-full text-zinc-300" />
          )}
        </div>
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={commentText}
            disabled={!auth.isLoggedIn}
            onFocus={() => setIsInputFocused(true)}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={
              auth.isLoggedIn ? "Add a comment..." : "Login to add comments"
            }
            className="w-full bg-transparent border-b border-zinc-300 outline-none text-sm min-h-[28px] resize-none"
          />
          {imagePreview && (
            <div className="relative mt-4 w-fit group">
              <img
                src={imagePreview}
                className="max-h-48 rounded-lg border object-contain block"
              />
              <button
                onClick={removeSelectedImageHandler}
                className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full"
              >
                <MdClose className="text-xl" />
              </button>
            </div>
          )}
          {isInputFocused && auth.isLoggedIn && (
            <div className="flex justify-between items-center mt-3">
              <input
                type="file"
                className="hidden"
                ref={filePickerRef}
                accept=".jpg,.png,.jpeg"
                onChange={pickedHandler}
              />
              <button
                onClick={() => filePickerRef.current.click()}
                className="p-1.5 text-zinc-600 hover:bg-zinc-100 rounded-full"
              >
                <MdImage className="text-xl" />
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCommentText("");
                    removeSelectedImageHandler();
                    setIsInputFocused(false);
                  }}
                  className="text-sm font-bold text-zinc-700"
                >
                  Cancel
                </button>
                <button
                  onClick={commentSubmitHandler}
                  disabled={commentText.trim().length === 0 && !selectedImage}
                  className={`px-4 py-1.5 text-sm font-bold rounded-full ${commentText.trim().length > 0 || selectedImage ? "bg-primary text-white" : "bg-zinc-100 text-zinc-400"}`}
                >
                  Comment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* COMMENT LIST SECTION */}
      <div className="space-y-6" ref={commentListRef}>
        {sortedComments.map((comment) => {
          const cId = comment.id || comment._id;
          const isEditing = editingCommentId === cId;
          return (
            <div
              key={cId}
              className="flex gap-4 p-2 rounded-lg hover:bg-zinc-50 relative group"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-300">
                {comment.author?.pfp ? (
                  <img
                    src={comment.author.pfp}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] font-bold text-zinc-400 flex items-center justify-center h-full">
                    A
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-zinc-800 text-sm">
                    {comment.author?.username || "Anonymous"}
                  </span>
                  <span className="text-zinc-400 text-xs">
                    {formatTimestamp(comment.createdAt)}
                  </span>
                </div>
                {isEditing ? (
                  <div className="space-y-2 mt-2">
                    <textarea
                      ref={editCommentRef}
                      className="w-full bg-white border-b border-primary outline-none text-sm resize-none"
                      value={editCommentText}
                      onChange={(e) => setEditCommentText(e.target.value)}
                      autoFocus
                    />
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => setEditingCommentId(null)}
                        className="text-xs font-bold text-zinc-400"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveCommentEditHandler(cId)}
                        disabled={isSavingComment}
                        className="text-xs font-bold text-primary flex items-center gap-1"
                      >
                        <MdSave /> {isSavingComment ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-zinc-600 text-sm whitespace-pre-wrap">
                      {comment.text}
                    </p>
                    {comment.image && (
                      <div className="mt-3 max-w-xs rounded-lg overflow-hidden border border-zinc-300 shadow-sm">
                        <img
                          src={comment.image}
                          className="w-full object-cover"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
              {comment.author?.id === auth.userId && !isEditing && (
                <div className="absolute top-2 right-2 flex flex-col items-end">
                  <button
                    onClick={() =>
                      setOpenCommentMenuId(
                        openCommentMenuId === cId ? null : cId
                      )
                    }
                    className="p-1.5 text-zinc-400 hover:text-zinc-900"
                  >
                    <BsThreeDotsVertical />
                  </button>
                  {openCommentMenuId === cId && (
                    <div className="bg-white border border-zinc-200  shadow-xl rounded-lg z-40 overflow-hidden">
                      <button
                        onClick={() => {
                          setEditingCommentId(cId);
                          setEditCommentText(comment.text);
                          setOpenCommentMenuId(null);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium hover:bg-zinc-50 border-b border-zinc-200 "
                      >
                        <MdEdit /> Edit
                      </button>
                      <button
                        onClick={() => deleteCommentHandler(cId)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        <MdDeleteForever /> Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default Comments;
