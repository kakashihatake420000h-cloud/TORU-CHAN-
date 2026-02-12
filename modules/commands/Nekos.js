module.exports.config = {
  name: "nekos",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "Hridoy + Grok",
  description: "API থেকে random anime neko pic collect করে send করে 😻",
  commandCategory: "Image",
  usages: "nekos",
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  const axios = global.nodemodule["axios"];
  const fs = global.nodemodule["fs-extra"];
  const request = global.nodemodule["request"];

  try {
    const res = await axios.get("https://api.nekosapi.com/v4/images/random?rating=safe&limit=1");
    
    if (res.data.items && res.data.items.length > 0) {
      const imageUrl = res.data.items[0].image_url;
      const title = res.data.items[0].title || "Random Cute Neko 🐱";

      // Pic ডাউনলোড করে temp ফাইলে সেভ
      const path = __dirname + "/cache/neko_pic.jpg";
      
      await new Promise((resolve, reject) => {
        request(imageUrl)
          .pipe(fs.createWriteStream(path))
          .on("close", resolve)
          .on("error", reject);
      });

      // Messenger-এ attachment সহ send
      api.sendMessage({
        body: `${title}\nFrom Nekos API v4 🔥\n(আরেকটা চাইলে আবার টাইপ করো!)`,
        attachment: fs.createReadStream(path)
      }, event.threadID, () => {
        fs.unlink(path, () => {}); // Cleanup
      }, event.messageID);

    } else {
      api.sendMessage("কোনো pic পেলাম না bro 😿 API-তে issue হইতে পারে!", event.threadID, event.messageID);
    }
  } catch (error) {
    console.error("Neko Error:", error.message);
    api.sendMessage("Error hoise! হয়তো API down বা নেট ইস্যু। পরে ট্রাই করো 😅", event.threadID, event.messageID);
  }
};
