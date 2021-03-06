const sqlite3 = require('sqlite3').verbose();
 
// open the database
let db = new sqlite3.Database('./data/sql/bot.db');
const guildsModel = require("./core/sqllite/guilds.js");
const sql = `
CREATE TABLE IF NOT EXISTS members (
  	id INTEGER PRIMARY KEY AUTOINCREMENT,
	level INTEGER,
  	userId TEXT,
  	family TEXT,
  	character TEXT,
  	class TEXT,
  	ap INTEGER DEFAULT 0,
  	awk INTEGER DEFAULT 0,
  	dp INTEGER DEFAULT 0)`;
	// init table if not exist
db.run(sql, [], (err) => {
  	if (err) {
    	throw err;
    	console.log(err);
  	}
});

guildsModel.init();