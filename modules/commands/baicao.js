module.exports.config = {
	name: "baicao",
	version: "2.6.1",
	hasPermssion: 0,
	credits: "Mirai Team and lzhoang2601",
	description: "Baicao card game for group betting",
	commandCategory: "Game",
	usages: "[create/join/start/info/leave] => deal cards / change cards / ready",
	cooldowns: 1
};

module.exports.handleEvent = async ({ event, api, Users, Currencies }) => {
	const { senderID, threadID, body, messageID } = event;

	if (typeof body == "undefined") return;
	if (!global.moduleData.baicao) global.moduleData.baicao = new Map();
	if (!global.moduleData.baicao.has(threadID)) return;
	var data = global.moduleData.baicao.get(threadID);
	if (data.start != 1) return;

	if (body.indexOf("deal cards") == 0) {
		if (data.chiabai == 1) return;
		for (const key in data.player) {
			const card1 = Math.floor(Math.random() * 9) + 1;
			const card2 = Math.floor(Math.random() * 9) + 1;
			const card3 = Math.floor(Math.random() * 9) + 1;
			var total = card1 + card2 + card3;
			if (total >= 20) total -= 20;
			if (total >= 10) total -= 10;

			data.player[key].card1 = card1;
			data.player[key].card2 = card2;
			data.player[key].card3 = card3;
			data.player[key].tong = total;

			const nameUser = await Users.getNameUser(data.player[key].id);
			api.sendMessage(
				`Your cards: ${card1} | ${card2} | ${card3}\n\nTotal points: ${total}`,
				data.player[key].id,
				(error) => {
					if (error)
						api.sendMessage(`Cannot deal cards to user: ${nameUser}`, threadID);
				}
			);
		}
		data.chiabai = 1;
		global.moduleData.baicao.set(threadID, data);
		return api.sendMessage(
			"» Cards have been dealt «\n\n📌 Check your inbox\n🙏 Each player has 2 card changes\nIf your cards are low, type 'change card'\n👉 To lock cards, type 'ready'",
			threadID
		);
	}

	if (body.indexOf("change card") == 0) {
		if (data.chiabai != 1) return;
		var player = data.player.find(item => item.id == senderID);
		if (player.doibai == 0)
			return api.sendMessage("You have used all card changes", threadID, messageID);
		if (player.ready == true)
			return api.sendMessage("You are already ready and cannot change cards!", threadID, messageID);

		const card = ["card1", "card2", "card3"];
		player[card[Math.floor(Math.random() * card.length)]] = Math.floor(Math.random() * 9) + 1;
		player.tong = player.card1 + player.card2 + player.card3;
		if (player.tong >= 20) player.tong -= 20;
		if (player.tong >= 10) player.tong -= 10;
		player.doibai -= 1;

		global.moduleData.baicao.set(data);
		const nameUser = await Users.getNameUser(player.id);

		return api.sendMessage(
			`Your cards after change: ${player.card1} | ${player.card2} | ${player.card3}\n\nTotal points: ${player.tong}`,
			player.id,
			(error) => {
				if (error)
					api.sendMessage(`Cannot change cards for user: ${nameUser}`, threadID);
			}
		);
	}

	if (body.indexOf("ready") == 0) {
		if (data.chiabai != 1) return;
		var player = data.player.find(item => item.id == senderID);
		if (player.ready == true) return;

		const name = await Users.getNameUser(player.id);
		data.ready += 1;
		player.ready = true;

		if (data.player.length == data.ready) {
			const players = data.player;
			players.sort((a, b) => b.tong - a.tong);

			const winPlayer = await Users.getNameUser(players[0].id);
			var ranking = [], num = 1;

			for (const info of players) {
				const pname = await Users.getNameUser(info.id);
				ranking.push(
					`${num++} • ${pname}: ${info.card1} | ${info.card2} | ${info.card3} => ${info.tong} points`
				);
			}

			const money = data.dCoin * players.length;
			await Currencies.increaseMoney(players[0].id, money);
			ranking.push(`${winPlayer} wins ${money}$`);

			global.moduleData.baicao.delete(threadID);
			return api.sendMessage(`Results:\n\n${ranking.join("\n")}`, threadID);
		} else {
			return api.sendMessage(
				`👤 ${name} is ready\n\nRemaining players: ${data.player.length - data.ready}`,
				threadID
			);
		}
	}

	if (body.indexOf("nonready") == 0) {
		const list = data.player.filter(item => item.ready == false);
		var msg = [];

		for (const info of list) {
			const name = global.data.userName.get(info.id) || await Users.getNameUser(info.id);
			msg.push(name);
		}

		if (msg.length != 0)
			return api.sendMessage("Players not ready: " + msg.join(", "), threadID);
	}
};

module.exports.run = async ({ api, event, Currencies, args, Users }) => {
	var { senderID, threadID, messageID } = event;
	threadID = String(threadID);
	senderID = String(senderID);

	if (!global.moduleData.baicao) global.moduleData.baicao = new Map();
	var data = global.moduleData.baicao.get(threadID) || {};

	switch (args[0]) {
		case "join":
		case "-j": {
			if (data.start == 1)
				return api.sendMessage("The game has already started", threadID, messageID);

			const senderCoin = (await Currencies.getData(senderID)).money;

			if (typeof data.player == "undefined") {
				if (!senderCoin || senderCoin < 1000)
					return api.sendMessage("You don't have enough money to create a table!", threadID, messageID);

				global.moduleData.baicao.set(threadID, {
					author: senderID,
					maxCoin: senderCoin,
					dCoin: 0,
					start: 0,
					chiabai: 0,
					ready: 0,
					player: [{
						id: senderID,
						money: senderCoin,
						card1: 0,
						card2: 0,
						card3: 0,
						doibai: 2,
						ready: false
					}]
				});

				return api.sendMessage(
					"Baicao table created.\n\nJoin with: >baicao join\nSet bet with: >baicao create <coins>",
					threadID,
					messageID
				);
			}

			if (data.player.find(item => item.id == senderID))
				return api.sendMessage("You already joined this table!", threadID, messageID);

			if (!senderCoin || senderCoin < 1000)
				return api.sendMessage("You don't have enough money to join!", threadID, messageID);

			data.player.push({
				id: senderID,
				money: senderCoin,
				card1: 0,
				card2: 0,
				card3: 0,
				doibai: 2,
				ready: false
			});

			if (senderCoin < data.maxCoin) data.maxCoin = senderCoin;
			global.moduleData.baicao.set(threadID, data);

			return api.sendMessage(
				`${await Users.getNameUser(senderID)} joined the table!\nMax bet allowed: ${data.maxCoin}$`,
				threadID,
				messageID
			);
		}

		case "leave":
		case "-l": {
			if (data.start == 1)
				return api.sendMessage("The game has already started", threadID, messageID);

			if (!data.player.some(item => item.id == senderID))
				return api.sendMessage("You are not in this table!", threadID, messageID);

			if (data.author == senderID) {
				global.moduleData.baicao.delete(threadID);
				return api.sendMessage("The host cancelled the table!", threadID, messageID);
			} else {
				data.player.splice(data.player.findIndex(i => i.id === senderID), 1);
				global.moduleData.baicao.set(threadID, data);
				return api.sendMessage("You left the table!", threadID, messageID);
			}
		}

		case "create":
		case "-c": {
			if (senderID != data.author)
				return api.sendMessage("Only the host can set the bet", threadID, messageID);

			if (!data.player)
				return api.sendMessage("No active table found", threadID, messageID);

			if (data.player.length < 2)
				return api.sendMessage("Not enough players to start", threadID, messageID);

			if (!args[1] || parseInt(args[1]) < 1000)
				return api.sendMessage("Invalid bet amount", threadID, messageID);

			if (data.maxCoin < parseInt(args[1]))
				return api.sendMessage(`Max bet allowed is ${data.maxCoin}$`, threadID, messageID);

			data.start = 1;
			data.dCoin = parseInt(args[1]);

			for (const user of data.player) {
				await Currencies.decreaseMoney(user.id, data.dCoin);
			}

			return api.sendMessage(
				`Bet ${args[1]}$ placed successfully!\n\nType "deal cards" to start`,
				threadID,
				messageID
			);
		}

		case "cancel":
		case "-x": {
			if (!data.player)
				return api.sendMessage("No active table found", threadID, messageID);

			global.moduleData.baicao.delete(threadID);
			return api.sendMessage("Baicao table cancelled!", threadID, messageID);
		}

		case "info":
		case "-i": {
			if (!data.player)
				return api.sendMessage("No active table found", threadID, messageID);

			return api.sendMessage(
				"=== Baicao Table Info ===" +
				"\n- Host ID: " + data.author +
				"\n- Total players: " + data.player.length +
				"\n- Max bet: " + data.maxCoin + "$",
				threadID,
				messageID
			);
		}

		default:
			return global.utils.throwError(this.config.name, threadID, messageID);
	}
};