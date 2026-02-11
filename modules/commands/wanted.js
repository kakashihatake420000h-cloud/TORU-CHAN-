module.exports.config = {
  name: "wanted",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "CYBER ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️ (Fixed Wanted by Grok)",
  description: "Mention করলে One Piece Wanted Poster বানাবে! 🏴‍☠️",
  commandCategory: "Tag Fun",
  usages: "wanted @mention",
  cooldowns: 5,
  dependencies: {
    "fs-extra": "",
    "axios": "",
    "jimp": ""
  }
};

module.exports.onLoad = async function () {
  const fs = global.nodemodule["fs-extra"];
  const path = global.nodemodule.path;
  const { downloadFile } = global.utils;

  const canvasDir = __dirname + "/cache/canvas/";
  if (!fs.existsSync(canvasDir)) {
    fs.mkdirSync(canvasDir, { recursive: true });
  }

  const wantedPath = path.resolve(__dirname, "cache/canvas", "wanted.png");

  if (!fs.existsSync(wantedPath)) {
    await downloadFile("https://i.imgur.com/9f9xB2f.jpeg", wantedPath);
    console.log("[Wanted] Base poster downloaded.");
  }
};

async function getUserName(api, userID) {
  try {
    const info = await api.getUserInfo(userID);
    return info[userID]?.name || "Unknown Pirate";
  } catch {
    return "Mystery Pirate";
  }
}

async function makeWantedPoster(mentionedID) {
  const Jimp = global.nodemodule.jimp;
  const fs = global.nodemodule["fs-extra"];
  const path = global.nodemodule.path;
  const axios = global.nodemodule.axios;

  const cachePath = path.resolve(__dirname, "cache/canvas");
  const basePoster = await Jimp.read(cachePath + "/wanted.png");

  // Profile pic fetch
  let avatarUrl = `https://graph.facebook.com/${mentionedID}/picture?width=720&height=720`;
  try {
    const res = await axios.get(`https://graph.facebook.com/${mentionedID}/picture?width=720&height=720&redirect=false`);
    avatarUrl = res.data?.data?.url || avatarUrl;
  } catch {}

  const avatarRes = await axios.get(avatarUrl, { responseType: "arraybuffer" });
  const avatarTemp = cachePath + `/avt_${mentionedID}.png`;
  fs.writeFileSync(avatarTemp, Buffer.from(avatarRes.data));

  let avatar = await Jimp.read(avatarTemp);
  avatar = avatar.resize(380, 380);  // Exact box size – square, no circle

  // Composite exactly in the box (measured: x=110, y=170)
  basePoster.composite(avatar, 110, 170);

  // Fonts
  const fontBig = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
  const fontMedium = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

  // WANTED top center
  basePoster.print(fontBig, 0, 40, {
    text: "WANTED",
    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
  }, basePoster.getWidth(), 100);

  // DEAD OR ALIVE (below box)
  basePoster.print(fontBig, 0, 590, {
    text: "DEAD OR ALIVE",
    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
  }, basePoster.getWidth(), 80);

  // Name
  const name = await getUserName(global.api, mentionedID);
  basePoster.print(fontBig, 0, 670, {
    text: name.toUpperCase(),
    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
  }, basePoster.getWidth(), 100);

  // Random bounty/prize
  const bounties = [48000000, 130000000, 320000000, 930000000, 1800000000, 3200000000, 5000000000];
  const randomPrize = bounties[Math.floor(Math.random() * bounties.length)];
  const prizeText = `REWARD: ${randomPrize.toLocaleString()} ₿`;
  basePoster.print(fontBig, 0, 770, {
    text: prizeText,
    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
  }, basePoster.getWidth(), 100);

  const output = cachePath + `/wanted_${mentionedID}.png`;
  await basePoster.writeAsync(output);

  fs.unlinkSync(avatarTemp);
  return output;
}

module.exports.run = async function ({ event, api }) {
  const fs = global.nodemodule["fs-extra"];
  const { threadID, messageID, mentions } = event;

  const mentionedID = Object.keys(mentions || {})[0];
  if (!mentionedID) {
    return api.sendMessage("কাউকে @ ট্যাগ করো, Wanted poster বানাই! 🏴‍☠️", threadID, messageID);
  }

  try {
    const imgPath = await makeWantedPoster(mentionedID);
    const taggedName = mentions[mentionedID].replace(/@/g, '').trim();

    api.sendMessage({
      body: `🏴‍☠️ ${taggedName} কে Wanted ঘোষণা! Marine খুঁজছে...\nPrize: Random huge bounty! 🤣💀`,
      attachment: fs.createReadStream(imgPath)
    }, threadID, () => fs.unlinkSync(imgPath), messageID);
  } catch (err) {
    console.error(err);
    api.sendMessage("Error হয়েছে... আবার ট্রাই করো 😭", threadID, messageID);
  }
};
