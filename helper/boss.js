'use strict';

const fs = require("fs");
var _ = require('lodash');

let boss = require('../data/dependencies/boss/table.json');
let positionX = [920, 140, 270, 400, 530, 660, 790];

let rectPositionX = [760, 80, 210, 340, 470, 500, 630];
let rectPositionY = [60, 120, 180, 240, 300, 360, 420];
var time = ["0:30", "6:00", "10:00", "14:00", "15:00", "19:00", "23:00"];

var helper = {
    description: "War helper"
}

helper.exportSvg = async function() {
    let rows = [];
    let svg = fs.readFileSync('./data/dependencies/boss/table.svg','utf8');
    _.each(boss, function(bosses, date) {
        rows.push(`<g id="textGroup-date-${date}">`);
        rows.push(`<text x='${positionX[date]}' y='35' style="fill:white;text-anchor:middle;font-weight:bold;font-size:18px">`);
        let maxDy = 60;
        let subDy = 0;
        let double = false;
        _.each(bosses, function(current, hour) {
            let split = current.split('|');
            if(split.length > 1) {
                if(double || subDy == 0) subDy += 10;
                let currentDy = maxDy - subDy;
                let row = `<tspan x='${positionX[date]}' dy='${currentDy}'>${split[0] || '-' }</tspan>`;
                rows.push(row);
                row = `<tspan x='${positionX[date]}' dy='20'>${split[1] || '-' }</tspan>`;
                rows.push(row);
                double = true;
            } else {
                if(subDy != 0) subDy -= 10;
                if(subDy == 0 && double) subDy = 10;
                let currentDy = maxDy - subDy; 
                let row = `<tspan x='${positionX[date]}' dy='${currentDy}'>${split[0] || '-' }</tspan>`;
                rows.push(row);
                currentDy = 60;
                double = false;
            }
        });
        rows.push('</text>');
        rows.push('</g>');
    });

    let data = rows.join('\n');
    svg = svg + data;
    fs.writeFileSync('./data/dependencies/boss/table-output.svg', svg, 'utf8');
}

helper.loadSvg = async function(nextBoss) {
    let svg = fs.readFileSync('./data/dependencies/boss/table-output.svg', 'utf8');
    let rows = [];
    let hourIndex = time.indexOf(nextBoss[1]);
    let rectX = rectPositionX[nextBoss[2]];
    let rectY = rectPositionY[hourIndex];
    rows.push(`<rect x="0" y="${rectY}" width="990" height="60" style="stroke:red;stroke-width:2;fill-opacity: 0.1" />`);
    rows.push(`<rect x="${rectX}" y="0" width="130" height="480" style="stroke:red;stroke-width:2;fill-opacity: 0.1" />`);
    let data = rows.join('\n');
    svg = svg + data + '</svg>';
    return svg;
}

module.exports = helper;