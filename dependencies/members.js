const Discord = require('discord.js');
const config = require("../config/config.json");
const fs = require("fs");
const membersModel = require("../core/sqllite/members.js");
const helper = require("../helper/war.js");
const roleHelper = require("../helper/roles.js");


const datDirWar = '/data/dependencies/war';
const datDir = '/data/dependencies/members';

const classString = require(`..${datDir}/classes.json`);

const memberChannel = "gear-verification"
const warVoteChannel = 'war-attendance';

// validate constant
const nameMaxLength = 16;
const nameMinLength = 3;

module.exports = function(client){

    try {
        var channelWar = client.channels.find(x => x.name === warVoteChannel);
    } catch(e) {
        console.log(e)
    }

    client.on('message', async message => {
    	if(message.channel.name != memberChannel) return;
    	if(message.author.bot) return;
    	let className = matchClass(message);
        if(!className) {
            message.channel.send('Sai cú pháp, nhập: `Tên_Class Family Main_Char Level AP AWK DP` để cập nhật thông tin ');
            return;
        }

        let params = message.content.trim().replace(/\s\s+/g, ' ').split(' ');
        let member = {};
        if(!params[1]) {
            message.channel.send('Sai cú pháp, nhập: `Tên_Class Family Main_Char Level AP AWK DP` để cập nhật thông tin ');
            return;
        }
        if(params[1].length < nameMinLength) {
            message.channel.send('Tên Family quá ngắn, tối thiểu 3 ký tự');
            return;
        }
        if(params[1].length > nameMaxLength) {
            message.channel.send('Tên Family quá dài, tối đa 16 ký tự!');
            return;
        }
        member.class = className;
        member.family = capitalizeFirstLetter(params[1]);
        member.character = capitalizeFirstLetter(params[2]) || null;
        member.level = params[3] || null;
        member.ap = params[4] || null;
        member.awk = params[5] || null;
        member.dp = params[6] || null;
        // validate for optional param
        if(member.character != null && (member.character.length <= nameMinLength)) {
            message.channel.send('Tên Character quá ngắn, tối thiểu 3 ký tự');
            return;
        }
        if(member.character != null && (member.character.length > nameMaxLength)) {
            message.channel.send('Tên Character quá dài, tối đa 16 ký tự!');
            return;
        }
        // validate AP
        if(member.ap != null && isNaN(member.ap)) {
            message.channel.send('Attack Power AP phải là số, từ 0-350!');
            return;
        }

        if(member.ap != null && (member.ap > 350 || member.ap < 0)) {
            message.channel.send('Attack Power AP phải là số, từ 0-350!');
            return;
        }
        // validate AWK
        if(member.awk != null && isNaN(member.awk)) {
            message.channel.send('Awaken Attack Power phải là số, từ 0-350!');
            return;
        }

        if(member.awk != null && (member.awk > 350 || member.awk < 0)) {
            message.channel.send('Awaken Attack Power phải là số, từ 0-350!');
            return;
        }
        // validate DP
        if(member.dp != null && isNaN(member.dp)) {
            message.channel.send('Defense Power AP phải là số, từ 0-350!');
            return;
        }

        if(member.dp != null && (member.dp > 350 || member.dp < 0)) {
            message.channel.send('Defense Power DP phải là số, từ 0-350!');
            return;
        }
        // validate Level
        if(member.level != null && isNaN(member.level)) {
            message.channel.send('Level phải là số, từ 0-64!');
            return;
        }

        if(member.level != null && (member.level > 64 || member.level < 0)) {
            message.channel.send('Level phải là số, từ 0-64!');
            return;
        }

        if(!client.members) {
            client.members = {};
        }

        client.members[message.author.id] = member;
        member.userId = message.author.id;
        membersModel.insert(member);
        message.channel.send('Thông tin của bạn đã được lưu lại!\n'
            + '```' + `Family/Character: ${member.family}/${member.character || '???'}\nClass: ${member.class}  Level: ${member.level || '???'}\n`
            + `AP/AWK/DP: ${member.ap || '???'}/${member.awk || '???'}/${member.dp || '???'}` + '```'
        );
        roleHelper.reAsignRole(message, member.class);
        helper.reloadTopMessage(channelWar, client);
        return;
    });

}

function matchClass(message) {
    let questions = "";
    let content = message.content.trim().toLowerCase();

    questions = classString.class.witch.split(',');
    for(x in questions) {
        if(content.indexOf(questions[x]) == 0) {
            return 'Witch';
        }
    }

    questions = classString.class.wizard.split(',');
    for(x in questions) {
        if(content.indexOf(questions[x]) == 0) {
            return 'Wizard';
        }
    }

    questions = classString.class.valkyrie.split(',');
    for(x in questions) {
        if(content.indexOf(questions[x]) == 0) {
            return 'Valkyrie';
        }
    }

    questions = classString.class.warrior.split(',');
    for(x in questions) {
        if(content.indexOf(questions[x]) == 0) {
            return 'Warrior';
        }
    }

    questions = classString.class.berserker.split(',');
    for(x in questions) {
        if(content.indexOf(questions[x]) == 0) {
            return 'Berserker';
        }
    }

    questions = classString.class.ranger.split(',');
    for(x in questions) {
        if(content.indexOf(questions[x]) == 0) {
            return 'Ranger';
        }
    }

    questions = classString.class.musa.split(',');
    for(x in questions) {
        if(content.indexOf(questions[x]) == 0) {
            return 'Musa';
        }
    }

    questions = classString.class.maehwa.split(',');
    for(x in questions) {
        if(content.indexOf(questions[x]) == 0) {
            return 'Maehwa';
        }
    }

    questions = classString.class.sorceress.split(',');
    for(x in questions) {
        if(content.indexOf(questions[x]) == 0) {
            return 'Sorceress';
        }
    }

    questions = classString.class.tamer.split(',');
    for(x in questions) {
        if(content.indexOf(questions[x]) == 0) {
            return 'Tamer';
        }
    }

    questions = classString.class.kunoichi.split(',');
    for(x in questions) {
        if(content.indexOf(questions[x]) == 0) {
            return 'Kunoichi';
        }
    }

    questions = classString.class.ninja.split(',');
    for(x in questions) {
        if(content.indexOf(questions[x]) == 0) {
            return 'Ninja';
        }
    }

    questions = classString.class.dk.split(',');
    for(x in questions) {
        if(content.indexOf(questions[x]) == 0) {
            return 'Dark Knight';
        }
    }

    questions = classString.class.mystic.split(',');
    for(x in questions) {
        if(content.indexOf(questions[x]) == 0) {
            return 'Mystic';
        }
    }

    questions = classString.class.striker.split(',');
    for(x in questions) {
        if(content.indexOf(questions[x]) == 0) {
            return 'Striker';
        }
    }

    questions = classString.class.archer.split(',');
    for(x in questions) {
        if(content.indexOf(questions[x]) == 0) {
            return 'Archer';
        }
    }

    questions = classString.class.lahn.split(',');
    for(x in questions) {
        if(content.indexOf(questions[x]) == 0) {
            return 'Lahn';
        }
    }

    questions = classString.class.shai.split(',');
    for(x in questions) {
        if(content.indexOf(questions[x]) == 0) {
            return 'Shai';
        }
    }

    return false;
}

function capitalizeFirstLetter(string) {
    if(!string) return null;
    return string.charAt(0).toUpperCase() + string.slice(1);
}