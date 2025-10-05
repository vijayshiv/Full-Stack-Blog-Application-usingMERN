import { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../config/api";
import AIRephraseModal from "../components/AIRephraseModal";
import BlogWritingAssistant from "../components/TopicSummaryModal";

const Write = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [img, setImg] = useState(null);
  const [category, setCategory] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [maxCharCount] = useState(8192); // Maximum character count
  const [isRephraseModalOpen, setIsRephraseModalOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [selectionInfo, setSelectionInfo] = useState(null);
  const [isBlogAssistantOpen, setIsBlogAssistantOpen] = useState(false);
  const quillRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to add a post.");
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (value) => {
    if (value.length <= maxCharCount) {
      setContent(value);
      setCharCount(value.length);
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
    if (selectionInfo && quillRef.current) {
      const quill = quillRef.current.getEditor();
      quill.deleteText(selectionInfo.index, selectionInfo.length);
      quill.insertText(selectionInfo.index, newText);
      setSelectionInfo(null);
    }
  };

  const handleContentGenerated = (newContent) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      
      // Get current selection or cursor position
      const selection = quill.getSelection() || { index: quill.getLength(), length: 0 };
      
      // Check if editor is empty or nearly empty
      const currentText = quill.getText().trim();
      const insertIndex = currentText.length === 0 ? 0 : selection.index;
      
      // Add spacing if inserting into existing content
      const contentToInsert = currentText.length > 0 && insertIndex > 0 ? '\n\n' + newContent : newContent;
      
      // Insert the text content (ReactQuill will handle formatting through toolbar)
      quill.insertText(insertIndex, contentToInsert);
      
      // Update the content state and character count
      setContent(quill.root.innerHTML);
      setCharCount(quill.getText().length);
      
      // Focus the editor and set cursor after inserted content
      quill.focus();
      quill.setSelection(insertIndex + contentToInsert.length);
    }
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to add a post.");
      navigate("/login");
      return;
    }

    // Ensure all required fields are filled
    if (!title || !content || !img || !category) {
      toast.error("Please fill in all fields");
      return;
    }

    // Create form data
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("image", img);
    formData.append("category", category);

    try {
      await api.post("/posts/add-post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          token: token,
        },
      });
      navigate("/");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-4">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              {/* Main Writing Area */}
              <div className="lg:w-3/4 p-4">
                {/* Title Section */}
                <div className="mb-4">
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2 text-left">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Enter your post title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Content Editor */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 text-left">
                    Content
                  </label>
                  <div className="relative">
                    <ReactQuill
                      ref={quillRef}
                      className="h-40 border-gray-300 rounded-lg"
                      theme="snow"
                      value={content}
                      onChange={handleChange}
                      placeholder="Write your post content here..."
                    />
                  </div>
                </div>

                {/* Character Count */}
                <div className="text-xs text-gray-500 mb-4 text-right mt-12">
                  {charCount}/{maxCharCount} characters
                </div>

                {/* AI Tools */}
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                  <button
                    onClick={() => setIsBlogAssistantOpen(true)}
                    className="flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-blue-500 
                               text-white rounded-lg hover:from-purple-600 hover:to-blue-600 
                               transform hover:scale-105 transition-all duration-300 shadow-md text-sm"
                  >
                    <span>✨</span>
                    <span>AI Blog Assistant</span>
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
              </div>

              {/* Sidebar */}
              <div className="lg:w-1/4 bg-gray-50/50 p-4 border-l border-gray-200">
                {/* Image Upload */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 text-left">
                    Featured Image
                  </label>
                  <input
                    type="file"
                    name="image"
                    id="file"
                    className="hidden"
                    onChange={(e) => setImg(e.target.files[0])}
                  />
                  <label 
                    htmlFor="file"
                    className="flex items-center justify-center w-full px-3 py-2 border-2 border-dashed border-blue-300 
                               rounded-lg cursor-pointer hover:border-blue-500 transition-colors text-sm text-center
                               bg-blue-50 hover:bg-blue-100"
                  >
                    {img ? "✅ Image Selected" : "📸 Upload Image"}
                  </label>
                </div>

                {/* Category Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 text-left">
                    Category
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: "art", label: "🎨 Art" },
                      { value: "science", label: "🔬 Science" },
                      { value: "technology", label: "💻 Technology" },
                      { value: "cinema", label: "🎬 Cinema" },
                      { value: "design", label: "🎯 Design" },
                      { value: "food", label: "🍕 Food" }
                    ].map((cat) => (
                      <label key={cat.value} className="flex items-center space-x-2 cursor-pointer text-sm">
                        <input
                          type="radio"
                          name="category"
                          value={cat.value}
                          checked={category === cat.value}
                          onChange={() => setCategory(cat.value)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{cat.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Publish Button */}
                <button
                  onClick={handleSubmit}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white 
                             rounded-lg hover:from-blue-700 hover:to-blue-800 
                             transform hover:scale-105 transition-all duration-300 shadow-lg 
                             font-semibold text-sm"
                >
                  🚀 Publish Post
                </button>
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

      {/* AI Blog Writing Assistant */}
      <BlogWritingAssistant
        isOpen={isBlogAssistantOpen}
        onClose={() => setIsBlogAssistantOpen(false)}
        onContentGenerated={handleContentGenerated}
      />
    </>
  );
};

export default Write;
