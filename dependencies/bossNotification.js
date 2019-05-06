const Discord = require('discord.js');
const config = require("../config/config.json");

const datDir = '/data/dependencies/';
const table = require(`..${datDir}boss/table.json`);
const msgStr = require(`..${datDir}boss/message.json`);
/* Load webhook */
//const bossHook = new Discord.WebhookClient(config.bossHook.ID, config.bossHook.token);

/* Global variables */
let sent = true;

module.exports = function(client){
    let helper = client.helper;
    scheduleWarning();
    setTopic();

	client.on('message', async message => {
    	if(message.author.bot) return;
        let ask = matchAsk(message);
        switch (ask) {
            case 'all':
                warnMessage(message);
                break;
            case 'karanda':
                bossListMessage(message, 'Karanda');
                break;
            case 'kzarka':
                bossListMessage(message, 'Kzarka');
                break;
            case 'kutum':
                bossListMessage(message, 'Kutum');
                break;
            case 'nouver':
                bossListMessage(message, 'Nouver');
                break;
            case 'muraka':
                bossListMessage(message, 'Muraka');
                break;
            case 'quint':
                bossListMessage(message, 'Quint');
                break;
            case 'vell':
                bossListMessage(message, 'Vell');
                break;    
            default:
                break;
        }
    	if(message.content.indexOf('boss') != -1) {
            //warnMessage(message.channel);
        }
        if(message.content.indexOf('table') != -1) {
            //getImage();
        }
    });


    /* Get boss list for a specific day or today 
     * @param {Date} date
     * @return {array}
     */
    function getBosses(date = null){
        var now = new Date();
        if(date) {
            now = date;
        }
        var n = now.getDay();
        return table[n];
    }

    /* Get next boss 
     * @return {array}
     */
    function getNextBoss(){
        var now = new Date();
        var n = now.getDay();
        var time = ["0:30", "6:00", "10:00", "14:00", "15:00", "19:00", "23:00"];
        var current = 0;
        var hour = time[current];
        if(now>hourToDay('23:00')) {
            let i = 0;
			let nextDay = n+1;
			if(nextDay > 6) nextDay = 0;
            while(!(table[nextDay][hour])) {
                current = i++;
            }
            hour = time[current];
            let name = table[nextDay][hour];
            return [name, hour, nextDay];
        }
        for(i=0; i<time.length-1; i++) {
            if(now>hourToDay(time[i]) && now<hourToDay(time[i+1])) {
                current = i+1;
            }
        }
        hour = time[current];
        while(!(table[n][hour])) {
            if(current>time.length-1) {
                current = 0;
                n+= 1;
            }
            if(n>6) n = 0;
            hour = time[current++];
        }
        let name = table[n][hour];
        return [name, hour, n];
    }

    /* Convert hour to day 
     * @param hour {string} hh:mm
     * @return Day
     */
    function hourToDay(hour){
        var day = new Date();
        h = parseInt(hour.split(':')[0]);
        m = parseInt(hour.split(':')[1]);
        day.setHours(h);
        day.setMinutes(m);
        return day;
    }

    /* Send list for a boss message */
    function bossListMessage(message, bossName){
        if(message.author.id == '236134764313182208') {
            return message.channel.send("STFU " + message.author + " !");
        }
        var times = getBoss(bossName);
        var msgContent = '';
        var now = new Date();
        var tomorrow = new Date();
        if(times.length == 0) {
            tomorrow.setDate(now.getDate()+1);
            tmrTimes = getBoss(bossName, tomorrow);
            if(tmrTimes.length != 0) {
                return message.channel.send(`**${bossName}** không spawn vào hôm nay, spawn lần kế lúc ${tmrTimes[0]} ngày mai!`);
            }
            tomorrow.setDate(now.getDate()+2);
            tmrTimes = getBoss(bossName, tomorrow);
            if(tmrTimes.length != 0) {
                return message.channel.send(`**${bossName}** không spawn vào hôm nay, spawn lần kế lúc ${tmrTimes[0]} ngày kia!`);
            }
            tomorrow.setDate(now.getDate()+3);
            tmrTimes = getBoss(bossName, tomorrow);
            if(tmrTimes.length != 0) {
                return message.channel.send(`**${bossName}** không spawn vào hôm nay, spawn lần kế lúc ${tmrTimes[0]} ngày kìa!`);
            }
            tomorrow.setDate(now.getDate()+4);
            tmrTimes = getBoss(bossName, tomorrow);
            if(tmrTimes.length != 0) {
                return message.channel.send(`**${bossName}** không spawn vào hôm nay, spawn lần kế lúc ${tmrTimes[0]} 4 ngày nữa!`);
            }
            if(bossName.toLowerCase().indexOf('vell') != 0) {
                return message.channel.send(`**${bossName}** spawn vào lúc ${tmrTimes[0]} Chủ Nhật!`);
            }
            return;
        }
        if(times.length==1) {
            if(now>hourToDay(times[0])) {
                tomorrow = new Date();
                tomorrow.setDate(now.getDate()+1);
                tmrTimes = getBoss(bossName, tomorrow);
                if(tmrTimes.length != 0) {
                    return message.channel.send(`**${bossName}** đã spawn vào ${times[0]}, spawn lần kế lúc ${tmrTimes[0]} ngày mai!`);
                }
                tomorrow.setDate(now.getDate()+2);
                tmrTimes = getBoss(bossName, tomorrow);
                if(tmrTimes.length != 0) {
                    return message.channel.send(`**${bossName}** đã spawn vào ${times[0]}, spawn lần kế lúc ${tmrTimes[0]} ngày kia!`);
                }
                tomorrow.setDate(now.getDate()+3);
                tmrTimes = getBoss(bossName, tomorrow);
                if(tmrTimes.length != 0) {
                    return message.channel.send(`**${bossName}** đã spawn vào ${times[0]}, spawn lần kế lúc ${tmrTimes[0]} ngày kìa!`);
                }
                tomorrow.setDate(now.getDate()+4);
                tmrTimes = getBoss(bossName, tomorrow);
                if(tmrTimes.length != 0) {
                    return message.channel.send(`**${bossName}** đã spawn vào ${times[0]}, spawn lần kế lúc ${tmrTimes[0]} 4 ngày nữa!`);
                }
                if(bossName.toLowerCase().indexOf('vell') != 0) {
                    return message.channel.send(`**${bossName}** spawn vào lúc ${tmrTimes[0]} Chủ Nhật!`);
                }
                return;
            }
            if(now<hourToDay(times[0])) {
                message.channel.send(`**${bossName}** sẽ spawn vào ${times[0]}!`);
                vell(message, bossName);
                return;
            }
        }
        if(times.length>1) {
            if(now>hourToDay(times[times.length-1])) {
                let timeLength = times.length-1;
                tomorrow = new Date();
                tomorrow.setDate(now.getDate()+1);
                tmrTimes = getBoss(bossName, tomorrow);
                if(tmrTimes.length != 0) {
                    return message.channel.send(`**${bossName}** đã spawn vào ${times[timeLength]}, spawn lần kế lúc ${tmrTimes[0]} ngày mai!`);
                }
                tomorrow.setDate(now.getDate()+2);
                tmrTimes = getBoss(bossName, tomorrow);
                if(tmrTimes.length != 0) {
                    return message.channel.send(`**${bossName}** đã spawn vào ${times[timeLength]}, spawn lần kế lúc ${tmrTimes[0]} ngày kia!`);
                }
                tomorrow.setDate(now.getDate()+3);
                tmrTimes = getBoss(bossName, tomorrow);
                if(tmrTimes.length != 0) {
                    return message.channel.send(`**${bossName}** đã spawn vào ${times[timeLength]}, spawn lần kế lúc ${tmrTimes[0]} ngày kìa!`);
                }
                tomorrow.setDate(now.getDate()+4);
                tmrTimes = getBoss(bossName, tomorrow);
                if(tmrTimes.length != 0) {
                    return message.channel.send(`**${bossName}** đã spawn vào ${times[timeLength]}, spawn lần kế lúc ${tmrTimes[0]} 4 ngày nữa!`);
                }
                if(bossName.toLowerCase().indexOf('vell') != 0) {
                    return message.channel.send(`**${bossName}** spawn vào lúc ${tmrTimes[0]} Chủ Nhật!`);
                }
                return;
            }

            if(now<hourToDay(times[0])) {
                message.channel.send(`**${bossName}** sẽ spawn vào ${times[0]}!`);
                vell(message, bossName);
                return;
            }
            var time2 = [];
            for(x in times) {
                if(now<hourToDay(times[x])) {
                    time2.push(times[x]);
                }
            }
            message.channel.send(`**${bossName}** sẽ spawn vào ${time2.join(', ')}!`);
            return;
        }
    }

    /* Send warn message */
    function warnMessage(message, schedule = null, minRemain = 0){
        var bossNames = getNextBoss()[0];
        var hour = getNextBoss()[1];        
        if(schedule) {
            helper.sendMessageToGuilds(`**${bossNames}** sẽ spawn sau ${minRemain} phút!`, client);
        }
        else if(message) {
            if(message.author.id == '236134764313182208') {
                return message.channel.send("STFU " + message.author + " !");
            }
            let information = '';
            if(bossNames.toLowerCase().indexOf('vell') >= 0) {
                information = '\nVell sẽ spawn ở servers Balenos-2, Serendia-2, và Calpheon-2, Heidel-1'
            }
            message.channel.send(`Boss kế tiếp **${bossNames}** vào lúc ${hour}!${information}`, client)
        }
    }

    /* Schedule to send warn messages */
    function scheduleWarning() {
        var hour = getNextBoss()[1];
        var bossNames = getNextBoss()[0];
        var now = new Date();
        now.setSeconds(0);
        var remain = hourToDay(hour) - now;
        var minRemain = Math.floor(remain/60000);
		if (minRemain > 30) {
            setTimeout(scheduleWarning, 6e4);
            return;
        }
        if (minRemain == 5 || minRemain == 10 || minRemain == 15 || minRemain == 30) {
            if(sent) {
                warnMessage(null, true, minRemain);
                sent = false;
            }
        } else sent = true;
        if (minRemain == 5) {
            setTimeout(setTopic, 6*6e4);
        }
        setTimeout(scheduleWarning, 6e4);
    }

    function setTopic() {
        var hour = getNextBoss()[1];
        var bossNames = getNextBoss()[0];
        helper.setGuildsTopic(`👉 Boss kế tiếp **${bossNames}** vào lúc ${hour}! 👌`, client);
    }

    /* Get a Boss time for a specific day */
    function getBoss(bossName, date=null) {
        var todayBoss = getBosses(date);
        var list = [];
        for(time in todayBoss) {
            if(todayBoss[time].indexOf(bossName) != -1) {
                list.push(time);
            }
        }
        return list;
    }

    function convertText(str) {
        str = str.replace(/^\s+|\s+$/g, ''); // trim
        str = str.toLowerCase();

        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
        str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
        str = str.replace(/đ/g,"d");
        //str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g," ");
        str = str.replace(/ + /g," ");
        str = str.trim(); 
        return str;
    }

    /* Match an ask
     * @return {string}
     */
    function matchAsk(message) {
        let msg = convertText(message.content);
        let questions = "";
        // Match boss
        questions = msgStr.ask.nextBoss.split(',');
        for(x in questions) {
            if(msg.indexOf(questions[x]) != -1) {
                return 'all';
            }
        }

        // Match karanda
        questions = msgStr.ask.karanda.split(',');
        for(x in questions) {
            if(msg.indexOf(questions[x]) != -1) {
                return 'karanda';
            }
        }

        // Match kzarka
        questions = msgStr.ask.kzarka.split(',');
        for(x in questions) {
            if(msg.indexOf(questions[x]) != -1) {
                return 'kzarka';
            }
        }

        // Match kutum
        questions = msgStr.ask.kutum.split(',');
        for(x in questions) {
            if(msg.indexOf(questions[x]) != -1) {
                return 'kutum';
            }
        }

        // Match quint
        questions = msgStr.ask.quint.split(',');
        for(x in questions) {
            if(msg.indexOf(questions[x]) != -1) {
                return 'quint';
            }
        }

        // Match muraka
        questions = msgStr.ask.muraka.split(',');
        for(x in questions) {
            if(msg.indexOf(questions[x]) != -1) {
                return 'muraka';
            }
        }

        // Match vells
        questions = msgStr.ask.vell.split(',');
        for(x in questions) {
            if(msg.indexOf(questions[x]) != -1) {
                return 'vell';
            }
        }
    }

    function vell(message, bossName) {
        if(bossName.toLowerCase().indexOf('vell') != 0) return;
        message.channel.send(`Anh em tập trung 2h30 ở Balenos-2 cảng Olvia đi Vell nha\nhttps://i.imgur.com/rQkHElN.jpg`);
    }
}