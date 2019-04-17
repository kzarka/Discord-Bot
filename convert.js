const data = require("./data/dependencies/war/members.json");
const membersModel = require("./core/sqllite/members.js");
for(let x in data) {
	data[x].userId = x;
	membersModel.insert(data[x]);
}
console.log(data);
