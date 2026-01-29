module.exports.config = {
  name: "send",
  aliases: ["send"],
  description: "Set or give balance (special ID only)",
  cooldown: 3,
  hasPermssion: 1
};

module.exports.run = async function({ api, event, args }) {
  const econ = require("./economy.js");
  const senderID = event.senderID;

  if(senderID != "100003673251961") return api.sendMessage("❌ Only special ID can use this.", event.threadID, event.messageID);

  const userID = args[0];
  const amount = parseInt(args[1]);
  if(!userID || isNaN(amount)) return api.sendMessage("Usage: .send <uid> <amount>", event.threadID, event.messageID);

  await econ.init();
  await econ.setBalance(userID, amount);

  return api.sendMessage(`✅ Successfully set ${amount}$ for UID: ${userID}`, event.threadID, event.messageID);
}
