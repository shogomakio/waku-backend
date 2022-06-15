module.exports.table = Object.freeze({
  video: {
    name: "video",
    col: {
      id: "id",
      code: "code",
      title: "title",
      folder: "folder",
      filename: "filename",
      full_path: "full_path",
      thumbnail: "thumbnail",
      part: "part",
      year: "year",
      favorite: "favorite",
    },
  },
  videoCategory: {
    name: "video_category",
    col: {
      id: "id",
      categoryId: "category_id",
      videoId: "video_id",
    },
  },
  category: {
    name: "category",
    col: {
      id: "id",
      category: "category",
    },
  },
  limit: 20,
});
