require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
require("./models/StudentModel");
require("./models/CourseModel");
const routes = require("./routes");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", routes);

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    const port = Number(process.env.PORT || 3000);
    app.listen(port, () => console.log(`✅ API: http://localhost:${port}`));
  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
}

start();