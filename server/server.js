const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const config = require("./config");
const jwt = require("jsonwebtoken");
const path = require("path");
const utils = require("./utils");

const PORT = 4000;

app.use(cors("*"));
app.use(morgan("tiny"));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`Incoming request to ${req.url}`);
  if (
    req.url === "/user/check-email" ||
    req.url === "/user/login" ||
    req.url === "/user/register" ||
    req.url === "/user/forgot-password" || // Add this line
    req.url === "/user/reset-password" || // Add this line
    req.url === "/posts/all" ||
    req.url.startsWith("/posts/post/") ||
    req.url.startsWith("/posts/search") ||
    req.url.startsWith("/posts/by-category/") ||
    req.url.startsWith("/posts/likes/") ||
    req.url.startsWith("/posts/comments/") ||
    req.url.startsWith("/images/")
  ) {
    next();
  } else {
    const token = req.headers["token"];
    if (!token || token.length == 0) {
      res.send(utils.errorMessage("Missing Token"));
    } else {
      try {
        const payload = jwt.verify(token, config.secretKey);
        req.user = payload; // Fix the assignment here
        next();
      } catch (ex) {
        res.send(utils.errorMessage("Invalid Token"));
      }
    }
  }
});

const userRouter = require("./routes/users");
app.use("/user", userRouter);

const postRouter = require("./routes/posts");
app.use("/posts", postRouter);

// Serve static images from the 'images' folder
app.use("/images", express.static(path.join(__dirname, "images")));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.send(utils.errorMessage("Internal Server Error"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started on PORT : ${PORT}`);
});
