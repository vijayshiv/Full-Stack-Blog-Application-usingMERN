import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import api from "../config/api"; // Adjust path if necessary
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Comments.css";
import { FaEdit, FaTrash, FaSave, FaTimes, FaReply, FaChevronDown, FaChevronUp } from "react-icons/fa";

const Comments = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [userId, setUserId] = useState(null);
  
  // Reply functionality states
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [expandedThreads, setExpandedThreads] = useState({});
  const [editReplyId, setEditReplyId] = useState(null);
  const [editReplyContent, setEditReplyContent] = useState("");

  useEffect(() => {
    const storedUserId = sessionStorage.getItem("id");
    setUserId(storedUserId);
    
    const fetchComments = async () => {
      try {
        const response = await api.get(`/posts/comments/${postId}`);
        if (response.data.status === "success") {
          if (Array.isArray(response.data.data)) {
            // Process the comments to ensure consistent data structure
            const processedComments = response.data.data.map(comment => ({
              ...comment,
              parent_comment_id: comment.parent_comment_id || null,
              user_id: parseInt(comment.user_id) || comment.user_id,
              id: parseInt(comment.id) || comment.id
            }));
            setComments(processedComments);
          } else {
            toast.error("Failed to fetch comments");
          }
        } else {
          toast.error("Failed to fetch comments");
        }
      } catch (error) {
        toast.error("Failed to fetch comments");
      }
    };
    
    fetchComments();
  }, [postId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");
    const storedName = sessionStorage.getItem("name");

    if (!token || !storedName) {
      toast.error("Please login to comment");
      return;
    }

    try {
      const response = await api.post(
        `/posts/comment/${postId}`,
        { content: newComment },
        {
          headers: {
            token: token,
          },
        }
      );
      if (response.data.status === "success") {
        if (response.data.data.comment_id) {
          setComments((prevComments) => [
            ...prevComments,
            {
              comment_id: response.data.data.comment_id,
              content: newComment,
              createdTimestamp: response.data.data.createdTimestamp || new Date().toISOString(),
              fullname: storedName, // Use the actual name
              user_id: userId,
              id: userId, // Add this field to match the condition for edit/delete buttons
              parent_comment_id: null // Explicitly set to null for main comments
            },
          ]);
          setNewComment("");
          toast.success("Comment added successfully!");
        } else {
          toast.error("Invalid response structure");
        }
      } else {
        toast.error("Error adding comment");
      }
    } catch (error) {
      toast.error("Error adding comment");
    }
  };

  const handleEditComment = (commentId, content) => {
    setEditCommentId(commentId);
    setEditCommentContent(content);
  };

  const handleSaveEdit = async (commentId) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("User not authenticated");
      return;
    }

    try {
      const response = await api.put(
        `/posts/comment/${commentId}`,
        { content: editCommentContent },
        {
          headers: {
            token: token,
          },
        }
      );
      if (response.data.status === "success") {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.comment_id === commentId
              ? { ...comment, content: editCommentContent }
              : comment
          )
        );
        setEditCommentId(null);
        setEditCommentContent("");
      } else {
        toast.error("Error updating comment");
      }
    } catch (error) {
      toast.error("Error updating comment");
    }
  };

  const handleCancelEdit = () => {
    setEditCommentId(null);
    setEditCommentContent("");
  };

  const handleDeleteComment = async (commentId) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("User not authenticated");
      return;
    }

    try {
      const response = await api.delete(`/posts/comment/${commentId}`, {
        headers: {
          token: token,
        },
      });
      if (response.data.status === "success") {
        setComments((prevComments) =>
          prevComments.filter((comment) => comment.comment_id !== commentId)
        );
      } else {
        toast.error("Error deleting comment");
      }
    } catch (error) {
      toast.error("Error deleting comment");
    }
  };

  // Reply functionality handlers
  const handleReplySubmit = async (e, parentCommentId) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");
    const storedUserId = sessionStorage.getItem("id");
    const storedName = sessionStorage.getItem("name");

    if (!token || !storedName) {
      toast.error("Please login to reply");
      return;
    }

    if (!replyContent.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }

    try {
      const response = await api.post(
        `/posts/comment/${postId}`,
        { 
          content: replyContent,
          parentCommentId: parentCommentId 
        },
        {
          headers: {
            token: token,
          },
        }
      );
      
      if (response.data.status === "success") {
        const newReply = {
          comment_id: response.data.data.comment_id,
          content: replyContent,
          createdTimestamp: new Date().toISOString(), // Use current timestamp for proper ordering
          fullname: storedName,
          user_id: parseInt(storedUserId),
          id: parseInt(storedUserId),
          parent_comment_id: parseInt(parentCommentId)
        };

        // Add the new reply and let the groupComments function handle the sorting
        setComments((prevComments) => [...prevComments, newReply]);
        
        setReplyContent("");
        setReplyToCommentId(null);
        
        // Auto-expand the thread to show the new reply
        setExpandedThreads(prev => ({
          ...prev,
          [parentCommentId]: true
        }));
        
        toast.success("Reply added successfully!");
      } else {
        toast.error("Error adding reply");
      }
    } catch (error) {
      toast.error("Error adding reply");
    }
  };

  const handleReplyEdit = async (replyId) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("User not authenticated");
      return;
    }

    try {
      const response = await api.put(
        `/posts/comment/${replyId}`,
        { content: editReplyContent },
        {
          headers: {
            token: token,
          },
        }
      );
      if (response.data.status === "success") {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.comment_id === replyId
              ? { ...comment, content: editReplyContent }
              : comment
          )
        );
        setEditReplyId(null);
        setEditReplyContent("");
      } else {
        toast.error("Error updating reply");
      }
    } catch (error) {
      toast.error("Error updating reply");
    }
  };

  const handleReplyDelete = async (replyId) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("User not authenticated");
      return;
    }

    try {
      const response = await api.delete(`/posts/comment/${replyId}`, {
        headers: {
          token: token,
        },
      });
      if (response.data.status === "success") {
        setComments((prevComments) =>
          prevComments.filter((comment) => comment.comment_id !== replyId)
        );
      } else {
        toast.error("Error deleting reply");
      }
    } catch (error) {
      toast.error("Error deleting reply");
    }
  };

  const toggleThread = (commentId) => {
    setExpandedThreads(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const startReply = (commentId) => {
    setReplyToCommentId(commentId);
    setReplyContent("");
  };

  const cancelReply = () => {
    setReplyToCommentId(null);
    setReplyContent("");
  };

  // Helper function to group comments and replies (memoized)
  const { mainComments, repliesMap } = useMemo(() => {
    const mainComments = [];
    const repliesMap = {};
    
    // First pass: separate main comments and build replies map
    comments.forEach(comment => {
      // Check if this is a main comment (no parent)
      const hasParent = comment.parent_comment_id && 
                       comment.parent_comment_id !== null && 
                       comment.parent_comment_id !== 'null' &&
                       comment.parent_comment_id !== undefined &&
                       comment.parent_comment_id !== 0;
      
      if (!hasParent) {
        // This is a main comment
        mainComments.push(comment);
      } else {
        // This is a reply
        const parentId = comment.parent_comment_id.toString();
        if (!repliesMap[parentId]) {
          repliesMap[parentId] = [];
        }
        repliesMap[parentId].push(comment);
      }
    });
    
    // Sort main comments by creation date (newest first for main comments)
    mainComments.sort((a, b) => new Date(b.createdTimestamp) - new Date(a.createdTimestamp));
    
    // Sort replies by creation date (oldest first for replies within each thread)
    Object.keys(repliesMap).forEach(parentId => {
      repliesMap[parentId].sort((a, b) => {
        const dateA = new Date(a.createdTimestamp);
        const dateB = new Date(b.createdTimestamp);
        return dateA - dateB;
      });
    });
    
    return { mainComments, repliesMap };
  }, [comments]);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 p-3 
                    hover:shadow-md transition-all duration-300">
      {/* Compact Header */}
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full 
                        flex items-center justify-center text-white font-bold text-xs">
          💬
        </div>
        <h3 className="text-sm font-semibold text-gray-800">
          {mainComments.length} {mainComments.length === 1 ? 'Comment' : 'Comments'}
        </h3>
      </div>

      {/* Compact Comment Input Form */}
      <form onSubmit={handleCommentSubmit} className="mb-3">
        <div className="flex items-start space-x-2">
          {/* User Avatar */}
          <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full 
                          flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            {sessionStorage.getItem("name")?.charAt(0).toUpperCase() || "?"}
          </div>
          
          {/* Input Area */}
          <div className="flex-1">
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-full resize-none
                         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200
                         transition-all duration-200 bg-gray-50 placeholder-gray-500 text-sm
                         hover:bg-white"
              rows="1"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              style={{ minHeight: '40px', maxHeight: '120px' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
            
            {/* Action Buttons - Only show when typing */}
            {newComment.trim() && (
              <div className="flex justify-end mt-2 space-x-2">
                <button
                  type="button"
                  onClick={() => setNewComment("")}
                  className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm
                             transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-4 py-1 bg-blue-600 text-white rounded-full text-sm font-medium
                             hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                             transition-all duration-200"
                >
                  Comment
                </button>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3">
        {mainComments.map((comment, index) => {
          const replies = repliesMap[comment.comment_id.toString()] || [];
          const isThreadExpanded = expandedThreads[comment.comment_id];
          
          return (
            <div key={comment.comment_id} className="group">
              {/* Main Comment */}
              <div className="flex items-start space-x-2">
                {/* User Avatar */}
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full 
                                flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {comment.fullname.charAt(0).toUpperCase()}
                </div>
                
                {/* Comment Content */}
                <div className="flex-1 min-w-0">
                  {editCommentId === comment.comment_id ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <textarea
                        className="w-full p-2 border border-gray-300 rounded-md resize-none
                                   focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200
                                   text-sm"
                        rows="2"
                        value={editCommentContent}
                        onChange={(e) => setEditCommentContent(e.target.value)}
                      />
                      <div className="flex justify-end mt-2 space-x-2">
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(comment.comment_id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors duration-200">
                      {/* Comment Header */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm text-gray-900">
                            {comment.fullname.charAt(0).toUpperCase() + comment.fullname.slice(1).toLowerCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdTimestamp).toLocaleString()}
                          </span>
                        </div>
                        
                        {/* Action Buttons */}
                        {parseInt(userId) === parseInt(comment.id) && (
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditComment(comment.comment_id, comment.content)}
                              className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                              title="Edit"
                            >
                              <FaEdit size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.comment_id)}
                              className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                              title="Delete"
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Comment Content */}
                      <p className="text-left text-sm text-gray-800 leading-relaxed mb-2">{comment.content}</p>

                      {/* Comment Actions */}
                      <div className="flex items-center space-x-4 text-xs">
                        <button
                          onClick={() => startReply(comment.comment_id)}
                          className="text-gray-500 hover:text-blue-600 font-medium transition-colors"
                        >
                          Reply
                        </button>
                        
                        {replies.length > 0 && (
                          <button
                            onClick={() => toggleThread(comment.comment_id)}
                            className="text-gray-500 hover:text-blue-600 font-medium transition-colors flex items-center space-x-1"
                          >
                            <span>
                              {isThreadExpanded ? 'Hide' : 'View'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                            </span>
                            {isThreadExpanded ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Reply Form */}
                  {replyToCommentId === comment.comment_id && (
                    <div className="mt-2 ml-2">
                      <form onSubmit={(e) => handleReplySubmit(e, comment.comment_id)} className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full 
                                        flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {sessionStorage.getItem("name")?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="flex-1">
                          <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-full resize-none
                                       focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200
                                       text-sm bg-gray-50 hover:bg-white"
                            rows="1"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                            style={{ minHeight: '32px' }}
                          />
                          <div className="flex justify-end mt-1 space-x-2">
                            <button
                              type="button"
                              onClick={cancelReply}
                              className="px-3 py-1 text-gray-600 hover:text-gray-800 text-xs"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs
                                         hover:bg-blue-700 transition-colors"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>

              {/* Replies Thread */}
              {replies.length > 0 && isThreadExpanded && (
                <div className="ml-10 mt-2 space-y-2">
                  {replies.map((reply, replyIndex) => (
                    <div key={reply.comment_id} className="flex items-start space-x-2 group">
                      {/* Reply Avatar */}
                      <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full 
                                      flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {reply.fullname.charAt(0).toUpperCase()}
                      </div>
                      
                      {/* Reply Content */}
                      <div className="flex-1 min-w-0">
                        {editReplyId === reply.comment_id ? (
                          <div className="bg-white border border-gray-200 rounded-lg p-2">
                            <textarea
                              className="w-full p-2 border border-gray-300 rounded-md resize-none
                                         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200
                                         text-sm"
                              rows="2"
                              value={editReplyContent}
                              onChange={(e) => setEditReplyContent(e.target.value)}
                            />
                            <div className="flex justify-end mt-2 space-x-2">
                              <button
                                onClick={() => {
                                  setEditReplyId(null);
                                  setEditReplyContent("");
                                }}
                                className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleReplyEdit(reply.comment_id)}
                                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition-colors duration-200">
                            {/* Reply Header */}
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-sm text-gray-900">
                                  {reply.fullname.charAt(0).toUpperCase() + reply.fullname.slice(1).toLowerCase()}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(reply.createdTimestamp).toLocaleString()}
                                </span>
                              </div>
                              
                              {/* Reply Action Buttons */}
                              {parseInt(userId) === parseInt(reply.id) && (
                                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => {
                                      setEditReplyId(reply.comment_id);
                                      setEditReplyContent(reply.content);
                                    }}
                                    className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                                    title="Edit"
                                  >
                                    <FaEdit size={10} />
                                  </button>
                                  <button
                                    onClick={() => handleReplyDelete(reply.comment_id)}
                                    className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                                    title="Delete"
                                  >
                                    <FaTrash size={10} />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Reply Content */}
                            <p className="text-left text-sm text-gray-800 leading-relaxed mb-1">{reply.content}</p>

                            {/* Reply Actions */}
                            <div className="flex items-center space-x-4 text-xs">
                              <button
                                onClick={() => startReply(comment.comment_id)}
                                className="text-gray-500 hover:text-blue-600 font-medium transition-colors"
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {mainComments.length === 0 && (
        <div className="text-center py-6 animate-fade-in">
          <div className="text-2xl mb-2">💬</div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1">No comments yet</h3>
          <p className="text-gray-500 text-xs">Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
};

Comments.propTypes = {
  postId: PropTypes.string.isRequired
};

export default Comments;
