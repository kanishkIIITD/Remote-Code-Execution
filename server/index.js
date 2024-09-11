const express = require("express");
const app = express();
const database = require("./config/database");
const cors = require("cors");
require("dotenv").config();

const routes = require("./routes/routes");

app.use(express.json());

const PORT = process.env.PORT || 5000;

database.connectDB();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use("/api/v1", routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
