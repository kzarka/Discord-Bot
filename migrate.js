const sqlite3 = require('sqlite3').verbose();
 
// open the database
let db = new sqlite3.Database('./data/sql/bot.db');
const sql = `
CREATE TABLE IF NOT EXISTS guilds2 (
id INTEGER PRIMARY KEY AUTOINCREMENT,
main_channel TEXT DEFAULT 0,
guild_id TEXT,
welcome_message TEXT DEFAULT null,
welcome_enable TEXT DEFAULT 0,
welcome_channel TEXT DEFAULT 0,
join_date TEXT DEFAULT 0
)`;

const migrate = `
insert into guilds2
(id, main_channel, guild_id)

SELECT id, main_channel, guild_id FROM guilds;
`;

const reinit = 'DROP TABLE guilds;';

const rename = 'ALTER TABLE guilds2 RENAME TO guilds;';

db.run(sql, [], (err) => {
    if (err) {
      throw err;
      console.log(err);
    }
});
