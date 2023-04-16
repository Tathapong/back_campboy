"use strict";
const informationItem = require("../assets/data/informationItem.json");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const data = [];

    for (let i = 0; i < informationItem.datas.length; i++) {
      data.push({
        type: informationItem.datas[i].type.toLowerCase(),
        title: informationItem.datas[i].title,
        icon_image: informationItem.datas[i].icon_image,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    // return queryInterface.bulkInsert("information_items", data);
  },

  async down(queryInterface, Sequelize) {
    // return queryInterface.bulkDelete("information_items", null, {});
  }
};
