exports.up = function(knex, Promise) {
  return knex.schema.createTable("GK", tbl => {
    tbl
      .integer("id")
      .primary()
      .unique()
      .notNullable();

    tbl.integer("score").notNullable();
    tbl.integer("rank").notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("GK");
};
