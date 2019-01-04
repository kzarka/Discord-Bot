'use strict';

module.exports = {
    logInfo: function (content, message = null) {
        if (!message) {
            console.log(content);
            return;
        }
        message.channel.send(content);
    },

    isMe: function (user) {
        return (user.id === '166795785915203584');
    },

    /**
     * Create an configuration file. :)
     *
     * @param {fs}
     */
    createConfig: function(fs) {
        var json = {
            "bot": {
                "token": "",
                "prefix": ""
            },
            "autoload": []
        };
        json = JSON.stringify(json, null, 4);
        fs.writeFileSync('./config.json', json, 'utf8', 'w', (err) => {
            if (!err) {
                console.log('Configuration file created successfully!');
            }
        });
        console.log("Create");
    },

    /**
     * Save an configuration file. :)
     *
     * @param {fs}
     */
    saveConfig: function(fs, json) {
        json = JSON.stringify(json, null, 4);
        fs.writeFile('./config.json', json, (err) => {
            if (!err) {
                console.log('Configuration file saved successfully!');
            }
        });
    },

    /**
     * Create default modules list file. :)
     *
     * @param {fs}
     */
    createModulesData: function(fs) {
        var json = {};
        json = JSON.stringify(json, null, 4);
        fs.writeFileSync('./data/modules.json', json, 'utf8', 'w', (err) => {
            if (!err) {
                console.log('Configuration file created successfully!');
            }
        });
    },

};