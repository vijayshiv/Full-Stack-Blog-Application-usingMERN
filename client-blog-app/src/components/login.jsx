export default function LoginUser() {
  return (
    <>
      <div>
        <div className="row">
          <div className="col"></div>
          <div className="col">
            <div>
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
              </div>
            </div>
          </div>
          <div className="col"></div>
        </div>
      </div>
    </>
  );
}
