exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex("players")
    .del()
    .then(function() {
      const csvFilePath = "PlayerInfo.csv";
      const csv = require("csvtojson");
      csv()
        .fromFile(csvFilePath)
        .then(jsonObj => {
          return knex("players").insert(jsonObj);
        });
    });
};
