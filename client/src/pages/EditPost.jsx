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
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-8">Edit Post</h1>
      <div className="flex flex-wrap mb-4">
        <div className="w-full md:w-3/4 pr-4 mb-4 md:mb-0">
          <label htmlFor="title" className="block mb-1 font-bold text-left">
            Title :
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-700 rounded"
            placeholder="Post Title"
          />
          <label
            htmlFor="category"
            className="block mt-2 mb-1 font-bold text-left"
          >
            Category :
          </label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border border-gray-700 rounded"
            placeholder="Post Category"
          />
          <label
            htmlFor="content"
            className="block mt-2 mb-1 font-bold text-left"
          >
            Content :
          </label>
          <ReactQuill
            ref={quillRef}
            id="content"
            value={content}
            onChange={handleContentChange}
            className="mb-4 h-72 border-gray-700"
          />
          {/* AI Buttons Section */}
          <div className="max-sm:mt-20 mt-16 mb-2 flex justify-between items-center max-sm:flex-col max-sm:gap-2">
            {/* Topic Summary Button - Left Aligned */}
            <button
              onClick={() => setIsTopicSummaryModalOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm shadow-md"
            >
              📖 Topic Summary
            </button>
            
            {/* AI Rephrase Button - Right Aligned */}
            <button
              onClick={handleRephrase}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm shadow-md"
            >
              🤖 AI Rephrase Selected Text
            </button>
          </div>
          <div className="text-right max-sm:text-center">
            <span>{charCount}/8192</span>
          </div>
        </div>
        <div className="w-full md:w-1/4 flex justify-center items-start">
          {previewImg && (
            <div className="flex flex-col items-center justify-center">
              <label
                htmlFor="preview"
                className="block mb-1 font-bold text-left"
              >
                Image Preview
              </label>
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-auto rounded mb-2"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="img-upload"
              />
              <label
                htmlFor="img-upload"
                className="w-[70%] border-2 border-black p-1 bg-slate-200 cursor-pointer block mb-2 text-center"
              >
                Upload Image
              </label>
            </div>
          )}
        </div>
      </div>
      <button
        onClick={handleSave}
        className="md:mr-72 bg-blue-600 text-white p-2 rounded "
      >
        Save Changes
      </button>

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
