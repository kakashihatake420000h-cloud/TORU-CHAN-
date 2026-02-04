const axios = require("axios");
const moment = require("moment-timezone");

module.exports.config = {
  name: "info",
  version: "1.0.6",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Info with loading progress bar + online gif",
  commandCategory: "System",
  cooldowns: 1
};

module.exports.run = async function ({ api, event }) {

  // 🔹 Progress bar frames
  const progress = [
    "█░░░░░░░░░ 10%",
    "██░░░░░░░░ 20%",
    "███░░░░░░░ 30%",
    "████░░░░░░ 40%",
    "█████░░░░░ 50%",
    "██████░░░░ 60%",
    "███████░░░ 70%",
    "████████░░ 80%",
    "█████████░ 90%",
    "██████████ 100% ✨"
  ];

  let loadingMsg;

  // send loading animation
  for (let i = 0; i < progress.length; i++) {
    await new Promise(r => setTimeout(r, 400));
    if (i === 0) {
      loadingMsg = await api.sendMessage(
        `⏳ Loading...\n${progress[i]}`,
        event.threadID
      );
    } else {
      api.editMessage(
        `⏳ Loading...\n${progress[i]}`,
        loadingMsg.messageID
      );
    }
  }

  // ⏰ uptime
  const time = process.uptime(),
    hours = Math.floor(time / 3600),
    minutes = Math.floor((time % 3600) / 60),
    seconds = Math.floor(time % 60);

  const currentTime = moment
    .tz("Asia/Dhaka")
    .format("『D/MM/YYYY』 【HH:mm:ss】");

  const message =
`𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡
━━━━━━━━━━━━━━━━━━━━━━━
▶ 𝗡𝗮𝗺𝗲: 𝗞𝗮𝗸𝗮𝘀𝗵𝗶 𝗛𝗮𝘁𝗮𝗸𝗲
▶ 𝗣𝗼𝘀𝗶𝘁𝗶𝗼𝗻: 𝗢𝘄𝗻𝗲𝗿
▶ 𝗟𝗼𝗰𝗮𝗶𝗼𝗻: 𝗝𝗮𝘀𝗵𝗼𝗿𝗲
▶ 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸: https://m.me/61587127028066
▶ 𝗜𝗻𝘀𝘁𝗮𝗴𝗿𝗮𝗺: @dukkho____bilash
▶ 𝗪𝗵𝗮𝘁𝘀𝗮𝗽𝗽: 014**-******
▶ 𝗧𝗶𝗺𝗲: ${currentTime}
▶ 𝗨𝗽𝘁𝗶𝗺𝗲: ${hours}h ${minutes}m ${seconds}s
━━━━━━━━━━━━━━━━━━━━━━━`;

  try {
    const gifUrl = "https://i.imgur.com/IQTv73l.gif";
    const stream = await axios.get(gifUrl, {
      responseType: "stream"
    });

    // remove loader
    api.unsendMessage(loadingMsg.messageID);

    // send final message
    api.sendMessage(
      {
        body: message,
        attachment: stream.data
      },
      event.threadID,
      (err, info) => {
        if (!err) {
          setTimeout(() => {
            api.unsendMessage(info.messageID);
          }, 10000);
        }
      }
    );

  } catch (err) {
    console.error(err);
    api.unsendMessage(loadingMsg.messageID);
    api.sendMessage("❌ Info load করতে সমস্যা হয়েছে!", event.threadID);
  }
};
