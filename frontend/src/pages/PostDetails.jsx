// import React, { useEffect, useState, useContext, useRef, useMemo } from "react";
// import { useParams, useNavigate, useLocation } from "react-router-dom";
// import { useHttpClient } from "../hooks/http-hook.js";
// import { AuthContext } from "../context/auth-context.js";
// import {
//   MdArrowBack,
//   MdImage,
//   MdClose,
//   MdDeleteForever,
//   MdEdit,
//   MdSave,
// } from "react-icons/md";
// import { IoPersonCircleSharp } from "react-icons/io5";
// import { BsThreeDotsVertical } from "react-icons/bs";
// import { BiSolidEditAlt } from "react-icons/bi";
// import { RiImageEditFill } from "react-icons/ri";

// const PostDetails = () => {
//   const { postId } = useParams();
//   const auth = useContext(AuthContext);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { isLoading, sendRequest } = useHttpClient();

//   const [post, setPost] = useState(null);
//   const [comments, setComments] = useState([]);
//   const [commentText, setCommentText] = useState("");
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [isInputFocused, setIsInputFocused] = useState(false);
//   const [sortBy, setSortBy] = useState("newest");
//   const [isSortOpen, setIsSortOpen] = useState(false);
//   const [isPostMenuOpen, setIsPostMenuOpen] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);

//   const [isEditingPost, setIsEditingPost] = useState(false);
//   const [editPostForm, setEditPostForm] = useState({ title: "", content: "" });
//   const [isSavingPost, setIsSavingPost] = useState(false);

//   const [showImageMenu, setShowImageMenu] = useState(false);
//   const [isUpdatingImage, setIsUpdatingImage] = useState(false);

//   const [openCommentMenuId, setOpenCommentMenuId] = useState(null);
//   const [editingCommentId, setEditingCommentId] = useState(null);
//   const [editCommentText, setEditCommentText] = useState("");
//   const [isSavingComment, setIsSavingComment] = useState(false);

//   const textareaRef = useRef(null);
//   const sortRef = useRef(null);
//   const postMenuRef = useRef(null);
//   const filePickerRef = useRef(null);
//   const commentListRef = useRef(null);
//   const postContentRef = useRef(null);
//   const editCommentRef = useRef(null);
//   const postImageInputRef = useRef(null);
//   const imageMenuRef = useRef(null);

//   const sortedComments = useMemo(() => {
//     return [...comments].sort((a, b) => {
//       const dateA = new Date(a.createdAt).getTime();
//       const dateB = new Date(b.createdAt).getTime();
//       return sortBy === "newest" ? dateB - dateA : dateA - dateB;
//     });
//   }, [comments, sortBy]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (sortRef.current && !sortRef.current.contains(event.target))
//         setIsSortOpen(false);
//       if (postMenuRef.current && !postMenuRef.current.contains(event.target))
//         setIsPostMenuOpen(false);
//       if (
//         commentListRef.current &&
//         !commentListRef.current.contains(event.target)
//       )
//         setOpenCommentMenuId(null);
//       if (imageMenuRef.current && !imageMenuRef.current.contains(event.target))
//         setShowImageMenu(false);
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const pickedHandler = (event) => {
//     if (event.target.files && event.target.files.length === 1) {
//       const pickedFile = event.target.files[0];
//       setSelectedImage(pickedFile);
//       const fileReader = new FileReader();
//       fileReader.onload = () => setImagePreview(fileReader.result);
//       fileReader.readAsDataURL(pickedFile);
//     }
//   };

//   const changePostImageHandler = async (imageFile) => {
//     setIsUpdatingImage(true);
//     try {
//       const formData = new FormData();
//       formData.append("image", imageFile);
//       const responseData = await sendRequest(
//         `${import.meta.env.VITE_BACKEND_URL}/api/posts/${postId}/edit/image`,
//         "PATCH",
//         formData,
//         { Authorization: `Bearer ${auth.token}` }
//       );
//       setPost({ ...post, image: responseData.updation.post.image });
//       setShowImageMenu(false);
//     } catch (err) {
//     } finally {
//       setIsUpdatingImage(false);
//     }
//   };

//   const savePostEditHandler = async () => {
//     if (editPostForm.title.trim().length === 0)
//       return alert("Post title cannot be empty.");
//     setIsSavingPost(true);
//     try {
//       const responseData = await sendRequest(
//         `${import.meta.env.VITE_BACKEND_URL}/api/posts/${postId}/edit/texts`,
//         "PATCH",
//         JSON.stringify(editPostForm),
//         {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${auth.token}`,
//         }
//       );
//       setPost(responseData.updation.post);
//       setIsEditingPost(false);
//     } catch (err) {
//     } finally {
//       setIsSavingPost(false);
//     }
//   };

//   const deleteCommentHandler = async (commentId) => {
//     if (!window.confirm("Are you sure?")) return;
//     try {
//       await sendRequest(
//         `${import.meta.env.VITE_BACKEND_URL}/api/comments/${commentId}`,
//         "DELETE",
//         null,
//         { Authorization: `Bearer ${auth.token}` }
//       );
//       setComments((prev) => prev.filter((c) => (c.id || c._id) !== commentId));
//     } catch (err) {}
//   };

//   const deletePostHandler = async () => {
//     if (!window.confirm("FORCE DELETE post?")) return;
//     setIsDeleting(true);
//     try {
//       await sendRequest(
//         `${import.meta.env.VITE_BACKEND_URL}/api/posts/${postId}`,
//         "DELETE",
//         null,
//         { Authorization: `Bearer ${auth.token}` }
//       );
//       navigate(`/forum/${post.forum}`);
//     } catch (err) {
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   const saveCommentEditHandler = async (commentId) => {
//     if (editCommentText.trim().length === 0) return alert("Comment empty.");
//     setIsSavingComment(true);
//     try {
//       const responseData = await sendRequest(
//         `${import.meta.env.VITE_BACKEND_URL}/api/comments/${commentId}`,
//         "PATCH",
//         JSON.stringify({ text: editCommentText }),
//         {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${auth.token}`,
//         }
//       );
//       setComments((prev) =>
//         prev.map((c) =>
//           (c.id || c._id) === commentId ? responseData.updation.comment : c
//         )
//       );
//       setEditingCommentId(null);
//     } catch (err) {
//     } finally {
//       setIsSavingComment(false);
//     }
//   };

//   const commentSubmitHandler = async () => {
//     if (!auth.isLoggedIn) return navigate("/auth/Sign-In");
//     const formData = new FormData();
//     formData.append("text", commentText);
//     if (selectedImage) formData.append("image", selectedImage);
//     try {
//       const responseData = await sendRequest(
//         `${import.meta.env.VITE_BACKEND_URL}/api/comments/post/${postId}`,
//         "POST",
//         formData,
//         { Authorization: `Bearer ${auth.token}` }
//       );
//       setComments((prev) => [responseData.creation.comment, ...prev]);
//       setCommentText("");
//       setSelectedImage(null);
//       setImagePreview(null);
//       setIsInputFocused(false);
//       if (textareaRef.current) {
//         textareaRef.current.style.height = "auto";
//         textareaRef.current.blur();
//       }
//     } catch (err) {}
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const pRes = await sendRequest(
//           `${import.meta.env.VITE_BACKEND_URL}/api/posts/${postId}`
//         );
//         setPost(pRes.post);
//         setEditPostForm({
//           title: pRes.post.title,
//           content: pRes.post.content || "",
//         });
//         const cRes = await sendRequest(
//           `${import.meta.env.VITE_BACKEND_URL}/api/comments/post/${postId}`
//         );
//         setComments(cRes.postComments || []);
//       } catch (err) {}
//     };
//     if (postId) fetchData();
//   }, [sendRequest, postId]);

//   const formatTimestamp = (dateString) => {
//     if (!dateString) return null;
//     return new Date(dateString).toLocaleString("en-US", {
//       year: "numeric",
//       month: "numeric",
//       day: "numeric",
//       hour: "numeric",
//       minute: "numeric",
//       hour12: true,
//     });
//   };

//   if (isLoading)
//     return (
//       <div className="flex justify-center py-20">
//         <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
//       </div>
//     );

//   return (
//     <div className="w-full py-4 md:py-8 max-w-5xl mx-auto px-4">
//       <button
//         onClick={() => navigate(-1)}
//         className="flex items-center gap-2 text-zinc-500 hover:text-primary transition-colors mb-4 md:mb-6"
//       >
//         <MdArrowBack className="text-xl" />{" "}
//         <span className="text-sm md:text-base">Back</span>
//       </button>

//       {post && (
//         <div className="space-y-6">
//           <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col md:flex-row relative">
//             {/* Post Image Container */}
//             {post.image && (
//               <div className="w-full md:w-1/3 bg-zinc-50 flex items-center justify-center p-4 md:p-6 border-b md:border-b-0 md:border-r border-zinc-200 relative">
//                 {post.creator?.id === auth.userId && (
//                   <input
//                     type="file"
//                     ref={postImageInputRef}
//                     className="hidden"
//                     accept=".jpg, .jpeg, .png"
//                     onChange={(e) => {
//                       const file = e.target.files[0];
//                       if (file) changePostImageHandler(file);
//                     }}
//                   />
//                 )}
//                 <div
//                   className={`relative w-full h-48 md:h-auto rounded-lg overflow-hidden group ${post.creator?.id === auth.userId ? "cursor-pointer" : ""}`}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     if (post.creator?.id === auth.userId && !isUpdatingImage)
//                       setShowImageMenu(!showImageMenu);
//                   }}
//                 >
//                   <img
//                     src={post.image}
//                     alt={post.title}
//                     className="w-full h-full object-contain"
//                   />
//                   {post.creator?.id === auth.userId && (
//                     <div
//                       className={`absolute inset-0 bg-black/25 flex items-center justify-center transition-opacity ${isUpdatingImage ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
//                     >
//                       {isUpdatingImage ? (
//                         <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
//                       ) : (
//                         <RiImageEditFill className="text-white text-3xl drop-shadow-lg" />
//                       )}
//                     </div>
//                   )}
//                 </div>
//                 {post.creator?.id === auth.userId && showImageMenu && (
//                   <div
//                     className="absolute left-[50%] -translate-x-1/2 md:left-[85%] md:translate-x-0 top-1/4 z-50"
//                     ref={imageMenuRef}
//                   >
//                     <div className="bg-white text-zinc-800 w-44 md:w-52 rounded-lg shadow-2xl py-2 border border-zinc-100 animate-in fade-in zoom-in duration-200">
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           postImageInputRef.current.click();
//                           setShowImageMenu(false);
//                         }}
//                         className="w-full text-left px-4 py-2 hover:bg-zinc-50 transition-colors flex items-center gap-3 font-semibold text-zinc-700 text-xs md:text-sm whitespace-nowrap"
//                       >
//                         <RiImageEditFill className="text-zinc-500 text-base" />{" "}
//                         Change Image
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Post Text Section - Responsive Logic for Menu */}
//             <div
//               className={`${post.image ? "md:w-2/3" : "w-full"} p-6 md:p-10 flex flex-col relative`}
//             >
//               {/* MANAGEMENT MENU - Localized inside text block section */}
//               {post.creator?.id === auth.userId && (
//                 <div
//                   className="absolute top-4 right-4 md:top-8 md:right-8 z-30 flex flex-col items-end"
//                   ref={postMenuRef}
//                 >
//                   {isEditingPost ? (
//                     <button
//                       disabled={isSavingPost}
//                       onClick={savePostEditHandler}
//                       className="bg-primary text-white p-2 px-4 rounded-md flex items-center gap-2 hover:opacity-90 transition-all shadow-sm mb-2 text-sm md:text-base"
//                     >
//                       <MdSave className="text-lg md:text-xl" />{" "}
//                       <span className="font-semibold">
//                         {isSavingPost ? "Saving..." : "Save"}
//                       </span>
//                     </button>
//                   ) : (
//                     <button
//                       disabled={isDeleting}
//                       className={`p-2 rounded-full transition-colors ${isPostMenuOpen ? "bg-zinc-200 text-zinc-900" : "text-zinc-600 hover:bg-zinc-200/50"}`}
//                       onClick={() => setIsPostMenuOpen(!isPostMenuOpen)}
//                     >
//                       <BsThreeDotsVertical className="text-lg md:text-xl" />
//                     </button>
//                   )}
//                   {isPostMenuOpen && (
//                     <div className="absolute right-0 mt-2 w-44 md:w-48 bg-white border border-zinc-200 shadow-xl rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
//                       <button
//                         className="w-full flex items-center gap-3 px-4 py-3 text-xs md:text-sm font-semibold text-zinc-700 hover:bg-zinc-50 border-b border-zinc-100"
//                         onClick={() => {
//                           setIsEditingPost(true);
//                           setIsPostMenuOpen(false);
//                         }}
//                       >
//                         <BiSolidEditAlt className="text-lg text-zinc-500" />{" "}
//                         Edit Text
//                       </button>
//                       <button
//                         disabled={isDeleting}
//                         className="w-full flex items-center gap-3 px-4 py-3 text-xs md:text-sm font-semibold text-red-600 hover:bg-red-50"
//                         onClick={deletePostHandler}
//                       >
//                         <MdDeleteForever className="text-lg md:text-xl" />{" "}
//                         Delete Post
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {isEditingPost ? (
//                 <div className="space-y-6 mb-4 mt-8 md:mt-0">
//                   <div className="space-y-1">
//                     <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
//                       Title
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full bg-white border-b border-primary focus:border-b-2 outline-none py-1 text-xl md:text-2xl font-bold text-zinc-900 transition-all"
//                       value={editPostForm.title}
//                       onChange={(e) =>
//                         setEditPostForm({
//                           ...editPostForm,
//                           title: e.target.value,
//                         })
//                       }
//                       autoFocus
//                     />
//                   </div>
//                   <div className="space-y-1">
//                     <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
//                       Content
//                     </label>
//                     <textarea
//                       ref={postContentRef}
//                       className="w-full bg-white border-b border-primary focus:border-b-2 outline-none py-1 text-base md:text-lg text-zinc-700 transition-all resize-none overflow-hidden"
//                       rows={1}
//                       value={editPostForm.content}
//                       onChange={(e) => {
//                         e.target.style.height = "auto";
//                         e.target.style.height = `${e.target.scrollHeight}px`;
//                         setEditPostForm({
//                           ...editPostForm,
//                           content: e.target.value,
//                         });
//                       }}
//                     />
//                   </div>
//                   <button
//                     onClick={() => {
//                       setIsEditingPost(false);
//                       setEditPostForm({
//                         title: post.title,
//                         content: post.content || "",
//                       });
//                     }}
//                     className="text-xs font-bold text-zinc-400 hover:text-zinc-600 underline"
//                   >
//                     Cancel Editing
//                   </button>
//                 </div>
//               ) : (
//                 <div className="mt-6 md:mt-0">
//                   <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-4 leading-tight pr-10">
//                     {post.title}
//                   </h1>
//                   <div className="flex items-center gap-3 text-zinc-400 text-[11px] md:text-sm mb-6 flex-wrap">
//                     <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-zinc-200 overflow-hidden border flex items-center justify-center">
//                       {post.creator?.pfp ? (
//                         <img
//                           src={post.creator.pfp}
//                           className="w-full h-full object-cover"
//                         />
//                       ) : (
//                         <span className="font-bold text-zinc-500 text-[10px]">
//                           A
//                         </span>
//                       )}
//                     </div>
//                     <span className="font-medium text-zinc-600">
//                       {post.creator?.username || "Anonymous"}
//                     </span>
//                     <span className="hidden md:inline">•</span>
//                     <span>{formatTimestamp(post.createdAt)}</span>
//                   </div>
//                   <div className="text-zinc-700 text-base md:text-lg leading-relaxed whitespace-pre-wrap pr-8">
//                     {post.content || ""}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Comments Section... */}
//           <div className="bg-white rounded-xl border border-zinc-200 p-5 md:p-8 shadow-sm space-y-6 md:space-y-8">
//             <div
//               className="flex items-center gap-4 md:gap-6 relative flex-wrap"
//               ref={sortRef}
//             >
//               <h2 className="text-lg md:text-xl font-bold text-zinc-800">
//                 {comments.length} Comments
//               </h2>
//               <button
//                 onClick={() => setIsSortOpen(!isSortOpen)}
//                 className="flex items-center gap-2 text-zinc-600 font-bold text-[11px] md:text-sm hover:text-zinc-900 transition-colors border px-2 py-1 rounded md:border-0 md:p-0"
//               >
//                 <div className="flex flex-col gap-0.5">
//                   <div className="w-3 md:w-4 h-0.5 bg-current"></div>
//                   <div className="w-2 md:w-3 h-0.5 bg-current"></div>
//                   <div className="w-1.5 md:w-2 h-0.5 bg-current"></div>
//                 </div>{" "}
//                 Sort
//               </button>
//               {isSortOpen && (
//                 <div className="absolute top-10 left-28 md:left-36 w-28 md:w-32 bg-white border border-zinc-200 shadow-xl rounded-lg overflow-hidden z-20">
//                   <button
//                     onClick={() => {
//                       setSortBy("newest");
//                       setIsSortOpen(false);
//                     }}
//                     className={`w-full text-left px-4 py-3 text-xs md:text-sm font-medium hover:bg-zinc-50 ${sortBy === "newest" ? "text-primary bg-primary/5" : "text-zinc-700"}`}
//                   >
//                     Newest
//                   </button>
//                   <button
//                     onClick={() => {
//                       setSortBy("oldest");
//                       setIsSortOpen(false);
//                     }}
//                     className={`w-full text-left px-4 py-3 text-xs md:text-sm font-medium hover:bg-zinc-50 ${sortBy === "oldest" ? "text-primary bg-primary/5" : "text-zinc-700"}`}
//                   >
//                     Oldest
//                   </button>
//                 </div>
//               )}
//             </div>

//             <div className="flex gap-3 md:gap-4 pt-4 border-b pb-6 md:pb-8 border-zinc-100">
//               <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-zinc-100 flex-shrink-0 overflow-hidden border">
//                 {auth.isLoggedIn && auth?.pfp ? (
//                   <img
//                     src={auth.pfp}
//                     alt="User"
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <IoPersonCircleSharp className="w-full h-full text-zinc-300" />
//                 )}
//               </div>
//               <div className="flex-1">
//                 <textarea
//                   ref={textareaRef}
//                   value={commentText}
//                   disabled={!auth.isLoggedIn}
//                   onFocus={() => setIsInputFocused(true)}
//                   onClick={() => !auth.isLoggedIn && navigate("/auth/Sign-In")}
//                   onChange={(e) => {
//                     if (textareaRef.current) {
//                       textareaRef.current.style.height = "auto";
//                       textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
//                     }
//                     setCommentText(e.target.value);
//                   }}
//                   placeholder={
//                     auth.isLoggedIn
//                       ? "Add a comment..."
//                       : "Login to add comments"
//                   }
//                   className="w-full bg-transparent border-b border-zinc-300 focus:border-zinc-900 outline-none py-1 transition-all resize-none text-xs md:text-sm placeholder-zinc-500 overflow-hidden min-h-[28px]"
//                   rows={1}
//                 />
//                 {(isInputFocused || commentText.length > 0 || imagePreview) &&
//                   auth.isLoggedIn && (
//                     <div className="flex justify-between items-center mt-3">
//                       <input
//                         type="file"
//                         className="hidden"
//                         ref={filePickerRef}
//                         accept=".jpg,.png,.jpeg"
//                         onChange={pickedHandler}
//                       />
//                       <button
//                         onClick={() => filePickerRef.current.click()}
//                         className="p-1.5 text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors"
//                       >
//                         <MdImage className="text-xl md:text-2xl" />
//                       </button>
//                       <div className="flex gap-2 md:gap-3 items-center">
//                         <button
//                           onClick={() => {
//                             setCommentText("");
//                             setSelectedImage(null);
//                             setImagePreview(null);
//                             setIsInputFocused(false);
//                             if (textareaRef.current) {
//                               textareaRef.current.style.height = "auto";
//                               textareaRef.current.blur();
//                             }
//                           }}
//                           className="px-3 py-1.5 text-[11px] md:text-sm font-bold text-zinc-700 hover:bg-zinc-100 rounded-full transition-colors"
//                         >
//                           Cancel
//                         </button>
//                         <button
//                           disabled={
//                             commentText.trim().length === 0 && !selectedImage
//                           }
//                           onClick={commentSubmitHandler}
//                           className={`px-4 md:px-6 py-1.5 text-[11px] md:text-sm font-bold rounded-full transition-all ${commentText.trim().length > 0 || selectedImage ? "bg-primary text-white hover:opacity-90 shadow-sm" : "bg-zinc-100 text-zinc-400 cursor-not-allowed"}`}
//                         >
//                           Comment
//                         </button>
//                       </div>
//                     </div>
//                   )}
//               </div>
//             </div>

//             <div className="space-y-6 md:space-y-8" ref={commentListRef}>
//               {sortedComments.map((comment) => {
//                 const cId = comment.id || comment._id;
//                 const isEditingThisComment = editingCommentId === cId;
//                 return (
//                   <div
//                     key={cId}
//                     id={cId}
//                     className="flex gap-3 md:gap-4 p-2 md:p-3 rounded-lg hover:bg-zinc-50 transition-colors relative group"
//                     onMouseLeave={() =>
//                       !isEditingThisComment &&
//                       openCommentMenuId === cId &&
//                       setOpenCommentMenuId(null)
//                     }
//                     onClick={() =>
//                       !isEditingThisComment &&
//                       openCommentMenuId === cId &&
//                       setOpenCommentMenuId(null)
//                     }
//                   >
//                     {(comment.author?.id === auth.userId ||
//                       comment.author?._id === auth.userId) &&
//                       !isEditingThisComment && (
//                         <div className="absolute top-2 right-2 md:top-3 md:right-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               setOpenCommentMenuId(
//                                 openCommentMenuId === cId ? null : cId
//                               );
//                             }}
//                             className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 rounded-full transition-all"
//                           >
//                             <BsThreeDotsVertical className="text-base" />
//                           </button>
//                           {openCommentMenuId === cId && (
//                             <div
//                               className="absolute right-0 mt-1 w-32 md:w-40 bg-white border border-zinc-200 shadow-xl rounded-lg overflow-hidden z-40"
//                               onClick={(e) => e.stopPropagation()}
//                             >
//                               {(comment.type === "text" ||
//                                 comment.type === "mixed") && (
//                                 <button
//                                   className="w-full flex items-center gap-3 px-4 py-2 text-[11px] md:text-sm font-medium text-zinc-700 hover:bg-zinc-50 border-b border-zinc-100"
//                                   onClick={() => {
//                                     setEditingCommentId(cId);
//                                     setEditCommentText(comment.text);
//                                     setOpenCommentMenuId(null);
//                                   }}
//                                 >
//                                   <MdEdit className="text-lg" /> Edit
//                                 </button>
//                               )}
//                               <button
//                                 className="w-full flex items-center gap-3 px-4 py-2 text-[11px] md:text-sm font-medium text-red-600 hover:bg-red-50"
//                                 onClick={() => deleteCommentHandler(cId)}
//                               >
//                                 <MdDeleteForever className="text-lg md:text-xl" />{" "}
//                                 Delete
//                               </button>
//                             </div>
//                           )}
//                         </div>
//                       )}
//                     <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-zinc-100 flex-shrink-0 overflow-hidden border">
//                       {comment.author?.pfp ? (
//                         <img
//                           src={comment.author.pfp}
//                           className="w-full h-full object-cover"
//                           alt="author"
//                         />
//                       ) : (
//                         <span className="text-[10px] font-bold text-zinc-400 flex items-center justify-center h-full">
//                           A
//                         </span>
//                       )}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center gap-2 mb-1 flex-wrap pr-8 md:pr-0">
//                         <span className="font-bold text-zinc-800 text-xs md:text-sm truncate max-w-[100px] md:max-w-none">
//                           {comment.author?.username || "Anonymous"}
//                         </span>
//                         <span className="text-zinc-400 text-[10px] md:text-xs">
//                           {formatTimestamp(comment.createdAt)}
//                         </span>
//                         {comment.edited && (
//                           <span className="text-zinc-300 text-[9px] md:text-[10px] italic">
//                             {" "}
//                             • edited
//                           </span>
//                         )}
//                       </div>
//                       {isEditingThisComment ? (
//                         <div className="space-y-2 mt-2">
//                           <textarea
//                             ref={editCommentRef}
//                             className="w-full bg-white border-b border-primary outline-none py-1 text-xs md:text-sm text-zinc-700 resize-none overflow-hidden"
//                             rows={1}
//                             value={editCommentText}
//                             onChange={(e) => {
//                               if (editCommentRef.current) {
//                                 editCommentRef.current.style.height = "auto";
//                                 editCommentRef.current.style.height = `${editCommentRef.current.scrollHeight}px`;
//                               }
//                               setEditCommentText(e.target.value);
//                             }}
//                             autoFocus
//                           />
//                           <div className="flex gap-3 justify-end">
//                             <button
//                               className="text-[10px] font-bold text-zinc-400 hover:text-zinc-600"
//                               onClick={() => setEditingCommentId(null)}
//                             >
//                               Cancel
//                             </button>
//                             <button
//                               disabled={isSavingComment}
//                               className="text-[10px] font-bold text-primary hover:opacity-70 flex items-center gap-1"
//                               onClick={() => saveCommentEditHandler(cId)}
//                             >
//                               <MdSave />{" "}
//                               {isSavingComment ? "Saving..." : "Save"}
//                             </button>
//                           </div>
//                         </div>
//                       ) : (
//                         <>
//                           {comment.text && (
//                             <p className="text-zinc-600 text-xs md:text-sm leading-relaxed whitespace-pre-wrap pr-10">
//                               {comment.text}
//                             </p>
//                           )}
//                           {comment.image && (
//                             <div className="mt-3 max-w-[200px] md:max-w-xs rounded-lg overflow-hidden border border-zinc-200 shadow-sm">
//                               <img
//                                 src={comment.image}
//                                 className="w-full h-auto object-cover max-h-32 md:max-h-48"
//                                 alt="attachment"
//                               />
//                             </div>
//                           )}
//                         </>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PostDetails;

import React, { useEffect, useState, useContext, useRef, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useHttpClient } from "../hooks/http-hook.js";
import { AuthContext } from "../context/auth-context.js";
import {
  MdArrowBack,
  MdImage,
  MdClose,
  MdDeleteForever,
  MdEdit,
  MdSave,
} from "react-icons/md";
import { IoPersonCircleSharp } from "react-icons/io5";
import { BsThreeDotsVertical } from "react-icons/bs";
import { BiSolidEditAlt } from "react-icons/bi";
import { RiImageEditFill } from "react-icons/ri";

const PostDetails = () => {
  const { postId } = useParams();
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, sendRequest } = useHttpClient();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isPostMenuOpen, setIsPostMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostForm, setEditPostForm] = useState({ title: "", content: "" });
  const [isSavingPost, setIsSavingPost] = useState(false);

  const [showImageMenu, setShowImageMenu] = useState(false);
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);

  const [openCommentMenuId, setOpenCommentMenuId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [isSavingComment, setIsSavingComment] = useState(false);

  const textareaRef = useRef(null);
  const sortRef = useRef(null);
  const postMenuRef = useRef(null);
  const filePickerRef = useRef(null);
  const commentListRef = useRef(null);
  const postContentRef = useRef(null);
  const editCommentRef = useRef(null);
  const postImageInputRef = useRef(null);
  const imageMenuRef = useRef(null);

  const sortedComments = useMemo(() => {
    return [...comments].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [comments, sortBy]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target))
        setIsSortOpen(false);
      if (postMenuRef.current && !postMenuRef.current.contains(event.target))
        setIsPostMenuOpen(false);
      if (
        commentListRef.current &&
        !commentListRef.current.contains(event.target)
      )
        setOpenCommentMenuId(null);
      if (imageMenuRef.current && !imageMenuRef.current.contains(event.target))
        setShowImageMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pickedHandler = (event) => {
    if (event.target.files && event.target.files.length === 1) {
      const pickedFile = event.target.files[0];
      setSelectedImage(pickedFile);
      const fileReader = new FileReader();
      fileReader.onload = () => setImagePreview(fileReader.result);
      fileReader.readAsDataURL(pickedFile);
    }
  };

  const removeSelectedImageHandler = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (filePickerRef.current) {
      filePickerRef.current.value = null;
    }
  };

  const changePostImageHandler = async (imageFile) => {
    setIsUpdatingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      const responseData = await sendRequest(
        `${import.meta.env.VITE_BACKEND_URL}/api/posts/${postId}/edit/image`,
        "PATCH",
        formData,
        { Authorization: `Bearer ${auth.token}` }
      );
      setPost({ ...post, image: responseData.updation.post.image });
      setShowImageMenu(false);
    } catch (err) {
    } finally {
      setIsUpdatingImage(false);
    }
  };

  const savePostEditHandler = async () => {
    if (editPostForm.title.trim().length === 0)
      return alert("Post title cannot be empty.");
    setIsSavingPost(true);
    try {
      const responseData = await sendRequest(
        `${import.meta.env.VITE_BACKEND_URL}/api/posts/${postId}/edit/texts`,
        "PATCH",
        JSON.stringify(editPostForm),
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        }
      );
      setPost(responseData.updation.post);
      setIsEditingPost(false);
    } catch (err) {
    } finally {
      setIsSavingPost(false);
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

  const deletePostHandler = async () => {
    if (!window.confirm("FORCE DELETE post?")) return;
    setIsDeleting(true);
    try {
      await sendRequest(
        `${import.meta.env.VITE_BACKEND_URL}/api/posts/${postId}`,
        "DELETE",
        null,
        { Authorization: `Bearer ${auth.token}` }
      );
      navigate(`/forum/${post.forum}`);
    } catch (err) {
    } finally {
      setIsDeleting(false);
    }
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
      setSelectedImage(null);
      setImagePreview(null);
      setIsInputFocused(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.blur();
      }
    } catch (err) {}
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pRes = await sendRequest(
          `${import.meta.env.VITE_BACKEND_URL}/api/posts/${postId}`
        );
        setPost(pRes.post);
        setEditPostForm({
          title: pRes.post.title,
          content: pRes.post.content || "",
        });
        const cRes = await sendRequest(
          `${import.meta.env.VITE_BACKEND_URL}/api/comments/post/${postId}`
        );
        setComments(cRes.postComments || []);
      } catch (err) {}
    };
    if (postId) fetchData();
  }, [sendRequest, postId]);

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

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="w-full py-4 md:py-8 max-w-5xl mx-auto px-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-500 hover:text-primary transition-colors mb-4 md:mb-6"
      >
        <MdArrowBack className="text-xl" />{" "}
        <span className="text-sm md:text-base">Back</span>
      </button>

      {post && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col md:flex-row relative">
            {/* Post Image Container */}
            {post.image && (
              <div className="w-full md:w-1/3 bg-zinc-50 flex items-center justify-center p-4 md:p-6 border-b md:border-b-0 md:border-r border-zinc-200 relative">
                {post.creator?.id === auth.userId && (
                  <input
                    type="file"
                    ref={postImageInputRef}
                    className="hidden"
                    accept=".jpg, .jpeg, .png"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) changePostImageHandler(file);
                    }}
                  />
                )}
                <div
                  className={`relative w-full h-48 md:h-auto rounded-lg overflow-hidden group ${post.creator?.id === auth.userId ? "cursor-pointer" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (post.creator?.id === auth.userId && !isUpdatingImage)
                      setShowImageMenu(!showImageMenu);
                  }}
                >
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-contain"
                  />
                  {post.creator?.id === auth.userId && (
                    <div
                      className={`absolute inset-0 bg-black/25 flex items-center justify-center transition-opacity ${isUpdatingImage ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                    >
                      {isUpdatingImage ? (
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <RiImageEditFill className="text-white text-3xl drop-shadow-lg" />
                      )}
                    </div>
                  )}
                </div>
                {post.creator?.id === auth.userId && showImageMenu && (
                  <div
                    className="absolute left-[50%] -translate-x-1/2 md:left-[85%] md:translate-x-0 top-1/4 z-50"
                    ref={imageMenuRef}
                  >
                    <div className="bg-white text-zinc-800 w-44 md:w-52 rounded-lg shadow-2xl py-2 border border-zinc-100 animate-in fade-in zoom-in duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          postImageInputRef.current.click();
                          setShowImageMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-zinc-50 transition-colors flex items-center gap-3 font-semibold text-zinc-700 text-xs md:text-sm whitespace-nowrap"
                      >
                        <RiImageEditFill className="text-zinc-500 text-base" />{" "}
                        Change Image
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Post Text Section - Responsive Logic for Menu */}
            <div
              className={`${post.image ? "md:w-2/3" : "w-full"} p-6 md:p-10 flex flex-col relative`}
            >
              {/* MANAGEMENT MENU - Localized inside text block section */}
              {post.creator?.id === auth.userId && (
                <div
                  className="absolute top-4 right-4 md:top-8 md:right-8 z-30 flex flex-col items-end"
                  ref={postMenuRef}
                >
                  {isEditingPost ? (
                    <button
                      disabled={isSavingPost}
                      onClick={savePostEditHandler}
                      className="bg-primary text-white p-2 px-4 rounded-md flex items-center gap-2 hover:opacity-90 transition-all shadow-sm mb-2 text-sm md:text-base"
                    >
                      <MdSave className="text-lg md:text-xl" />{" "}
                      <span className="font-semibold">
                        {isSavingPost ? "Saving..." : "Save"}
                      </span>
                    </button>
                  ) : (
                    <button
                      disabled={isDeleting}
                      className={`p-2 rounded-full transition-colors ${isPostMenuOpen ? "bg-zinc-200 text-zinc-900" : "text-zinc-600 hover:bg-zinc-200/50"}`}
                      onClick={() => setIsPostMenuOpen(!isPostMenuOpen)}
                    >
                      <BsThreeDotsVertical className="text-lg md:text-xl" />
                    </button>
                  )}
                  {isPostMenuOpen && (
                    <div className="absolute right-0 mt-2 w-44 md:w-48 bg-white border border-zinc-200 shadow-xl rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                      <button
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs md:text-sm font-semibold text-zinc-700 hover:bg-zinc-50 border-b border-zinc-100"
                        onClick={() => {
                          setIsEditingPost(true);
                          setIsPostMenuOpen(false);
                        }}
                      >
                        <BiSolidEditAlt className="text-lg text-zinc-500" />{" "}
                        Edit Text
                      </button>
                      <button
                        disabled={isDeleting}
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs md:text-sm font-semibold text-red-600 hover:bg-red-50"
                        onClick={deletePostHandler}
                      >
                        <MdDeleteForever className="text-lg md:text-xl" />{" "}
                        Delete Post
                      </button>
                    </div>
                  )}
                </div>
              )}

              {isEditingPost ? (
                <div className="space-y-6 mb-4 mt-8 md:mt-0">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Title
                    </label>
                    <input
                      type="text"
                      className="w-full bg-white border-b border-primary focus:border-b-2 outline-none py-1 text-xl md:text-2xl font-bold text-zinc-900 transition-all"
                      value={editPostForm.title}
                      onChange={(e) =>
                        setEditPostForm({
                          ...editPostForm,
                          title: e.target.value,
                        })
                      }
                      autoFocus
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Content
                    </label>
                    <textarea
                      ref={postContentRef}
                      className="w-full bg-white border-b border-primary focus:border-b-2 outline-none py-1 text-base md:text-lg text-zinc-700 transition-all resize-none overflow-hidden"
                      rows={1}
                      value={editPostForm.content}
                      onChange={(e) => {
                        e.target.style.height = "auto";
                        e.target.style.height = `${e.target.scrollHeight}px`;
                        setEditPostForm({
                          ...editPostForm,
                          content: e.target.value,
                        });
                      }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      setIsEditingPost(false);
                      setEditPostForm({
                        title: post.title,
                        content: post.content || "",
                      });
                    }}
                    className="text-xs font-bold text-zinc-400 hover:text-zinc-600 underline"
                  >
                    Cancel Editing
                  </button>
                </div>
              ) : (
                <div className="mt-6 md:mt-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-4 leading-tight pr-10">
                    {post.title}
                  </h1>
                  <div className="flex items-center gap-3 text-zinc-400 text-[11px] md:text-sm mb-6 flex-wrap">
                    <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-zinc-200 overflow-hidden border flex items-center justify-center">
                      {post.creator?.pfp ? (
                        <img
                          src={post.creator.pfp}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-bold text-zinc-500 text-[10px]">
                          A
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-zinc-600">
                      {post.creator?.username || "Anonymous"}
                    </span>
                    <span className="hidden md:inline">•</span>
                    <span>{formatTimestamp(post.createdAt)}</span>
                  </div>
                  <div className="text-zinc-700 text-base md:text-lg leading-relaxed whitespace-pre-wrap pr-8">
                    {post.content || ""}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comments Section... */}
          <div className="bg-white rounded-xl border border-zinc-200 p-5 md:p-8 shadow-sm space-y-6 md:space-y-8">
            <div
              className="flex items-center gap-4 md:gap-6 relative flex-wrap"
              ref={sortRef}
            >
              <h2 className="text-lg md:text-xl font-bold text-zinc-800">
                {comments.length} Comments
              </h2>
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-2 text-zinc-600 font-bold text-[11px] md:text-sm hover:text-zinc-900 transition-colors border px-2 py-1 rounded md:border-0 md:p-0"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="w-3 md:w-4 h-0.5 bg-current"></div>
                  <div className="w-2 md:w-3 h-0.5 bg-current"></div>
                  <div className="w-1.5 md:w-2 h-0.5 bg-current"></div>
                </div>{" "}
                Sort
              </button>
              {isSortOpen && (
                <div className="absolute top-10 left-28 md:left-36 w-28 md:w-32 bg-white border border-zinc-200 shadow-xl rounded-lg overflow-hidden z-20">
                  <button
                    onClick={() => {
                      setSortBy("newest");
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-xs md:text-sm font-medium hover:bg-zinc-50 ${sortBy === "newest" ? "text-primary bg-primary/5" : "text-zinc-700"}`}
                  >
                    Newest
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("oldest");
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-xs md:text-sm font-medium hover:bg-zinc-50 ${sortBy === "oldest" ? "text-primary bg-primary/5" : "text-zinc-700"}`}
                  >
                    Oldest
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-3 md:gap-4 pt-4 border-b pb-6 md:pb-8 border-zinc-100">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-zinc-100 flex-shrink-0 overflow-hidden border">
                {auth.isLoggedIn && auth?.pfp ? (
                  <img
                    src={auth.pfp}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
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
                  onClick={() => !auth.isLoggedIn && navigate("/auth/Sign-In")}
                  onChange={(e) => {
                    if (textareaRef.current) {
                      textareaRef.current.style.height = "auto";
                      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
                    }
                    setCommentText(e.target.value);
                  }}
                  placeholder={
                    auth.isLoggedIn
                      ? "Add a comment..."
                      : "Login to add comments"
                  }
                  className="w-full bg-transparent border-b border-zinc-300 focus:border-zinc-900 outline-none py-1 transition-all resize-none text-xs md:text-sm placeholder-zinc-500 overflow-hidden min-h-[28px]"
                  rows={1}
                />

                {/* --- IMAGE PREVIEW SECTION --- */}
                {imagePreview && auth.isLoggedIn && (
                  <div className="relative mt-4 w-fit max-w-full group">
                    <div className="relative rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50 shadow-sm transition-all hover:shadow-md">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-48 md:max-h-64 w-auto object-contain block"
                      />
                      {/* Close button - Top Right */}
                      <button
                        onClick={removeSelectedImageHandler}
                        className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-black/80 transition-all shadow-lg backdrop-blur-sm"
                        title="Remove image"
                      >
                        <MdClose className="text-xl" />
                      </button>
                    </div>
                  </div>
                )}

                {(isInputFocused || commentText.length > 0 || imagePreview) &&
                  auth.isLoggedIn && (
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
                        className="p-1.5 text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors"
                      >
                        <MdImage className="text-xl md:text-2xl" />
                      </button>
                      <div className="flex gap-2 md:gap-3 items-center">
                        <button
                          onClick={() => {
                            setCommentText("");
                            setSelectedImage(null);
                            setImagePreview(null);
                            setIsInputFocused(false);
                            if (textareaRef.current) {
                              textareaRef.current.style.height = "auto";
                              textareaRef.current.blur();
                            }
                          }}
                          className="px-3 py-1.5 text-[11px] md:text-sm font-bold text-zinc-700 hover:bg-zinc-100 rounded-full transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={
                            commentText.trim().length === 0 && !selectedImage
                          }
                          onClick={commentSubmitHandler}
                          className={`px-4 md:px-6 py-1.5 text-[11px] md:text-sm font-bold rounded-full transition-all ${commentText.trim().length > 0 || selectedImage ? "bg-primary text-white hover:opacity-90 shadow-sm" : "bg-zinc-100 text-zinc-400 cursor-not-allowed"}`}
                        >
                          Comment
                        </button>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <div className="space-y-6 md:space-y-8" ref={commentListRef}>
              {sortedComments.map((comment) => {
                const cId = comment.id || comment._id;
                const isEditingThisComment = editingCommentId === cId;
                return (
                  <div
                    key={cId}
                    id={cId}
                    className="flex gap-3 md:gap-4 p-2 md:p-3 rounded-lg hover:bg-zinc-50 transition-colors relative group"
                    onMouseLeave={() =>
                      !isEditingThisComment &&
                      openCommentMenuId === cId &&
                      setOpenCommentMenuId(null)
                    }
                    onClick={() =>
                      !isEditingThisComment &&
                      openCommentMenuId === cId &&
                      setOpenCommentMenuId(null)
                    }
                  >
                    {(comment.author?.id === auth.userId ||
                      comment.author?._id === auth.userId) &&
                      !isEditingThisComment && (
                        <div className="absolute top-2 right-2 md:top-3 md:right-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenCommentMenuId(
                                openCommentMenuId === cId ? null : cId
                              );
                            }}
                            className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 rounded-full transition-all"
                          >
                            <BsThreeDotsVertical className="text-base" />
                          </button>
                          {openCommentMenuId === cId && (
                            <div
                              className="absolute right-0 mt-1 w-32 md:w-40 bg-white border border-zinc-200 shadow-xl rounded-lg overflow-hidden z-40"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {(comment.type === "text" ||
                                comment.type === "mixed") && (
                                <button
                                  className="w-full flex items-center gap-3 px-4 py-2 text-[11px] md:text-sm font-medium text-zinc-700 hover:bg-zinc-50 border-b border-zinc-100"
                                  onClick={() => {
                                    setEditingCommentId(cId);
                                    setEditCommentText(comment.text);
                                    setOpenCommentMenuId(null);
                                  }}
                                >
                                  <MdEdit className="text-lg" /> Edit
                                </button>
                              )}
                              <button
                                className="w-full flex items-center gap-3 px-4 py-2 text-[11px] md:text-sm font-medium text-red-600 hover:bg-red-50"
                                onClick={() => deleteCommentHandler(cId)}
                              >
                                <MdDeleteForever className="text-lg md:text-xl" />{" "}
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-zinc-100 flex-shrink-0 overflow-hidden border">
                      {comment.author?.pfp ? (
                        <img
                          src={comment.author.pfp}
                          className="w-full h-full object-cover"
                          alt="author"
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-zinc-400 flex items-center justify-center h-full">
                          A
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap pr-8 md:pr-0">
                        <span className="font-bold text-zinc-800 text-xs md:text-sm truncate max-w-[100px] md:max-w-none">
                          {comment.author?.username || "Anonymous"}
                        </span>
                        <span className="text-zinc-400 text-[10px] md:text-xs">
                          {formatTimestamp(comment.createdAt)}
                        </span>
                        {comment.edited && (
                          <span className="text-zinc-300 text-[9px] md:text-[10px] italic">
                            {" "}
                            • edited
                          </span>
                        )}
                      </div>
                      {isEditingThisComment ? (
                        <div className="space-y-2 mt-2">
                          <textarea
                            ref={editCommentRef}
                            className="w-full bg-white border-b border-primary outline-none py-1 text-xs md:text-sm text-zinc-700 resize-none overflow-hidden"
                            rows={1}
                            value={editCommentText}
                            onChange={(e) => {
                              if (editCommentRef.current) {
                                editCommentRef.current.style.height = "auto";
                                editCommentRef.current.style.height = `${editCommentRef.current.scrollHeight}px`;
                              }
                              setEditCommentText(e.target.value);
                            }}
                            autoFocus
                          />
                          <div className="flex gap-3 justify-end">
                            <button
                              className="text-[10px] font-bold text-zinc-400 hover:text-zinc-600"
                              onClick={() => setEditingCommentId(null)}
                            >
                              Cancel
                            </button>
                            <button
                              disabled={isSavingComment}
                              className="text-[10px] font-bold text-primary hover:opacity-70 flex items-center gap-1"
                              onClick={() => saveCommentEditHandler(cId)}
                            >
                              <MdSave />{" "}
                              {isSavingComment ? "Saving..." : "Save"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {comment.text && (
                            <p className="text-zinc-600 text-xs md:text-sm leading-relaxed whitespace-pre-wrap pr-10">
                              {comment.text}
                            </p>
                          )}
                          {comment.image && (
                            <div className="mt-3 max-w-[200px] md:max-w-xs rounded-lg overflow-hidden border border-zinc-200 shadow-sm">
                              <img
                                src={comment.image}
                                className="w-full h-auto object-cover max-h-32 md:max-h-48"
                                alt="attachment"
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetails;
