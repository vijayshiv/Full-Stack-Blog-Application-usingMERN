import React, { useState } from "react";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import styles for ReactQuill

export default function Write() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [img, setImg] = useState(""); // Add state for image if needed

  const write = async () => {
    const body = {
      title,
      content,
      img, // Include image if needed
    };

    const token = localStorage.getItem("token"); // Retrieve the token from localStorage

    try {
      const res = await axios.post("http://localhost:4000/my-post", body, {
        headers: {
          token: token,
        },
      });
      console.log(res.data); // Handle response
    } catch (error) {
      console.error(error); // Handle error
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
                onChange={(e) => {
                  console.log(e.target.value);
                  setTitle(e.target.value);
                }}
              />
            </div>
            <div className="basis-3/4 mt-4">
              <ReactQuill
                className="h-80 w-full"
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
            <h1>Category</h1>
            <div className="cat">
              <input type="radio" name="cat" value="art" id="art" />
              <label htmlFor="art">Art</label>
            </div>
            <div className="cat">
              <input type="radio" name="cat" value="science" id="science" />
              <label htmlFor="science">Science</label>
            </div>
            <div className="cat">
              <input
                type="radio"
                name="cat"
                value="technology"
                id="technology"
              />
              <label htmlFor="technology">Technology</label>
            </div>
            <div className="cat">
              <input type="radio" name="cat" value="cinema" id="cinema" />
              <label htmlFor="cinema">Cinema</label>
            </div>
            <div className="cat">
              <input type="radio" name="cat" value="design" id="design" />
              <label htmlFor="design">Design</label>
            </div>
            <div className="cat">
              <input type="radio" name="cat" value="food" id="food" />
              <label htmlFor="food">Food</label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
