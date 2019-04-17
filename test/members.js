const sqlite3 = require('sqlite3').verbose();
 
// open the database
let db = new sqlite3.Database('./bot.db');
 
var members = {};

function init() {
	const sql = `
    CREATE TABLE IF NOT EXISTS members (
      	id STRING PRIMARY KEY,
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
}
/* Insert new record, or update exist one */
function insert(data = []) {
	var sql = `INSERT INTO members (id, family, character, class, ap, awk, dp)
    	VALUES ('${data.id}', '${data.family}', '${data.character}', '${data.class || null}', 
    	${data.ap || null}, ${data.awk || null}, ${data.dp || null})`;

    db.run(sql, [], (err) => {
	  	if (err && err.message.indexOf('SQLITE_CONSTRAINT') ==0) {
	    	sql = `UPDATE members
      			SET family = '${data.family}',
		        character = '${data.character || null}',
		        class = '${data.class || null}',
		        ap = '${data.ap || null}',
		        awk = '${data.awk || null}',
		        dp = '${data.dp || null}'
		      	WHERE id =  '${data.id}'`;
		    db.run(sql, [], (err) => {
		    	if(err) {
		    		console.log(err);
		    	}
		    });  	
	  	}
	});
}
/* Load all record to client */
function loadAll() {
	return new Promise(function(resolve, reject) {
		const sql = `SELECT * FROM members`;
		db.all(sql, [], (err, rows) => {
			if (err) {
				console.log(err);
				reject(err);
				return;
			}
			console.log('record');
			//console.log(rows);
			let items = {};
			for(let x in rows) {
				items[rows[x].id] = {
					"family": rows[x].family,
					"character": rows[x].character || null,
					"class": rows[x].class || null,
					"ap": rows[x].ap || null,
					"awk": rows[x].awk || null,
					"dp": rows[x].dp || null
				}
			}
			resolve(items);
		});
	});
}

async function  test() {
	let row = await loadAll();
	console.log(row);
	return row;
}
test();