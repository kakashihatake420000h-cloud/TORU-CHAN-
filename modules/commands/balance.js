const economy = require("../utils/economy");

module.exports.config = {
    name: "bal",
    version: "1.0.3",
    hasPermssion: 0,
    credits: " Hridoy JSON Fix",
    description: "Check your or tagged user's balance",
    commandCategory: "Game",
    usages: "[Tag]",
    cooldowns: 5
};

module.exports.languages = {
    "en": {
        "sotienbanthan":
            "💰 𝗬𝗢𝗨𝗥 𝗕𝗔𝗟𝗔𝗡𝗖𝗘\n━━━━━━━━━━━━━━━\n💸 Available Money: %1$",

        "sotiennguoikhac":
            "👤 𝗨𝗦𝗘𝗥 𝗕𝗔𝗟𝗔𝗡𝗖𝗘\n━━━━━━━━━━━━━━━\n✨ %1\n💰 Current Balance: %2$"
    }
};

module.exports.run = async function({ api, event, args, getText }) {
    const { threadID, messageID, senderID, mentions } = event;

    // If no args → show your own balance
    if (!args[0]) {
        const money = economy.getMoney(senderID);
        return api.sendMessage(
            getText("sotienbanthan", money),
            threadID,
            messageID
        );
    }

    // If one user mentioned → show their balance
    else if (Object.keys(mentions).length === 1) {
        const mentionID = Object.keys(mentions)[0];
        const money = economy.getMoney(mentionID);

        return api.sendMessage({
            body: getText(
                "sotiennguoikhac",
                mentions[mentionID].replace(/\@/g, ""),
                money
            ),
            mentions: [{
                tag: mentions[mentionID].replace(/\@/g, ""),
                id: mentionID
            }]
        }, threadID, messageID);
    }

    // Invalid syntax
    else return global.utils.throwError(this.config.name, threadID, messageID);
};
