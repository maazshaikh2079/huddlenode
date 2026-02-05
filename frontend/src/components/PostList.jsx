import React from "react";
import { useNavigate } from "react-router-dom";
import { MdChatBubbleOutline } from "react-icons/md";

const PostList = ({ posts, postSearchQuery, formatTimestamp }) => {
  const navigate = useNavigate();

  // --- FILTERING LOGIC ---
  const filteredPosts = posts.filter(
    (post) =>
      post.title?.toLowerCase().includes(postSearchQuery.toLowerCase()) ||
      post.content?.toLowerCase().includes(postSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-12">
      {/* --- CONDITIONAL RENDERING --- */}
      {filteredPosts.length > 0 ? (
        filteredPosts.map((post) => (
          <div
            key={post.id || post._id}
            className="bg-white border border-zinc-200 rounded-xl p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 hover:shadow-md transition-all relative overflow-hidden group"
          >
            {/* COMMENT COUNTER (Top Right on Desktop) */}
            <div className="md:absolute top-6 right-6 flex items-center gap-1.5 text-zinc-400 text-sm mb-2 md:mb-0">
              <MdChatBubbleOutline className="text-base" />
              <span>{post.comments?.length || 0} comments</span>
            </div>

            {/* POST THUMBNAIL */}
            {post.image && (
              <div className="w-full md:w-28 h-48 md:h-28 flex-shrink-0 overflow-hidden rounded-lg border border-zinc-100">
                <img
                  src={post.image}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}

            {/* POST CONTENT PREVIEW */}
            <div className="flex-1 flex flex-col justify-center md:pr-32">
              <h3 className="text-lg md:text-xl font-bold text-zinc-800 mb-1 truncate group-hover:text-primary transition-colors">
                {post.title}
              </h3>
              {/* Uses 'line-clamp' to ensure the preview doesn't grow too tall */}
              <p className="text-zinc-600 text-sm md:text-base mb-3 line-clamp-2 md:line-clamp-3">
                {post.content}
              </p>

              {/* AUTHOR METADATA */}
              <div className="flex items-center gap-2 mt-auto">
                <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden border border-zinc-300">
                  {post.creator?.pfp ? (
                    <img
                      src={post.creator.pfp}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  ) : (
                    <span className="text-[10px] font-bold text-zinc-500">
                      {post.creator?.username?.charAt(0).toUpperCase() || "A"}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-2">
                  <span className="font-semibold text-zinc-500 text-xs md:text-[14px]">
                    {post.creator?.username || "Anonymous"}
                  </span>
                  <span className="text-zinc-400 text-[10px] md:text-[12px]">
                    • Posted: {formatTimestamp(post.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* NAVIGATION ACTION (Bottom Right on Desktop) */}
            <div className="mt-4 md:mt-0 md:absolute bottom-6 right-6">
              <button
                onClick={() => navigate(`/post/${post.id || post._id}`)}
                className="w-full md:w-auto text-sm bg-zinc-50 hover:bg-zinc-200 px-5 py-2 rounded-md border border-zinc-300 font-medium shadow-sm active:scale-95 transition-all"
              >
                View Post
              </button>
            </div>
          </div>
        ))
      ) : (
        /* --- EMPTY STATE ---  */
        <div className="text-center py-20 text-zinc-400 italic bg-white rounded-2xl border border-dashed border-zinc-300">
          No posts found matching "{postSearchQuery}"
        </div>
      )}
    </div>
  );
};

export default PostList;
