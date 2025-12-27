import React, { useContext, useEffect, useState } from "react";
import { useHttpClient } from "../hooks/http-hook.js";
import { MdSearch, MdAdd } from "react-icons/md";
import { FaCommentAlt } from "react-icons/fa";
import { AuthContext } from "../context/auth-context.js";
import { useNavigate } from "react-router-dom";

const Forums = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const { isLoading, sendRequest } = useHttpClient();
  const [loadedForums, setLoadedForums] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const formatTimestamp = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  useEffect(() => {
    const fetchForums = async () => {
      try {
        const responseData = await sendRequest(
          `${import.meta.env.VITE_BACKEND_URL}/api/forums`
        );
        setLoadedForums(responseData.forums || []);
      } catch (err) {
        console.log("log> Error fetching forums:", err.message);
      }
    };
    fetchForums();
  }, [sendRequest]);

  const filteredForums = loadedForums.filter(
    (forum) =>
      forum.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      forum.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full py-8">
      {/* ---------------- HEADER ACTIONS ---------------- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
        <button
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded shadow hover:opacity-80 transition-colors font-medium whitespace-nowrap"
          onClick={() =>
            auth.isLoggedIn
              ? navigate("/forum/new-forum")
              : navigate("/auth/Sign-In")
          }
        >
          <MdAdd className="text-xl" />
          Create Forum
        </button>

        <div className="relative w-full max-w-lg">
          <input
            type="text"
            placeholder="Search forums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-12 py-2 border border-zinc-300 rounded-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <div className="absolute right-0 top-0 h-full w-10 flex items-center justify-center border-l border-zinc-300 text-zinc-400">
            <MdSearch className="text-xl" />
          </div>
        </div>
      </div>

      {/* ---------------- FORUM GRID ---------------- */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredForums.map((forum) => {
            const isCreator = auth.userId === forum.creator;
            const isModified = forum.createdAt !== forum.updatedAt;

            return (
              <div
                key={forum.id || forum._id}
                className={`${
                  isCreator ? "bg-[#d4d9ff]/25" : "bg-white"
                } rounded-xl border border-zinc-300 overflow-hidden shadow-sm flex flex-col h-full transition-all`}
              >
                {/* Forum Image */}
                <div className="h-48 md:h-56 bg-zinc-50 border-b border-zinc-200 overflow-hidden">
                  <img
                    src={
                      forum.coverImage ||
                      "https://i.ibb.co/nqyC2z7B/default-image-placeholder.webp"
                    }
                    alt={forum.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Forum Info */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-zinc-800 truncate pr-2">
                      {forum.title}
                    </h2>
                    {/* Changed from 'View Group' to 'View Forum' */}
                    <button
                      onClick={() =>
                        navigate(`/forum/${forum.id || forum._id}`)
                      }
                      className="text-xs bg-zinc-100 hover:bg-zinc-200 px-3 py-1 rounded border border-zinc-300 font-medium transition-colors"
                    >
                      View Forum
                    </button>
                  </div>

                  <p className="text-zinc-600 text-sm line-clamp-3 mb-6 flex-1">
                    {forum.description}
                  </p>

                  {/* Footer Info */}
                  <div
                    className={`flex justify-between items-end mt-auto pt-4 border-t ${
                      isCreator ? "border-zinc-300/50" : "border-zinc-100"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                      <FaCommentAlt className="text-[10px]" />
                      <span>{forum.posts?.length || 0} posts</span>
                    </div>

                    <div className="text-[9px] text-zinc-400 text-right leading-tight">
                      <p>created at: {formatTimestamp(forum.createdAt)}</p>
                      {isModified && (
                        <p>updated at: {formatTimestamp(forum.updatedAt)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && filteredForums.length === 0 && (
        <div className="text-center py-20 text-zinc-400 italic">
          No forums found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
};

export default Forums;
