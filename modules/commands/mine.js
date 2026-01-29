const path = require("path");
const axios = require("axios");

module.exports.config = {
    name: "mine",
    version: "2.0.1",
    hasPermssion: 0,
    credits: "D-Jukie",
    description: "Minecraft mini game for fun",
    commandCategory: "Game",
    usages: "[]",
    cooldowns: 0,
    envConfig: {
        "APIKEY": ""
    }
};

module.exports.checkPath = function (type, senderID) {
    const pathItem = path.join(__dirname, 'game', 'mine', 'item.json');
    const pathUser = path.join(__dirname, 'game', 'mine', 'datauser', `${senderID}.json`);
    const pathUser_1 = require("./game/mine/datauser/" + senderID + '.json');
    const pathItem_1 = require("./game/mine/item.json");
    if (type == 1) return pathItem;
    if (type == 2) return pathItem_1;
    if (type == 3) return pathUser;
    if (type == 4) return pathUser_1;
};

module.exports.onLoad = async () => {
    const fs = require("fs-extra");

    const dir = __dirname + `/game/mine/`;
    const dirCache = __dirname + `/cache/`;
    const dirData = __dirname + `/game/mine/datauser/`;

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(dirData)) fs.mkdirSync(dirData, { recursive: true });
    if (!fs.existsSync(dirCache)) fs.mkdirSync(dirCache, { recursive: true });

    if (!fs.existsSync(dir + "data.json"))
        (await axios({
            url: "https://raw.githubusercontent.com/KhangGia1810/mine123/main/data.json",
            method: 'GET',
            responseType: 'stream'
        })).data.pipe(fs.createWriteStream(dir + "data.json"));

    if (!fs.existsSync(dir + "item.json"))
        (await axios({
            url: "https://raw.githubusercontent.com/KhangGia1810/mine123/main/item.json",
            method: 'GET',
            responseType: 'stream'
        })).data.pipe(fs.createWriteStream(dir + "item.json"));
};

module.exports.run = async function ({ api, event, args, Users, Currencies }) {
    const { threadID, messageID, senderID } = event;
    const { writeFileSync, existsSync } = require("fs-extra");
    const pathData = path.join(__dirname, 'game', 'mine', 'datauser', `${senderID}.json`);

    switch (args[0]) {

        case 'register':
        case '-r': {
            if (!existsSync(pathData)) {
                const obj = {
                    name: (await Users.getData(senderID)).name,
                    ID: senderID,
                    mainROD: null,
                    GPS: { locate: null, area: null },
                    fishBag: [{
                        ID: 0,
                        name: 'Bedrock',
                        category: 'Legendary',
                        size: 999999,
                        sell: 0
                    }],
                    item: [],
                    timeRegister: new Date().toLocaleString('en-US')
                };
                writeFileSync(pathData, JSON.stringify(obj, null, 4));
                return api.sendMessage(
                    { body: "[Minecraft]\nRegistration successful!\nStart mining now!", attachment: await this.subnautica() },
                    threadID,
                    messageID
                );
            }
            return api.sendMessage(
                { body: "[Minecraft]\nYou are already registered.", attachment: await this.subnautica() },
                threadID,
                messageID
            );
        }

        case 'shop':
        case '-s': {
            if (!existsSync(pathData))
                return api.sendMessage(
                    { body: "[Minecraft]\nYou are not registered yet.", attachment: await this.subnautica() },
                    threadID,
                    messageID
                );

            return api.sendMessage(
                {
                    body:
`[Villager Shop]
1. Buy Pickaxe
2. Sell Mined Items
3. Upgrade / Repair Items

Reply with your choice`,
                    attachment: await this.subnautica()
                },
                threadID,
                (err, info) => {
                    global.client.handleReply.push({
                        name: this.config.name,
                        messageID: info.messageID,
                        author: senderID,
                        type: "shop"
                    });
                },
                messageID
            );
        }

        case 'bag':
        case '-b': {
            if (!existsSync(pathData))
                return api.sendMessage(
                    { body: "[Minecraft]\nYou are not registered yet.", attachment: await this.subnautica() },
                    threadID,
                    messageID
                );

            const data = this.checkPath(4, senderID);
            return api.sendMessage(
                {
                    body:
`[Inventory]
1. Mined Items (${data.fishBag.length})
2. Pickaxes (${data.item.length})

Reply to choose`,
                    attachment: await this.subnautica()
                },
                threadID,
                (err, info) => {
                    global.client.handleReply.push({
                        name: this.config.name,
                        messageID: info.messageID,
                        author: senderID,
                        type: "choosebag"
                    });
                },
                messageID
            );
        }

        case 'help': {
            return api.sendMessage(
                {
                    body:
`[Minecraft Help]
- register : Create account
- custom   : Choose mining location
- bag      : View inventory
- shop     : Villager shop`,
                    attachment: await this.subnautica()
                },
                threadID,
                messageID
            );
        }

        default: {
            if (!existsSync(pathData))
                return api.sendMessage(
                    { body: "[Minecraft]\nYou are not registered yet.", attachment: await this.subnautica() },
                    threadID,
                    messageID
                );

            const data = this.checkPath(4, senderID);

            if (data.item.length === 0)
                return api.sendMessage("You don't have a pickaxe. Buy one from the shop!", threadID, messageID);

            if (!data.mainROD)
                return api.sendMessage("You haven't selected a pickaxe yet.", threadID, messageID);

            if (!data.GPS.locate || !data.GPS.area)
                return api.sendMessage("You haven't selected a mining location yet.", threadID, messageID);

            return api.sendMessage("Mining logic continues normally…", threadID, messageID);
        }
    }
};

/* ===== Helpers (unchanged logic, English text only where needed) ===== */

module.exports.subnautica = async function () {
    const fs = global.nodemodule["fs-extra"];
    const axios = global.nodemodule["axios"];
    let images = [];
    let download = (await axios.get('https://i.imgur.com/vnXze66.jpg', { responseType: "arraybuffer" })).data;
    fs.writeFileSync(__dirname + `/cache/minecraft.png`, Buffer.from(download, "utf-8"));
    images.push(fs.createReadStream(__dirname + `/cache/minecraft.png`));
    return images;
};