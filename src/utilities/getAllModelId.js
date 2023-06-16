exports.getAllId = async (model) => {
  try {
    const idList = await model.findAll({ attributes: ["id"] });
    return idList.map((item) => item.id);
  } catch (error) {
    throw error;
  }
};
