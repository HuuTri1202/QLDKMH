const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use("/view", express.static(path.join(__dirname, "view")));
app.use(express.static(path.join(__dirname, "view", "public")));

// connect MongoDB
mongoose
  .connect(
    "mongodb+srv://qldkmh_db_user:nOxCJf4m1xHMXmOZ@qldkmh.9t9ql4q.mongodb.net/QLDKMH",
  )
  .then(() => console.log("✅ Connected MongoDB Atlas"))
  .catch((err) => console.log(err));

// route
const courseRoute = require("./route/courseRoute");
const enrollmentRoute = require("./route/enrollmentRoute");
const studentRoutes = require("./route/studentRoute");

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "view", "./public/trangchu.html"));
});

app.use("/courses", courseRoute);
app.use("/students", studentRoutes);
app.use("/enrollments", enrollmentRoute);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
