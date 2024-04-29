import React from "react";
import sideImage from "../images/side.jpg"; // Import the image

export default function Login() {
  return (
    <section className="bgimage">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <div>
          <img
            src={sideImage}
            alt="Image"
            style={{
              borderTopLeftRadius: 10,
              borderBottomLeftRadius: 10,
              backgroundColor: "white",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: 500,
              width: 400,
            }}
          />{" "}
          {/* Use the imported image */}
        </div>
        <div
          className="form"
          style={{
            borderTopRightRadius: 10,
            borderBottomRightRadius: 10,
            backgroundColor: "#8CBED6",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: 500,
            width: 400,
          }}
        >
          <div style={{ paddingBottom: 15, fontSize: 25, fontWeight: 650 }}>
            Registration Here
          </div>
          <div>
            <label htmlFor="">Name : </label>
            <br />
            <input type="text" style={{ height: 30, width: 270 }} />
          </div>
          <div>
            <label htmlFor="">Email : </label>
            <br />
            <input type="text" style={{ height: 30, width: 270 }} />
          </div>
          <div>
            <label htmlFor="">Password : </label>
            <br />
            <input type="text" style={{ height: 30, width: 270 }} />
          </div>
          <div>
            <label htmlFor="">Confirm Password : </label>
            <br />
            <input type="text" style={{ height: 30, width: 270 }} />
          </div>
          <div>
            <label htmlFor="">Phone Number : </label>
            <br />
            <input type="text" style={{ height: 30, width: 270 }} />
          </div>{" "}
          <div>
            <label htmlFor="">Address : </label>
            <br />
            <input type="text" style={{ height: 30, width: 270 }} />
          </div>
          <div>
            <label htmlFor="">Adhaar Number : </label>
            <br />
            <input type="text" style={{ height: 30, width: 270 }} />
          </div>
          <button type="submit" className="btn btn-primary mt-3">
            Submit
          </button>
        </div>
      </div>
    </section>
  );
}
