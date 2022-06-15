const express = require("express");
const {
  getVideos,
  getVideoCount,
  updateVideoView,
  // updateVideo,
} = require("./query/videoQuery");
const app = express(); //express のインスタンス
require("dotenv").config();
const port = process.env.PORT; // listenするport番号
const VideoLogic = require("./logic/video");
const CategoryLogic = require("./logic/category");

// jsonの受け取り
app.use(express.json());

// cors対策
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3001");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTION"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.get("/", async (req, res) => {
  res.send("DONE");
});

// postの処理
app.post("/", (req, res) => {
  try {
    res.json(req.body); // jsonで返却
  } catch (error) {
    console.error(error);
  }
});

app.get("/update/directory", async (req, res) => {
  const startTime = new Date().getTime();
  await VideoLogic.createVideosInfo();
  const endTime = new Date().getTime();
  console.log("time exceeded in sec:", (endTime - startTime) / 1000);
  res.send("directory updated");
});

app.get("/video/get/all", async (req, res) => {
  const videoList = await getVideos(req.query.limit, req.query.page);
  console.log("videos fetched");
  res.send(videoList);
});

app.get("/video/count", async (req, res) => {
  const count = await getVideoCount();
  console.log("videos count fetched");
  res.send(count);
});

app.get("/thumbnails/refresh", async (req, res, next) => {
  console.log("Loading...");
  VideoLogic.refreshThumbnails();
  console.log("thumbnails function called");
  res.send("DONE");
});

app.post("/thumbnail/generate", async (req, res, next) => {
  console.log("generate thumbnail");
  VideoLogic.generateThumbnailByVideo(req.body.video, req.body.timestamps);
  console.log("thumbnail function called");
  res.send("DONE");
});

app.get("/clear/garbage", async (req, res) => {
  VideoLogic.cleanGarbageFiles();
  res.send("directory cleaner called");
});

app.post("/video/update/", (req, res, next) => {
  VideoLogic.updateVideo(req.body.video, req.body.categories || null);
  console.log("video id: {%d} updated", req.body.id);
  res.send("OK");
});

app.post("/video/update/view_count", (req, res) => {
  updateVideoView(req.body.id);
  console.log("video id: %d view count updated", req.body.id);
  res.send("OK");
});

app.post("/video/update/favorite", (req, res) => {
  VideoLogic.updateFavorite(req.body.id);
  console.log("video favorite updated id: %d", req.body.id);
  res.send("OK");
});

app.get("/video/search", async (req, res) => {
  const result = await VideoLogic.searchByCategory(
    req.query.search,
    req.query.categories || null
  );
  console.log("/video/search search term:", req.query.search);
  console.log("/video/search categories:", req.query.categories);
  res.send(result);
});

app.get("/category/load", async (req, res) => {
  const result = await VideoLogic.getCategories();
  console.log("categories loaded");
  res.send(result);
});

app.get("/video/category/load", async (req, res) => {
  const result = await VideoLogic.getVideoCategories(req.query.id);
  console.log("video categories loaded");
  res.send(result);
});

app.post("/category/create", async (req, res) => {
  const result = await CategoryLogic.createCategory(req.body.category);
  console.log("category created", result);
  res.send(result);
});

app.put("/category/update", async (req, res) => {
  const result = await CategoryLogic.updateCategory(req.body.id, req.body.category);
  console.log("category updated", result);
  res.send(result);
});

app.delete("/category/delete", async (req, res) => {
  const result = await CategoryLogic.deleteCategory(req.body.id);
  console.log("category deleted", result);
  res.send(result);
});

app.listen(port, () => {
  console.log(`Nikholaidis-Waku app listening on port ${port}`);
});
