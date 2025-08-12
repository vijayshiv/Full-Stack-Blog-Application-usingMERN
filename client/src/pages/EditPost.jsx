import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast } from "react-toastify";
import baseURL from "../config/apiURL";
import api from "../config/api";
import AIRephraseModal from "../components/AIRephraseModal";
import TopicSummaryModal from "../components/TopicSummaryModal";

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [img, setImg] = useState("");
  const [previewImg, setPreviewImg] = useState("");
  const [isRephraseModalOpen, setIsRephraseModalOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [selectionInfo, setSelectionInfo] = useState(null);
  const [isTopicSummaryModalOpen, setIsTopicSummaryModalOpen] = useState(false);
  const quillRef = useRef(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/post/${id}`);
        if (response.data.status === "success") {
          const fetchedPost = response.data.data[0];
          setTitle(fetchedPost.title);
          setContent(fetchedPost.content);
          setCategory(fetchedPost.category);
          setCharCount(fetchedPost.content.length); // Set initial character count
          setImg(fetchedPost.img);
          setPreviewImg(`${baseURL}/images/${fetchedPost.img}`); // Set preview image URL
        } else {
          toast.error("Failed to fetch post data");
        }
      } catch (error) {
        console.error("Error fetching post data:", error);
        toast.error("An error occurred while fetching post data.");
      }
    };

    fetchPost();
  }, [id]);

  const handleSave = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("category", category);
      formData.append("img", img);
      const response = await axios.put(
        `${baseURL}/posts/update-post/${id}`,
        formData,
        {
          headers: {
            token: token,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.status === "success") {
        toast.success("Post updated successfully");
        navigate(`/post/${id}`);
      } else {
        toast.error(response.data.error || "Failed to update post");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("An error occurred while updating the post.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImg(file);
      setPreviewImg(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleContentChange = (value) => {
    if (value.length <= 8192) {
      setContent(value);
      setCharCount(value.length);
    } else {
      toast.error("Content exceeds the maximum character limit of 8192.");
    }
  };

  // Handle AI rephrase functionality
  const handleRephrase = () => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const selection = quill.getSelection();
      if (selection && selection.length > 0) {
        const text = quill.getText(selection.index, selection.length);
        setSelectedText(text.trim());
        setSelectionInfo({ index: selection.index, length: selection.length });
        setIsRephraseModalOpen(true);
      } else {
        toast.warning("Please select some text to rephrase");
      }
    }
  };

  const handleTextReplaced = (newText) => {
    const quill = quillRef.current?.getEditor();
    if (quill && selectionInfo) {
      // Use the stored selection information instead of current selection
      quill.deleteText(selectionInfo.index, selectionInfo.length);
      quill.insertText(selectionInfo.index, newText);
      // Update content state
      setContent(quill.root.innerHTML);
      setCharCount(quill.getText().length);
      // Clear the selection info
      setSelectionInfo(null);
      setSelectedText("");
    }
  };

  const imageUrl = previewImg ? previewImg : `${baseURL}/images/${img}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-4">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
            <h1 className="text-xl font-bold text-left">✏️ Edit Post</h1>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Main Editing Area */}
            <div className="lg:w-3/4 p-4">
              {/* Title Section */}
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2 text-left">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Enter your post title..."
                />
              </div>

              {/* Category Section */}
              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2 text-left">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Select a category</option>
                  <option value="art">🎨 Art</option>
                  <option value="science">🔬 Science</option>
                  <option value="technology">💻 Technology</option>
                  <option value="cinema">🎬 Cinema</option>
                  <option value="design">🎯 Design</option>
                  <option value="food">🍕 Food</option>
                </select>
              </div>

              {/* Content Editor */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2 text-left">
                  Content
                </label>
                <div className="relative">
                  <ReactQuill
                    ref={quillRef}
                    value={content}
                    onChange={handleContentChange}
                    className="h-40 border-gray-300 rounded-lg"
                    theme="snow"
                  />
                </div>
              </div>

              {/* Character Count */}
              <div className="text-xs text-gray-500 mb-4 text-right mt-12">
                {charCount}/8192 characters
              </div>

              {/* AI Tools */}
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <button
                  onClick={() => setIsTopicSummaryModalOpen(true)}
                  className="flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 
                             text-white rounded-lg hover:from-green-600 hover:to-green-700 
                             transform hover:scale-105 transition-all duration-300 shadow-md text-sm"
                >
                  <span>📖</span>
                  <span>Topic Summary</span>
                </button>
                
                <button
                  onClick={handleRephrase}
                  className="flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 
                             text-white rounded-lg hover:from-purple-600 hover:to-purple-700 
                             transform hover:scale-105 transition-all duration-300 shadow-md text-sm"
                >
                  <span>🤖</span>
                  <span>AI Rephrase</span>
                </button>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white 
                           rounded-lg hover:from-blue-700 hover:to-blue-800 
                           transform hover:scale-105 transition-all duration-300 shadow-lg 
                           font-semibold text-sm"
              >
                💾 Save Changes
              </button>
            </div>

            {/* Sidebar - Image Preview */}
            <div className="lg:w-1/4 bg-gray-50/50 p-4 border-l border-gray-200">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2 text-left">
                  Featured Image
                </label>
                
                {previewImg && (
                  <div className="mb-3">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg shadow-md"
                    />
                  </div>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="img-upload"
                />
                <label
                  htmlFor="img-upload"
                  className="flex items-center justify-center w-full px-3 py-2 border-2 border-dashed border-blue-300 
                             rounded-lg cursor-pointer hover:border-blue-500 transition-colors text-sm text-center
                             bg-blue-50 hover:bg-blue-100"
                >
                  📸 Change Image
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Rephrase Modal */}
      <AIRephraseModal
        isOpen={isRephraseModalOpen}
        onClose={() => setIsRephraseModalOpen(false)}
        selectedText={selectedText}
        onTextReplaced={handleTextReplaced}
      />

      {/* Topic Summary Modal */}
      <TopicSummaryModal
        isOpen={isTopicSummaryModalOpen}
        onClose={() => setIsTopicSummaryModalOpen(false)}
      />
    </div>
  );
};

export default EditPost;
