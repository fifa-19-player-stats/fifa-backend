exports.up = function(knex, Promise) {
  return knex.schema.createTable("similarity", tbl => {
    tbl
      .integer("index")
      .primary()
      .unique()
      .notNullable();

    tbl
      .integer("id")
      .unique()
      .notNullable();
    tbl.string("name").notNullable();
    tbl.string("club").notNullable();
    tbl.string("position");
    tbl.string("similar1");
    tbl.string("similar2");
    tbl.string("similar3");
    tbl.string("similar4");
    tbl.string("similar5");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("similarity");
};
