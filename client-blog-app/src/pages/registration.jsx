export default function Registration() {
  return (
    <section>
      <main>
        <div className="section-registration">
          <div className="container registration-container">
            {/* Image */}
            <div className="registration-image">
              {/* Use the relative path to the image */}
              <img
                src="../images/image.jpg"
                alt="Registration"
                width="600"
                height="600"
              />
            </div>
            {/* Registration Form*/}
            <div className="registration-form">
              <h1 className="main-heading mb-3">Registration Form</h1>
              <form action="">
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" autoComplete="off" required />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirm-password">Confirm Password</label>
                  <input
                    type="password"
                    id="confirm-password"
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirm-password">Phone Number</label>
                  <input
                    type="text"
                    id="confirm-password"
                    autoComplete="off"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Register
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </section>
  );
}
