import express from "express";
import attachRoutes from "./routes";

const SERVER_PORT = 3000;

const app = express();

attachRoutes(app);

app.listen(SERVER_PORT, () => {
  console.log(`server started at localhost:${SERVER_PORT}`);
});

export default app;
