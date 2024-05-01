import email from "../components/assets/email.jpeg";
import name from "../components/assets/name.png";
import password from "../components/assets/password.png";
import adhaar from "../components/assets/adhaar.png";
import phone from "../components/assets/phone.png";

export default function Register() {
  return (
    <>
      <div className="container">
        <div className="header">
          <div className="text">Registration</div>
          <div className="underline"></div>
        </div>
        <div className="inputs">
          <div className="input">
            <img src={name} alt="" height={14} width={12} />
            <label htmlFor="">Name</label>
            <input type="text" />
          </div>
          <div className="input">
            <img src={email} alt="" height={14} width={12} />
            <label htmlFor="">Email</label>
            <input type="text" />
          </div>
          <div className="input">
            <img src={password} alt="" height={14} width={12} />
            <label htmlFor="">Password</label>
            <input type="text" />
          </div>
          <div className="input">
            <img src={password} alt="" height={14} width={12} />
            <label htmlFor="">Confirm Password</label>
            <input type="text" />
          </div>
          <div className="input">
            <img src={phone} alt="" height={14} width={12} />
            <label htmlFor="">Phone Number</label>
            <input type="text" />
          </div>
          <div className="input">
            <img src={adhaar} alt="" height={14} width={12} />
            <label htmlFor="">Aadhaar Number</label>
            <input type="text" />
          </div>
          <div className="submit-container">
            <div className="submit">Sign Up</div>
          </div>
        </div>
      </div>
    </>
  );
}
