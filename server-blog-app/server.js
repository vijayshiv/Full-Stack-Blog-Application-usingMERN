const express = require("express");
const cors = require("cors");
const port = 4000;

const app = express();
app.use(express.json());
app.use(cors());

const userRouter = require("./routes/user");
app.use("/user", userRouter);

app.listen(port, `0.0.0.0`, (req, res) => {
  console.log(`Server is running on PORT : ${port}`);
});
