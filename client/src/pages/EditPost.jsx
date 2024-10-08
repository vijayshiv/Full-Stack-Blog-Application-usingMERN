import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast } from "react-toastify";
import baseURL from "../config/apiURL";
import api from "../config/api";

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [img, setImg] = useState("");
  const [previewImg, setPreviewImg] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/post/${id}`);
        if (response.data.status === "success") {
          const fetchedPost = response.data.data[0];
          setTitle(fetchedPost.title);
          setContent(fetchedPost.content);
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

  const imageUrl = previewImg ? previewImg : `${baseURL}/images/${img}`;

  return (
    <div className="container mx-auto mt-16">
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
            htmlFor="content"
            className="block mt-2 mb-1 font-bold text-left"
          >
            Content :
          </label>
          <ReactQuill
            id="content"
            value={content}
            onChange={handleContentChange}
            className="mb-4 h-auto border-gray-700"
          />
          <div className="text-right">
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
        className="bg-blue-600 text-white p-2 rounded"
      >
        Save Changes
      </button>
    </div>
  );
};

export default EditPost;
