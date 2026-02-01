module.exports.config = {
    name: "setmoney",
    version: "1.4.0",
    hasPermssion: 2,
    credits: "Hridoy × Mirai Ultra Fix",
    description: "Admin money control (FULL Mirai compatible)",
    commandCategory: "Economy",
    usages: "@tag <amount> | me <amount> | uid <id> <amount> | del @tag",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Currencies, Users }) {
    const { threadID, messageID, senderID, mentions } = event;

    if (!args.length && Object.keys(mentions).length === 0)
        return api.sendMessage("❌ Usage: .setmoney @user 5000", threadID, messageID);

    /* ========= DELETE ========= */
    if (args[0] === "del") {
        if (!Object.keys(mentions).length)
            return api.sendMessage("❌ Tag someone to clear balance", threadID, messageID);

        const uid = Object.keys(mentions)[0];
        const data = await Currencies.getData(uid);
        const money = data.money || 0;

        await Currencies.decreaseMoney(uid, money);
        return api.sendMessage(`🗑 Cleared balance: ${money}$`, threadID, messageID);
    }

    /* ========= UID ========= */
    if (args[0] === "uid") {
        const uid = args[1];
        const amount = args.find(a => !isNaN(a));

        if (!uid || !amount)
            return api.sendMessage("❌ Usage: .setmoney uid <id> <amount>", threadID, messageID);

        await Currencies.increaseMoney(uid, parseInt(amount));

        let name = uid;
        try {
            const u = await Users.getData(uid);
            name = u.name || uid;
        } catch {}

        return api.sendMessage(`✅ Added ${amount}$ to ${name}`, threadID, messageID);
    }

    /* ========= MENTION (🔥 MAIN FIX) ========= */
    if (Object.keys(mentions).length > 0) {
        const uid = Object.keys(mentions)[0];
        const amount = args.find(a => !isNaN(a));

        if (!amount)
            return api.sendMessage("❌ Please provide amount", threadID, messageID);

        await Currencies.increaseMoney(uid, parseInt(amount));
        const name = mentions[uid].replace("@", "");

        return api.sendMessage(`✅ Added ${amount}$ to ${name}`, threadID, messageID);
    }

    /* ========= ME ========= */
    if (args[0] === "me") {
        const amount = args.find(a => !isNaN(a));
        if (!amount)
            return api.sendMessage("❌ Invalid amount", threadID, messageID);

        await Currencies.increaseMoney(senderID, parseInt(amount));
        return api.sendMessage(`✅ Added ${amount}$ to your balance`, threadID, messageID);
    }

    return api.sendMessage("❌ Invalid syntax", threadID, messageID);
};
