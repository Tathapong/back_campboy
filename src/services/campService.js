const db = require("../models/index");
const { Op } = require("sequelize");

function deleteDuplicateItem(list) {
  const set = new Set(list);
  return Array.from(set);
}

exports.createFilterWhere = function (list, column) {
  return {
    [Op.or]: list.map((item) => {
      return { [column]: +item };
    })
  };
};

exports.createFilterHaving = function (list, columnName) {
  return db.sequelize.where(db.sequelize.fn("COUNT", db.sequelize.col(columnName)), list?.length);
};

exports.convertToIdList = async function ({ model, where = {}, group = "", having = {}, columnName }) {
  const camp = await model.findAll({
    where: where,
    group: group,
    having: having
  });
  const campList = camp.map((item) => item[columnName]);
  return deleteDuplicateItem(campList);
};

exports.findMatchId = function (...list) {
  const minListIndex = list.reduce((acc, item, index, arr) => {
    if (item.length < arr[acc].length) {
      return index;
    } else {
      return 0;
    }
  }, 0);

  return list[minListIndex].filter((minItem, minIndex) => {
    return list.reduce((acc, item, index, arr) => {
      if (item.includes(minItem)) return acc && true;
      else return acc && false;
    }, true);
  });
};
