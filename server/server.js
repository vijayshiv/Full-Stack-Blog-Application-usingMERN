const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const PORT = 4000;

app.use(cors());
app.use(morgan("tiny"));
app.use(express.json());

const userRouter = require("./routes/users");
app.use("/user", userRouter);

const postRouter = require("./routes/posts");
app.use("/posts", postRouter);

// Serve static images from the 'images' folder
app.use("/images", express.static(path.join(__dirname, "images")));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started on PORT : ${PORT}`);
});
