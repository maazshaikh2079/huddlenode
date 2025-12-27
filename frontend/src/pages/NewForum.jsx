import React, { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import { AuthContext } from "../context/auth-context.js";
import { useHttpClient } from "../hooks/http-hook.js";

const NewForum = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const { isLoading, sendRequest } = useHttpClient();

  const [formState, setFormState] = useState({
    title: "",
    description: "",
    imageFile: null, // Holds the actual File object
  });
  const [imagePreview, setImagePreview] = useState(null);

  const descriptionRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-expand logic for description
  const handleDescriptionChange = (e) => {
    const element = descriptionRef.current;
    if (element) {
      element.style.height = "auto";
      element.style.height = `${element.scrollHeight}px`;
    }
    setFormState({ ...formState, description: e.target.value });
  };

  const handleImagePick = (event) => {
    if (event.target.files && event.target.files.length === 1) {
      const pickedFile = event.target.files[0];
      setFormState({ ...formState, imageFile: pickedFile });

      // Generate preview for UI
      const fileReader = new FileReader();
      fileReader.onload = () => setImagePreview(fileReader.result);
      fileReader.readAsDataURL(pickedFile);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // Using FormData to handle file upload as required by backend middleware
      const formData = new FormData();
      formData.append("title", formState.title);
      formData.append("description", formState.description);

      // Matches backend: fileUpload.single("coverImage")
      if (formState.imageFile) {
        formData.append("coverImage", formState.imageFile);
      }

      await sendRequest(
        `${import.meta.env.VITE_BACKEND_URL}/api/forums`,
        "POST",
        formData,
        {
          // Assuming your auth middleware requires Bearer token
          Authorization: `Bearer ${auth.token}`,
        }
      );

      navigate("/"); // Redirect home after successful creation
    } catch (err) {
      console.error("log> Frontend Error creating forum:", err);
    }
  };

  return (
    <div className="w-full py-8 max-w-4xl mx-auto px-4">
      {/* Navigation Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-500 hover:text-primary transition-colors mb-6"
      >
        <MdArrowBack className="text-xl" />
        <span>Back to Forums</span>
      </button>

      {/* Main Creation Card */}
      <div className="bg-white rounded-xl border border-zinc-200 p-10 shadow-sm space-y-8">
        <h1 className="text-3xl font-bold text-zinc-900">Create New Forum</h1>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Title Field */}
          <div className="space-y-2">
            <label className="text-lg font-semibold text-zinc-800 block">
              Title:
            </label>
            <input
              type="text"
              placeholder="Enter title..."
              className="w-full bg-transparent border-b border-zinc-200 focus:border-zinc-900 outline-none py-2 transition-all text-md placeholder-zinc-400"
              value={formState.title}
              onChange={(e) =>
                setFormState({ ...formState, title: e.target.value })
              }
              required
            />
          </div>

          {/* Description Field (Auto-expanding) */}
          <div className="space-y-2">
            <label className="text-lg font-semibold text-zinc-800 block">
              Description:
            </label>
            <textarea
              ref={descriptionRef}
              placeholder="Enter description..."
              className="w-full bg-transparent border-b border-zinc-200 focus:border-zinc-900 outline-none py-2 transition-none resize-none text-md placeholder-zinc-400 overflow-hidden min-h-[32px]"
              rows={1}
              value={formState.description}
              onChange={handleDescriptionChange}
              required
            />
          </div>

          {/* coverImage Upload Section */}
          <div className="space-y-4">
            <div className="w-48 h-48 border border-zinc-200 rounded-md bg-zinc-50 flex flex-col items-center justify-center text-center p-4 overflow-hidden shadow-inner">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-zinc-400 text-sm font-medium leading-tight">
                  Forum Cover Image
                </span>
              )}
            </div>

            <input
              type="file"
              accept=".jpg,.png,.jpeg"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImagePick}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="px-6 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-sm font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors shadow-sm"
            >
              Pick Image
            </button>
          </div>

          {/* Submission */}
          <div className="pt-4 border-t border-zinc-100">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-white px-8 py-3 rounded-lg font-semibold text-lg hover:opacity-90 transition-all shadow-md active:scale-[0.98] disabled:bg-zinc-200 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating..." : "Create Forum"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewForum;
