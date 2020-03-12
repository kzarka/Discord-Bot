const sqlite3 = require('sqlite3').verbose();
 
// open the database
let db = new sqlite3.Database('./data/sql/bot.db');
 
var guilds = {};

guilds.init = function() {
	return new Promise(function(resolve, reject) {
		const sql = `
	    CREATE TABLE IF NOT EXISTS guilds (
	      	id INTEGER PRIMARY KEY AUTOINCREMENT,
	      	main_channel TEXT DEFAULT 0,
	      	guild_id TEXT,
	      	welcome_message TEXT DEFAULT null,
	      	join_date TEXT DEFAULT 0
	      	)`;
			// init table if not exist
		db.run(sql, [], (err) => {
		  	if (err) {
		    	console.log(err);
		    	resolve(err);
		    	return;
		  	}
		  	resolve(true);
		  	return;
		});
	});
}
/* Insert new record, or update exist one */
guilds.insert = function(data = []) {
	return new Promise(function(resolve, reject) {
		var sql = `INSERT INTO guilds (guild_id, join_date)
	    	VALUES ('${data.guild_id}', '${Date.now()}')`;

	    db.run(sql, [], (err) => {
		  	if (err && err.message.indexOf('SQLITE_CONSTRAINT') ==0) {
		    	sql = `UPDATE guilds
	      			SET join_date = '${Date.now()}',
			      	WHERE guild_id =  '${data.guild_id}'`;
			    db.run(sql, [], (err) => {
			    	if(err) {
			    		console.log(err);
			    		resolve(false);
			    		return;
			    	}
			    	resolve(true);
			    });  	
		  	}
		});
	});
}
/* Load all record to client */
guilds.loadAll = function() {
	return new Promise(function(resolve, reject) {
		const sql = `SELECT * FROM guilds`;
		db.all(sql, [], (err, rows) => {
			if (err) {
				console.log(err);
				guilds.init();
				resolve(err);
				return;
			}
			let items = {};
			for(let x in rows) {
				items[rows[x].guild_id] = {
					"main_channel": rows[x].main_channel,
					"welcome_message": rows[x].welcome_message || null,
					"join_date": rows[x].join_date || null
				}
			}
			resolve(items);
		});
	});
}

guilds.update = function(guildId, data) {
	return new Promise(function(resolve, reject) {
		var sql = `UPDATE guilds SET`;
		for(let index in data) {
			sql += ` ${index} = ${data[index]},`;
		}
		sql = sql.slice(0, -1);
		sql += ` WHERE guild_id =  '${guildId}'`;

		db.run(sql, [], (err) => {
		  	if (err) {
		    	throw err;
		    	console.log(err);
		    	resolve(err);
		    	return;
		  	}
		  	resolve(true);
		});
	});
}

guilds.sync = function(client) {
	return new Promise(function(resolve, reject) {
		try {
			guilds.init();
			client.guilds.forEach(guild => {
				let data = {
					guild_id: guild.id
				}
				console.log(data);
				guilds.insert(data);
			});
		} catch (e) {
			console.log(e);
			resolve(e);
			return;
		}

		client.guildsData = guilds.loadAll();
		resolve(true);
	});
}

module.exports = guilds;
 
//db.close();