require("dotenv").config();

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require('cors');
const corsConfig = require("./config/cors");

const port = process.env.PORT;

const lidRouter = require("./routes/lid");
const rondjeRouter = require("./routes/rondje");
const clubRouter = require("./routes/club");

const app = express();
app.use(cors(corsConfig));


app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/lid", lidRouter);
app.use("/rondje", rondjeRouter);
app.use("/club", clubRouter);

module.exports = app;


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });