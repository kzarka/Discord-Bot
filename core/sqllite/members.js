const sqlite3 = require('sqlite3').verbose();
 
// open the database
let db = new sqlite3.Database('./data/sql/bot.db');
 
var members = {};

members.init = function() {
	const sql = `
    CREATE TABLE IF NOT EXISTS guild_members (
      	id INTEGER PRIMARY KEY AUTOINCREMENT,
      	level INTEGER,
      	userId TEXT,
      	family TEXT,
      	character TEXT,
      	class TEXT,
      	ap INTEGER DEFAULT 0,
      	awk INTEGER DEFAULT 0,
      	dp INTEGER DEFAULT 0,
      	guild_id TEXT)`;
		// init table if not exist
	db.run(sql, [], (err) => {
	  	if (err) {
	    	throw err;
	    	console.log(err);
	  	}
	});
}
/* Insert new record, or update exist one */
members.insert = function(data = []) {
	var sql = `INSERT INTO guild_members (userId, family, character, class, ap, awk, dp, level, guild_id)
    	VALUES ('${data.userId}', '${data.family}', '${data.character}', '${data.class || null}', 
    	${data.ap || null}, ${data.awk || null}, ${data.dp || null}, ${data.level || null}, ${data.guild_id || null})`;

    db.run(sql, [], (err) => {
	  	if (err && err.message.indexOf('SQLITE_CONSTRAINT') ==0) {
	    	sql = `UPDATE guild_members
      			SET family = '${data.family}',
		        character = '${data.character || null}',
		        class = '${data.class || null}',
		        ap = '${data.ap || null}',
		        awk = '${data.awk || null}',
		        dp = '${data.dp || null}',
		        level = '${data.level || null}'
		        guild_id = '${data.guild_id || null}'
		      	WHERE userId =  '${data.userId}'
		      	AND guild_id = '${data.guild_id}'`;
		    db.run(sql, [], (err) => {
		    	if(err) {
		    		console.log(err);
		    	}
		    });  	
	  	}
	});
}
/* Load all record to client */
members.loadAll = function(guildId = null) {
	return new Promise(function(resolve, reject) {
		let sql = `SELECT * FROM guild_members`;
		if(guildId) {
			sql += ` WHERE guild_id = '${guildId}'`;
		}
		db.all(sql, [], (err, rows) => {
			if (err) {
				console.log(err);
				members.init();
				resolve(err);
				return;
			}
			let items = {};
			for(let x in rows) {
				items[rows[x].userId] = {
					"family": rows[x].family,
					"character": rows[x].character || null,
					"class": rows[x].class || null,
					"ap": rows[x].ap || null,
					"awk": rows[x].awk || null,
					"dp": rows[x].dp || null,
					"level": rows[x].level || null,
					"guild_id": rows[x].guild_id || null
				}
			}
			resolve(items);
		});
	});
}

module.exports = members;
 
//db.close();