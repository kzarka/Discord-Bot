const Discord = require('discord.js');

const MTDay = 3;

let secsUntilDailyReset = null;
let secsIntoGameDay = null;
let start = '6';
let end = '10';
let str = null;

module.exports = function(client, helper = null){
    setGameTime();

    /* Set game time */
    function setGameTime(){
        nightTimer();
        mtTime();
        client.user.setActivity(str);
        setTimeout(setGameTime, 2000);
    }

    //is MT today
    function isMTToday(){
        var d = new Date();
        if(d.getDay()!=MTDay) return false;
        let startHour = new Date();
        let endHour = new Date();
        startHour.setHours(start);
        endHour.setHours(end);
        startHour.setMinutes(0);
        endHour.setMinutes(0);
        if(d > startHour && d < endHour){
            return true;
        }
        return false;
    }

    function createTime() {
        var d = new Date();
        var startHour = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0);
        var rlDayElapsedS = (Date.now() - startHour) / 1000;
        secsIntoGameDay = (rlDayElapsedS + 200 * 60 + 20 * 60) % (240 * 60);

        // Daily reset = midnight UTC
        secsUntilDailyReset=0;
        if (rlDayElapsedS>=57600){
            secsUntilDailyReset=Math.ceil(24 * 60 * 60 - rlDayElapsedS)+57600;
        } 
        else {
            secsUntilDailyReset=Math.ceil(24 * 60 * 60 - rlDayElapsedS)-28800;
        }
        var minsUntilDailyReset = Math.ceil(secsUntilDailyReset / 60);
        var hoursUntilDailyReset = Math.floor(minsUntilDailyReset / 60);
        var minsRemainderUntilDailyReset = minsUntilDailyReset % 60;
    }

    function nightTimer(){
        if(isMTToday()) return;
        createTime();
        if (secsIntoGameDay >= 12000) {
            var secsIntoGameNight = secsIntoGameDay - 12000;
            var pctOfNightDone = secsIntoGameNight / (40 * 60);
            var gameHour = 9 * pctOfNightDone;
            gameHour = gameHour < 2 ? 22 + gameHour : gameHour - 2;
            var secsUntilNightEnd = Math.ceil(40 * 60 - secsIntoGameNight);
            var minsUntilNightEnd = Math.ceil(secsUntilNightEnd / 60)-1;
        } else {
            var secsIntoGameDaytime = secsIntoGameDay;
            var pctOfDayDone = secsIntoGameDay / (200 * 60);
            var gameHour = 7 + (22 - 7) * pctOfDayDone;
            var secsUntilNightStart = Math.ceil(12000 - secsIntoGameDaytime);
            var minsUntilNightStart = Math.ceil(secsUntilNightStart / 60)-1;
            var hoursUntilNightStart = Math.floor(minsUntilNightStart / 60);
            var minsRemainderUntilNightStart = minsUntilNightStart % 60;
        }
  
        if(minsRemainderUntilNightStart<10){
            minsUntilNightStart="0"+minsUntilNightStart;
        }
 
        if (hoursUntilNightStart > 0) {
            str =  'Ngày còn' + ' ' + hoursUntilNightStart + ':' +minsRemainderUntilNightStart + 'h';
        } else if (minsUntilNightStart > 1) {
            str = 'Ngày còn' + ' ' + minsUntilNightStart + ' phút';
        } else if (secsUntilNightStart > 0) {
            dayNightStr = 'Ngày còn' + ' ' + secsUntilNightStart + 's';
        } else if (minsUntilNightEnd > 1) {
            str = 'Đêm còn' + ' ' + minsUntilNightEnd + ' phút';
        } else {
            str = 'Đêm còn' + ' ' + secsUntilNightEnd + 's';
        }
    }

    function mtTime(){
        if(!isMTToday()) return;
        let startHour = new Date();
        let endHour = new Date();
        startHour.setHours(start);
        endHour.setHours(end);
        startHour.setMinutes(0);
        endHour.setMinutes(0);

        sec = (endHour.getTime()-Date.now()) / 1000;
        if(sec<0){
            str = "Lỗi giờ!";
            return;
        }
        var min = Math.ceil(sec/60);
        var hour = Math.floor(min/60);
        minRemain = min%60;
        if(minRemain<10){
            minRemain="0"+minRemain;
        }
 
        if (hour > 0) {
            str = 'Bảo trì còn' + ' ' + hour + ':' +minRemain + 'h';
        } 
        else if (min > 0) {
            str = 'Bảo trì còn' + ' ' + min + 'p';
        } 
        else if (sec > 0) {
            str = 'Bảo trì còn' + ' ' + Math.ceil(sec) + 's';
        }
    }

}