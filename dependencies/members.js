const Discord = require('discord.js');
const config = require("../config/config.json");
const fs = require("fs");
const membersModel = require("../core/sqllite/members.js");
const helper = require("../helper/war.js");


const datDirWar = '/data/dependencies/war';
const datDir = '/data/dependencies/members';

const classString = require(`..${datDir}/classes.json`);

const memberChannel = "gear-verification"
const warVoteChannel = 'war-attendance';

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
            message.channel.send('Sai cú pháp, nhập: `Tên_Class Family Main_Char AP AWK DP` để cập nhật thông tin ');
            return;
        }

        let params = message.content.trim().replace(/\s\s+/g, ' ').split(' ');
        let member = {};
        if(!params[1]) {
            message.channel.send('Sai cú pháp, nhập: `Tên_Class Family Main_Char AP AWK DP` để cập nhật thông tin ');
            return;
        }
        if(params[1].length <= 3) {
            message.channel.send('Tên Family quá ngắn');
            return;
        }
        member.class = className;
        member.family = capitalizeFirstLetter(params[1]);
        member.character = capitalizeFirstLetter(params[2]) || null;
        member.ap = params[3] || null;
        member.awk = params[4] || null;
        member.dp = params[5] || null;
        if(!client.war.members) {
            client.war.members = {};
        }

        client.war.members[message.author.id] = member;
        member.userId = message.author.id;
        membersModel.insert(member);
        message.channel.send('Thông tin của bạn đã được lưu lại!\n'
            + '```' + `Family/Character: ${member.family}/${member.character || '???'}\nClass: ${member.class}\n`
            + `AP/AWK/DP: ${member.ap || '???'}/${member.awk || '???'}/${member.dp || '???'}` + '```'
        );
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

    return false;
}

function capitalizeFirstLetter(string) {
    if(!string) return null;
    return string.charAt(0).toUpperCase() + string.slice(1);
}