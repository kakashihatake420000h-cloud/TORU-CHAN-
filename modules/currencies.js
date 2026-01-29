const fs = require("fs-extra");
const path = require("path");

const dataPath = path.join(__dirname, "data/currencies.json");

// Ensure data folder and file exist
if (!fs.existsSync(path.join(__dirname, "data"))) fs.mkdirSync(path.join(__dirname, "data"));
if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, JSON.stringify({}, null, 2));

module.exports = {
  // Get user data
  getData: async function(userID) {
    const raw = fs.readFileSync(dataPath);
    const data = JSON.parse(raw);
    if (!data[userID]) data[userID] = { money: 0 };
    return data[userID];
  },

  // Increase user money
  increaseMoney: async function(userID, amount) {
    const raw = fs.readFileSync(dataPath);
    const data = JSON.parse(raw);
    if (!data[userID]) data[userID] = { money: 0 };
    data[userID].money += amount;
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return data[userID].money;
  },

  // Decrease user money
  decreaseMoney: async function(userID, amount) {
    const raw = fs.readFileSync(dataPath);
    const data = JSON.parse(raw);
    if (!data[userID]) data[userID] = { money: 0 };
    if (data[userID].money < amount) amount = data[userID].money;
    data[userID].money -= amount;
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return data[userID].money;
  },

  // Set money (for special ID use)
  setMoney: async function(userID, amount) {
    const raw = fs.readFileSync(dataPath);
    const data = JSON.parse(raw);
    if (!data[userID]) data[userID] = { money: 0 };
    data[userID].money = amount;
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return data[userID].money;
  }
};
