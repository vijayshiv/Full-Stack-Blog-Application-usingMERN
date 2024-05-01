import email from "../components/assets/email.jpeg";

export default function Register() {
  return (
    <>
      <div
        className="dark-overlay"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.2)", // Dark overlay color with 50% opacity
        }}
      ></div>
      <div
        className="container-fluid d-flex justify-content-center align-items-center"
        style={{ height: "100vh", background: "skyblue" }}
      >
        <div
          className="login-template"
          style={{
            background: "linear-gradient(to right, #aee1f9, #f6ebe6)",
            borderRadius: "10px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.4)",
            width: "30%",
            padding: "50px",
            paddingBottom: "30px",
            paddingTop: "30px",
          }}
        >
          <form>
            <h2
              style={{
                marginBottom: "20px",
                color: "#333",
                textAlign: "center",
              }}
            >
              Sign Up
            </h2>
            <div className="row g-3">
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="First name"
                  aria-label="First name"
                />
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Last name"
                  aria-label="Last name"
                />
              </div>
            </div>
            <br />
            <div className="row g-3">
              <div className="col-md-12">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Email"
                  aria-label="Email"
                />
              </div>
            </div>
            <br />
            <div className="row g-3">
              <div className="col-md-12">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Password"
                  aria-label="Password"
                />
              </div>
            </div>
            <br />
            <div className="row g-3">
              <div className="col-md-12">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Confirm Password"
                  aria-label="Confirm Password"
                />
              </div>
            </div>
            <br />
            <div className="row g-3">
              <div className="col-md-12">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Phone Number"
                  aria-label="Phone Number"
                />
              </div>
            </div>
            <br />
            <div className="row g-3">
              <div className="col-md-12">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Aadhaar Card Number"
                  aria-label="Aadhaar Card Number"
                />
              </div>
            </div>
            <br />
            <div className="col-auto">
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
