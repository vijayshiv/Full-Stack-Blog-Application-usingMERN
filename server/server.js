const express = require("express");
const app = express();
const cors = require("cors");

const PORT = 4000;

app.use(cors());
app.use(express.json());

const userRouter = require("./routes/users");
app.use("/user", userRouter);

const postRouter = require("./routes/posts");
app.use("/posts", postRouter);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started on PORT : ${PORT}`);
});
