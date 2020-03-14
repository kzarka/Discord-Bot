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
	      	welcome_enable TEXT DEFAULT 0,
	      	welcome_channel TEXT DEFAULT 0,
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
guilds.insert = async function(client, data = []) {
	return new Promise(async function(resolve, reject) {
		var sql = `INSERT INTO guilds (guild_id, main_channel, join_date)
	    	VALUES ('${data.guild_id}', '${data.main_channel}', '${Date.now()}')`;

	    db.run(sql, [], async (err) => {
	    	console.log(err);
		  	if (err && err.message.indexOf('SQLITE_CONSTRAINT') ==0) {
		    	sql = `UPDATE guilds
	      			SET join_date = '${Date.now()}',
	      			main_channel = '${data.main_channel}'
			      	WHERE guild_id =  '${data.guild_id}'`;
			    db.run(sql, [], async (err) => {
			    	if(err) {
			    		console.log(err);
			    		resolve(false);
			    		return;
			    	}
			    	console.log('ABC');
			    });  	
		  	}
		});
		client.guildsData = await guilds.loadAll();
		resolve(true);
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
					"welcome_channel": rows[x].welcome_channel || null,
					"welcome_enable": rows[x].welcome_enable || null,
					"join_date": rows[x].join_date || null

				}
			}
			resolve(items);
		});
	});
}

guilds.update = async function(client, guildId, data) {
	return new Promise(async function(resolve, reject) {
		var sql = `UPDATE guilds SET`;
		for(let index in data) {
			sql += ` ${index} = "${data[index]}",`;
		}
		sql = sql.slice(0, -1);
		sql += ` WHERE guild_id =  '${guildId}'`;
		db.run(sql, [], async (err) => {
		  	if (err) {
		    	throw err;
		    	console.log(err);
		    	resolve(err);
		    	return;
		  	}
		  	client.guildsData = await guilds.loadAll();
		  	resolve(true);
		});
	});
}

guilds.sync = async function(client) {
	return new Promise(async function(resolve, reject) {
		try {
			client.guilds.forEach(guild => {
				let main_channel = 0;
				if(client.guildsData[guild.id] && client.guildsData[guild.id].main_channel) {
					main_channel = client.guildsData[guild.id].main_channel;
				}
				let data = {
					main_channel: main_channel,
					guild_id: guild.id
				}
				guilds.insert(client, data);
			});
		} catch (e) {
			console.log(e);
			resolve(e);
			return;
		}

		client.guildsData = await guilds.loadAll();
		resolve(true);
	});
}

module.exports = guilds;
 
//db.close();