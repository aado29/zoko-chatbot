import express from "express";
import bodyParser from "body-parser";
import apiRoutes from "./routes/apiRoutes";
import { PORT } from "./constants";

const app = express();

app.use(express.json());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
  });
});

app.use("/api", apiRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
