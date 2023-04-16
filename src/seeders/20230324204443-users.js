"use strict";
require("dotenv").config();
const axios = require("axios");
const cloudinary = require("../utilities/cloudinary");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const profile = await cloudinary.resources({ type: "upload", max_results: 50, prefix: "Campboy/users/profile/" });
    const cover = await cloudinary.resources({ type: "upload", max_results: 50, prefix: "Campboy/users/cover/" });
    const profileImage = profile.resources;
    const coverImage = cover.resources;

    const res = await axios.get("https://jsonplaceholder.typicode.com/users");
    const users = res.data;

    const data = users.map((item, index) => {
      return {
        id: item.id,
        first_name: item.name.split(" ")[0],
        last_name: item.name.split(" ")[1],
        email: item.email,
        mobile: item.phone,
        profile_image: profileImage[index].secure_url,
        cover_image: coverImage[index].secure_url,
        created_at: new Date(),
        updated_at: new Date()
      };
    });
    return queryInterface.bulkInsert("users", data);
  },

  async down(queryInterface, Sequelize) {
    // return queryInterface.bulkDelete("information_items", null, {});
  }
};
