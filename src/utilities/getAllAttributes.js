module.exports = getAllAttribute = async (model, attribute = "id") => {
  try {
    const attrList = await model.findAll({ attributes: [attribute] });
    return attrList.map((item) => item[attribute]);
  } catch (error) {
    throw error;
  }
};
