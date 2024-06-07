import React, { useState } from "react";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function Write() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [img, setImg] = useState("");
  const [category, setCategory] = useState("");
  const write = async () => {
    const body = {
      title,
      content,
      img,
      category,
    };

    const token = localStorage.getItem("token");

    try {
      const res = await axios.post("http://localhost:4000/my-post", body, {
        headers: {
          token: token,
        },
      });
      console.log(res.data);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <>
      <div className="flex flex-row">
        <div className="basis-3/4 justify-center justify-items-center">
          <div className="flex flex-col">
            <div className="basis-1/4 mt-8 text-2xl text-left">
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
            <div className="basis-3/4 mt-4">
              <ReactQuill
                className="h-48 w-auto overflow-y"
                theme="snow"
                value={content}
                onChange={setContent}
              />
            </div>
          </div>
        </div>
        <div className="basis-1/4">
          <div className="flex flex-col">
            <div className="basis-1/2">
              <b onClick={write}>Publish</b>
            </div>
            <div className="basis-1/2">Status</div>
            <span>
              <input
                style={{ display: "none" }}
                type="file"
                name="file"
                id="file"
              />
              <label htmlFor="file">Upload Image</label>
            </span>
            <div>
              <button className="btn-lg border-black">Save File</button>
            </div>
          </div>
          <div className="px-10">
            <h1>
              <b>Category</b>
            </h1>
            <div className="cat">
              <input
                type="radio"
                name="cat"
                value="art"
                id="art"
                onChange={() => setCategory("art")}
              />
              <label htmlFor="art">Art</label>
            </div>
            <div className="cat">
              <input
                type="radio"
                name="cat"
                value="science"
                id="science"
                onChange={() => setCategory("science")}
              />
              <label htmlFor="science">Science</label>
            </div>
            <div className="cat">
              <input
                type="radio"
                name="cat"
                value="technology"
                id="technology"
                onChange={() => setCategory("technology")}
              />
              <label htmlFor="technology">Technology</label>
            </div>
            <div className="cat">
              <input
                type="radio"
                name="cat"
                value="cinema"
                id="cinema"
                onChange={() => setCategory("cinema")}
              />
              <label htmlFor="cinema">Cinema</label>
            </div>
            <div className="cat">
              <input
                type="radio"
                name="cat"
                value="design"
                id="design"
                onChange={() => setCategory("design")}
              />
              <label htmlFor="design">Design</label>
            </div>
            <div className="cat">
              <input
                type="radio"
                name="cat"
                value="food"
                id="food"
                onChange={() => setCategory("food")}
              />
              <label htmlFor="food">Food</label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
