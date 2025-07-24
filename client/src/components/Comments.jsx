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
    <div className="mt-8 p-2 bg-gray-100 rounded-lg comments-container">
      <h2 className="text-2xl font-semibold mb-4">Comments</h2>
      <form onSubmit={handleCommentSubmit} className="mb-4 flex items-center">
        <textarea
          className="flex-grow px-4 py-2 border rounded-l-md"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
        />
        <button
          type="submit"
          className="px-2 py-1 bg-blue-500 text-white rounded-md mb-8 ml-2"
        >
          Submit
        </button>
      </form>
      {mainComments.map((comment) => {
        const replies = repliesMap[comment.comment_id.toString()] || [];
        const isThreadExpanded = expandedThreads[comment.comment_id];
        
        return (
          <div key={comment.comment_id}>
            {/* Main Comment */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              {editCommentId === comment.comment_id ? (
                <div className="flex flex-col">
                  <textarea
                    className="mb-2 p-2 border rounded-md"
                    value={editCommentContent}
                    onChange={(e) => setEditCommentContent(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSaveEdit(comment.comment_id)}
                      className="mr-2 px-4 py-2 bg-green-500 text-white rounded-md flex items-center"
                    >
                      <FaSave className="mr-1" size={20} /> Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-red-500 text-white rounded-md flex items-center"
                    >
                      <FaTimes className="mr-1" size={20} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <p className="text-gray-700">{comment.content}</p>
                  <div className="flex items-center ml-4">
                    {parseInt(userId) === parseInt(comment.id) && (
                      <>
                        <button
                          onClick={() =>
                            handleEditComment(comment.comment_id, comment.content)
                          }
                          className="mr-2 text-blue-500"
                        >
                          <FaEdit size={20} />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.comment_id)}
                          className="text-red-500"
                        >
                          <FaTrash size={20} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {/* Comment Footer with Reply Link */}
              <div className="flex justify-between items-center mt-3">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => startReply(comment.comment_id)}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    <FaReply className="mr-1" size={12} />
                    Reply
                  </button>
                  
                  {replies.length > 0 && (
                    <button
                      onClick={() => toggleThread(comment.comment_id)}
                      className="text-gray-600 hover:text-gray-800 text-sm flex items-center"
                    >
                      {isThreadExpanded ? (
                        <>
                          <FaChevronUp className="mr-1" size={12} />
                          Hide {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                        </>
                      ) : (
                        <>
                          <FaChevronDown className="mr-1" size={12} />
                          Show {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                        </>
                      )}
                    </button>
                  )}
                </div>
                
                <div className="text-sm text-gray-500 capitalize">
                  Posted by: {comment.fullname} on{" "}
                  {new Date(comment.createdTimestamp).toLocaleString()}
                </div>
              </div>

              {/* Reply Form */}
              {replyToCommentId === comment.comment_id && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <form onSubmit={(e) => handleReplySubmit(e, comment.comment_id)}>
                    <textarea
                      className="w-full px-3 py-2 border rounded-md resize-none"
                      rows="3"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write your reply..."
                    />
                    <div className="flex justify-end mt-2 space-x-2">
                      <button
                        type="button"
                        onClick={cancelReply}
                        className="px-3 py-1 bg-gray-500 text-white rounded-md text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm"
                      >
                        Reply
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Thread Section - Replies */}
            {replies.length > 0 && isThreadExpanded && (
              <div className="ml-8 mb-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-300">
                <div className="space-y-3">
                  {replies.map((reply) => (
                    <div key={reply.comment_id} className="bg-white rounded-lg shadow-sm p-3">
                      {editReplyId === reply.comment_id ? (
                        <div className="flex flex-col">
                          <textarea
                            className="mb-2 p-2 border rounded-md resize-none"
                            rows="2"
                            value={editReplyContent}
                            onChange={(e) => setEditReplyContent(e.target.value)}
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleReplyEdit(reply.comment_id)}
                              className="px-3 py-1 bg-green-500 text-white rounded-md flex items-center text-sm"
                            >
                              <FaSave className="mr-1" size={14} /> Save
                            </button>
                            <button
                              onClick={() => {
                                setEditReplyId(null);
                                setEditReplyContent("");
                              }}
                              className="px-3 py-1 bg-red-500 text-white rounded-md flex items-center text-sm"
                            >
                              <FaTimes className="mr-1" size={14} /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <p className="text-gray-700 text-sm">{reply.content}</p>
                          <div className="flex items-center ml-4">
                            {parseInt(userId) === parseInt(reply.id) && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditReplyId(reply.comment_id);
                                    setEditReplyContent(reply.content);
                                  }}
                                  className="mr-2 text-blue-500"
                                >
                                  <FaEdit size={16} />
                                </button>
                                <button
                                  onClick={() => handleReplyDelete(reply.comment_id)}
                                  className="text-red-500"
                                >
                                  <FaTrash size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Reply Footer */}
                      <div className="flex justify-between items-center mt-2">
                        <button
                          onClick={() => startReply(comment.comment_id)}
                          className="text-blue-600 hover:text-blue-800 text-xs flex items-center"
                        >
                          <FaReply className="mr-1" size={10} />
                          Reply
                        </button>
                        
                        <div className="text-xs text-gray-500 capitalize">
                          {reply.fullname} • {new Date(reply.createdTimestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

Comments.propTypes = {
  postId: PropTypes.string.isRequired
};

export default Comments;
