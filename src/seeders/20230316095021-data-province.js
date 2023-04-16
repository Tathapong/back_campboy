"use strict";
const provinces = require("../assets/data/province.json");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const data = [];

    for (let i = 0; i < provinces.datas.length; i++) {
      data.push({
        name: provinces.datas[i].name_en.split(" ").join("").toUpperCase(),
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    // return queryInterface.bulkInsert("provinces", data);
  },

  async down(queryInterface, Sequelize) {
    // return queryInterface.bulkDelete("provinces", null, {});
  }
};
