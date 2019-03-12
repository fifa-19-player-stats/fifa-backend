exports.up = function(knex, Promise) {
  return knex.schema.createTable("players", tbl => {
    tbl.increments();

    //tbl.integer("playerId").notNullable();
    tbl.string("name").notNullable();
    tbl.integer("age").notNullable();
    tbl.string("photo").notNullable();
    tbl.string("nationality").notNullable();
    tbl.string("flag").notNullable();
    tbl.integer("overall").notNullable();
    tbl.integer("potential").notNullable();
    tbl.string("club").notNullable();
    tbl.string("clubLogo").notNullable();
    tbl.string("value").notNullable();
    tbl.string("wage").notNullable();
    tbl.integer("special").notNullable();
    tbl.string("preferredFoot");
    tbl.string("internationalReputation");
    tbl.float("weakFoot", 1).notNullable();
    tbl.float("skillMoves", 1).notNullable();
    tbl.string("workRate").notNullable();
    tbl.string("bodyType").notNullable();
    tbl.string("realFace").notNullable();
    tbl.string("position");
    tbl.string("jerseyNumber").notNullable();
    tbl.string("joined");
    tbl.string("loanedFrom");
    tbl.integer("contractValidUntil");
    tbl.string("height").notNullable();
    tbl.string("weight").notNullable();
    tbl.string("releaseClause").notNullable();
    tbl.string("valueCurr").notNullable();
    tbl.string("valueAmt").notNullable();
    tbl.string("valueUnit").notNullable();
    tbl.string("wageCurr").notNullable();
    tbl.string("wageAmt").notNullable();
    tbl.string("wageUnit").notNullable();
    tbl.string("releaseClauseCurr").notNullable();
    tbl.string("releaseClauseAmt").notNullable();
    tbl.string("releaseClauseUnit").notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("players");
};
