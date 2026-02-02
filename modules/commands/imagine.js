module.exports.config = {
  name: "imagine",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️ × Fix by Hridoy",
  description: "Generate image using Pollinations AI",
  commandCategory: "AI",
  usages: "imagine <text>",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const axios = require("axios");
  const fs = require("fs-extra");
  const path = require("path");

  const { threadID, messageID } = event;
  const query = args.join(" ");

  if (!query)
    return api.sendMessage("❌ Please provide a prompt.\nExample: imagine anime boy", threadID, messageID);

  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

  const imgPath = path.join(cacheDir, "imagine.png");

  try {
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(query)}`;

    const res = await axios.get(url, { responseType: "arraybuffer" });
    fs.writeFileSync(imgPath, res.data);

    return api.sendMessage(
      {
        body: `🖼️ Image generated for:\n“${query}”`,
        attachment: fs.createReadStream(imgPath)
      },
      threadID,
      () => fs.unlinkSync(imgPath),
      messageID
    );
  } catch (err) {
    return api.sendMessage("❌ Failed to generate image.", threadID, messageID);
  }
};
