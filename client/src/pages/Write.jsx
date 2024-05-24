import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// referred link for the text area.
// https://github.com/zenoamaro/react-quill?tab=readme-ov-file#quick-start

export default function Write() {
  const [value, setValue] = useState("");
  return (
    <>
      <div className="flex flex-row ">
        <div className="basis-3/4 justify-center justify-items-center ">
          <div className="flex flex-col">
            <div className="basis-1/4 mt-8 text-2xl text-left">
              <label htmlFor="title" className="font-bold">
                TITLE :{" "}
              </label>
              <input type="text" className="ml-3 border-2 " />
            </div>
            <div className="basis-3/4 mt-4 ">
              {" "}
              <ReactQuill
                className="h-80 w-full"
                theme="snow"
                value={value}
                onChange={setValue}
              />
            </div>
          </div>
        </div>
        <div className="basis-1/4">
          <div className="flex flex-col">
            <div className="basis-1/2">Publish</div>
            <div className="basis-1/2">Status</div>
          </div>
        </div>
      </div>
    </>
  );
}
