const categoryQuery = require("../query/categoryQuery");

module.exports.createCategory = async (category) => {
  try {
    const existCategory = await categoryQuery.existCategory(category);
    if (existCategory) {
      return { exist: true };
    }
    const result = await categoryQuery.createCategory(category);
    return result;
  } catch (error) {
    console.log("CREATE CATEGORY ERROR:", error);
  }
};

module.exports.updateCategory = async (id, category) => {
  try {
    const result = await categoryQuery.updateCategory(id, category);
    return result;
  } catch (error) {
    console.log("UPDATE CATEGORY ERROR:", error);
  }
};

module.exports.deleteCategory = async (id) => {
  try {
    const result = await categoryQuery.deleteCategory(id);
    return result;
  } catch (error) {
    console.log("DELETE CATEGORY ERROR:", error);
  }
};
