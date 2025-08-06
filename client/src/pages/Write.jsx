import { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../config/api";
import AIRephraseModal from "../components/AIRephraseModal";

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
      <div className="flex flex-col md:flex-row">
        <div className="md:basis-3/4 p-4">
          <div className="flex flex-col">
            <div className="mt-8 text-2xl text-left flex flex-col md:flex-row ">
              <label htmlFor="title" className="font-bold text-center">
                TITLE
              </label>
              <input
                type="text"
                className=" w-[268px] md:ml-3 border-2 md:w-72 "
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="mt-4">
              <ReactQuill
                ref={quillRef}
                className="h-48 w-auto overflow-y"
                theme="snow"
                value={content}
                onChange={handleChange}
              />
            </div>
            {/* AI Rephrase Button */}
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleRephrase}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
              >
                🤖 AI Rephrase Selected Text
              </button>
            </div>
          </div>
        </div>
        <div className="md:basis-1/4 p-4">
          <div className="flex flex-col mt-20 md:mt-0">
            <span>
              <input
                style={{ display: "none" }}
                type="file"
                name="image"
                id="file"
                onChange={(e) => setImg(e.target.files[0])}
              />
              <label className="btn mb-3 border-blue-700" htmlFor="file">
                {img ? "Image Selected" : "Upload Image"}
              </label>
            </span>
            <div className="mb-2">
              <button
                onClick={handleSubmit}
                className="btn border-blue-800 mb-2"
              >
                Publish
              </button>
            </div>
          </div>
          <div className="border border-black p-4 mt-4">
            <h1 className="text-2xl mb-4">
              <b>Category</b>
            </h1>
            <div className="flex flex-wrap gap-4">
              {/* Add more category groups here */}
              <div className="flex flex-col">
                <div className="flex items-center mb-2">
                  <input
                    type="radio"
                    name="cat"
                    value="art"
                    id="art"
                    onChange={() => setCategory("art")}
                  />
                  <label className="ml-2" htmlFor="art">
                    Art
                  </label>
                </div>
                <div className="flex items-center mb-2">
                  <input
                    type="radio"
                    name="cat"
                    value="science"
                    id="science"
                    onChange={() => setCategory("science")}
                  />
                  <label className="ml-2" htmlFor="science">
                    Science
                  </label>
                </div>
                <div className="flex items-center mb-2">
                  <input
                    type="radio"
                    name="cat"
                    value="technology"
                    id="technology"
                    onChange={() => setCategory("technology")}
                  />
                  <label className="ml-2" htmlFor="technology">
                    Technology
                  </label>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center mb-2">
                  <input
                    type="radio"
                    name="cat"
                    value="cinema"
                    id="cinema"
                    onChange={() => setCategory("cinema")}
                  />
                  <label className="ml-2" htmlFor="cinema">
                    Cinema
                  </label>
                </div>
                <div className="flex items-center mb-2">
                  <input
                    type="radio"
                    name="cat"
                    value="design"
                    id="design"
                    onChange={() => setCategory("design")}
                  />
                  <label className="ml-2" htmlFor="design">
                    Design
                  </label>
                </div>
                <div className="flex items-center mb-2">
                  <input
                    type="radio"
                    name="cat"
                    value="food"
                    id="food"
                    onChange={() => setCategory("food")}
                  />
                  <label className="ml-2" htmlFor="food">
                    Food
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="text-sm text-gray-500 ml-4 mt-2 text-left">
        Total characters: {charCount}/{maxCharCount}
      </div>

      {/* AI Rephrase Modal */}
      <AIRephraseModal
        isOpen={isRephraseModalOpen}
        onClose={() => setIsRephraseModalOpen(false)}
        selectedText={selectedText}
        onTextReplaced={handleTextReplaced}
      />
    </>
  );
};

export default Write;
