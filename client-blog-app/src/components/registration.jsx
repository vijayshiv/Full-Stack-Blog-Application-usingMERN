import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");

  const sendData = async () => {
    console.log("Sending data:", {
      firstName,
      lastName,
      email,
      password,
      phone,
    });
    const body = { firstName, lastName, email, password, phone };
    try {
      const res = await axios.post("http://localhost:4000/user/register", body);
      console.log("Response:", res.data);
      if (res.data.status === "success") {
        console.log("Registration successful");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  return (
    <>
      <div>
        <div className="row">
          <div className="col-4"></div>
          <div
            className="col-4"
            style={{
              marginTop: 50,
              borderRadius: 20,
              border: "2px solid grey",
              boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.3)",
              padding: 30,
            }}
          >
            <div className="form">
              <div className="col-md-12 text-center">
                <h1>Sign up</h1>
              </div>
              <br />
              <div className="row">
                <div className="col">
                  <div>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="First Name"
                      onChange={(e) => {
                        setFirstName(e.target.value);
                      }}
                    />
                  </div>
                </div>
                <div className="col">
                  <div>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Last Name"
                      onChange={(e) => {
                        setLastName(e.target.value);
                      }}
                    />
                  </div>
                  <br />
                </div>
                <div>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Email"
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                  />
                  <br />
                </div>
                <div>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                  />
                  <br />
                </div>
                <div>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Confirm Password"
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                    }}
                  />
                  <br />
                </div>
                <div>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Phone Number"
                    onChange={(e) => {
                      setPhone(e.target.value);
                    }}
                  />
                  <br />
                </div>
                <div>
                  <button
                    className="btn btn-primary btn-lg d-block mx-auto"
                    onClick={sendData}
                  >
                    Sign up
                  </button>
                </div>
              </div>
            </div>
            <div className="col-4"></div>
          </div>
        </div>
      </div>
    </>
  );
}
