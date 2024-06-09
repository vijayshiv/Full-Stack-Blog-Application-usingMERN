import React, { useState } from "react";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Write() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [img, setImg] = useState(null);
  const [category, setCategory] = useState("");
  const navigate = useNavigate();

  const write = async () => {
    const strippedContent = content.replace(/<[^>]+>/g, "");
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", strippedContent);
    formData.append("image", img);
    formData.append("category", category);

    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        "http://localhost:4000/posts/my-post",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            token: token,
          },
        }
      );
      console.log(res.data);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const validateInputs = () => {
    if (!title || !content || !img || !category) {
      alert("Please fill in all fields");
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to publish a post");
      return;
    }
    if (validateInputs()) {
      write();
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="flex flex-col md:flex-row">
        <div className="md:basis-3/4 p-4">
          <div className="flex flex-col">
            <div className="mt-8 text-2xl text-left">
              <label htmlFor="title" className="font-bold">
                TITLE :
              </label>
              <input
                type="text"
                className="ml-3 border-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="mt-4">
              <ReactQuill
                className="h-48 w-auto overflow-y"
                theme="snow"
                value={content}
                onChange={setContent}
              />
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
    </>
  );
}

/**/
