import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context.js";
import { useHttpClient } from "../hooks/http-hook.js";
import { MdSearch } from "react-icons/md";

const TabbedPane = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const { sendRequest } = useHttpClient();

  const [activeTab, setActiveTab] = useState("Forums");
  const [searchQuery, setSearchQuery] = useState("");

  const [userContent, setUserContent] = useState({
    Forums: [],
    Posts: [],
    Comments: [],
  });

  const tabs = ["Forums", "Posts", "Comments"];

  const filteredData = userContent[activeTab].filter((item) => {
    const query = searchQuery.toLowerCase();
    const searchableText =
      (item.title || "") +
      (item.description || "") +
      (item.content || "") +
      (item.text || "");
    return searchableText.toLowerCase().includes(query);
  });

  const formatTimestamp = (dateString) => {
    if (!dateString) return null;
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
    const fetchUserContent = async () => {
      try {
        const userForumsRes = await sendRequest(
          `${import.meta.env.VITE_BACKEND_URL}/api/forums/user`,
          "GET",
          null,
          { Authorization: `Bearer ${auth.token}` }
        );

        const userPostsRes = await sendRequest(
          `${import.meta.env.VITE_BACKEND_URL}/api/posts/user`,
          "GET",
          null,
          { Authorization: `Bearer ${auth.token}` }
        );

        const userCommentsRes = await sendRequest(
          `${import.meta.env.VITE_BACKEND_URL}/api/comments/user`,
          "GET",
          null,
          { Authorization: `Bearer ${auth.token}` }
        );

        setUserContent({
          Forums: userForumsRes.userForums || userForumsRes.forums || [],
          Posts: userPostsRes.posts || userPostsRes.userPosts || [],
          Comments:
            userCommentsRes.comments || userCommentsRes.userComments || [],
        });
      } catch (err) {
        console.log("log> Error getting user's content: ", err.message);
      }
    };

    if (auth.token) {
      fetchUserContent();
    }
  }, [sendRequest, auth.token]);

  return (
    <div className="w-full mt-6 bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm">
      {/* Tabs Header - Responsive scrolling for many tabs if needed */}
      <div className="flex border-b border-zinc-200 bg-zinc-50 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSearchQuery("");
            }}
            className={`px-4 md:px-6 py-3 text-xs md:text-sm font-semibold transition-all border-b-2 flex-1 md:flex-none ${
              activeTab === tab
                ? "border-primary text-primary bg-white"
                : "border-transparent text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Search Bar */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder={`Search your ${activeTab.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
          />
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xl" />
        </div>

        {/* Content List - RESPONSIVE FIX */}
        <div className="flex flex-col gap-3 min-h-[300px]">
          {filteredData.length > 0 ? (
            filteredData.map((item) => {
              const hasImage =
                (activeTab === "Forums" && item.coverImage) ||
                (activeTab === "Posts" && item.image) ||
                (activeTab === "Comments" &&
                  (item.type === "mixed" || item.type === "image") &&
                  item.image);

              const createdDate = item.createdAt || item.timestamp;
              const updatedDate = item.updatedAt || item.timestamp;
              const isModified = createdDate !== updatedDate;

              return (
                <div
                  key={item.id || item._id}
                  className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors relative"
                >
                  {/* Image Container - Full width on mobile */}
                  {hasImage && (
                    <div className="w-full md:w-24 h-40 md:h-24 bg-zinc-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-zinc-200">
                      <img
                        src={item.coverImage || item.image}
                        alt="Content"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Text Section - pr-0 on mobile to allow full width */}
                  <div className="flex-1 min-w-0 pr-0 md:pr-32 w-full">
                    <div className="flex flex-col mb-1">
                      {activeTab !== "Comments" && item.title && (
                        <h3 className="font-bold text-base md:text-lg text-zinc-800 truncate">
                          {item.title}
                        </h3>
                      )}
                      <p className="text-zinc-600 text-xs md:text-sm line-clamp-3 md:line-clamp-2">
                        {item.content || item.description || item.text || ""}
                      </p>
                    </div>

                    {/* Responsive Metadata - Stacked on mobile */}
                    <div className="flex flex-col md:flex-row md:items-center gap-1 text-[10px] text-zinc-400 mt-2">
                      <span>Created: {formatTimestamp(createdDate)}</span>
                      {isModified && (
                        <span className="md:before:content-['|'] md:before:mx-2">
                          Updated: {formatTimestamp(updatedDate)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Button - Relative on mobile, absolute on desktop */}
                  <div className="w-full md:w-auto md:absolute md:bottom-4 md:right-4 mt-2 md:mt-0">
                    <button
                      onClick={() => {
                        if (activeTab === "Forums")
                          navigate(`/forum/${item.id || item._id}`);
                        if (activeTab === "Posts")
                          navigate(`/post/${item.id || item._id}`);
                        if (activeTab === "Comments")
                          navigate(`/post/${item.post}/#${item.id}`);
                      }}
                      className="w-full md:w-auto text-center text-xs bg-zinc-50 hover:bg-zinc-200 px-4 py-2 rounded border border-zinc-300 font-bold transition-colors shadow-sm active:scale-95"
                    >
                      {activeTab === "Forums"
                        ? "View Forum"
                        : activeTab === "Posts"
                          ? "View Post"
                          : "View Comment"}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400 italic text-sm text-center">
              No {activeTab.toLowerCase()} found matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabbedPane;
