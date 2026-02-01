module.exports.config = {
    name: "uid",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "Hridoy × Grok",
    description: "Get Facebook User ID (self or mentioned)",
    commandCategory: "Tools",
    usages: "[mention]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
    const { senderID, threadID, messageID, mentions } = event;

    // No mention → own UID
    if (!mentions || Object.keys(mentions).length === 0) {
        return api.sendMessage(
`╭───❏ 𝗨𝗦𝗘𝗥 𝗜𝗗 ❏───╮
│ 👤 You
│ 🆔 ${senderID}
╰──────────────────╯`,
            threadID,
            messageID
        );
    }

    // Mention UID
    let msg = "╭───❏ 𝗠𝗘𝗡𝗧𝗜𝗢𝗡 𝗨𝗜𝗗 ❏───╮\n";

    for (const id in mentions) {
        const name = mentions[id].replace("@", "");
        msg += `│ 👤 ${name}\n│ 🆔 ${id}\n├───────────────\n`;
    }

    msg = msg.replace(/├───────────────\n$/, "");
    msg += "\n╰──────────────────╯";

    return api.sendMessage(msg, threadID, messageID);
};
