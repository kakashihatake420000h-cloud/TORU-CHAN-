module.exports.config = {
  name: "calendar",
  version: "1.0.2",
  hasPermssion: 0,
  credits: "Hridoy × Mirai",
  description: "বাংলা, ইংরেজি ও হিজরি তারিখ + বার দেখাবে",
  commandCategory: "Utility",
  usages: "calendar",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;
  const now = new Date();

  // ইংরেজি
  const eng = now.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  // বাংলা
  const bangla = now.toLocaleDateString("bn-BD", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  // হিজরি (আরবি)
  const hijri = now.toLocaleDateString("ar-SA-u-ca-islamic", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const msg =
`╭───❏ 📅 আজকের তারিখ ❏───╮

🟢 ইংরেজি:
➤ ${eng}

🟡 বাংলা:
➤ ${bangla}

🔵 হিজরি:
➤ ${hijri}

📌 আজকের বার:
➤ ${bangla.split(",")[0]}

╰────────────────────╯`;

  return api.sendMessage(msg, threadID, messageID);
};
