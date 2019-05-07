////////// Globals variables //////////
let CPUBoats = [
	[2,2,0,0,0,0,0,0,0,0],
	[0,3,0,0,0,0,0,0,0,0],
	[0,3,0,0,0,0,0,4,0,0],
	[0,3,0,0,0,0,0,4,0,0],
	[0,0,0,0,0,0,0,4,0,0],
	[0,0,0,0,0,0,0,4,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,5,5,5,5,5,0,0],
	[0,0,0,0,0,0,0,0,0,0]
];

let PlayerBoats = [
	[2,2,0,0,0,0,0,0,0,0],
	[0,3,0,0,0,0,0,0,0,0],
	[0,3,0,0,0,0,0,4,0,0],
	[0,3,0,0,0,0,0,4,0,0],
	[0,0,0,0,0,0,0,4,0,0],
	[0,0,0,0,0,0,0,4,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,5,5,5,5,5,0,0],
	[0,0,0,0,0,0,0,0,0,0]
];

let gameRules = {
	player: {
		destroyer: 0,
		cruiser: 0,
		battleship: 0,
		carrier: 0
	},
	cpu: {
		destroyer: 0,
		cruiser: 0,
		battleship: 0,
		carrier: 0
	},
	boatsSize: {
		destroyer: 2,
		cruiser: 3,
		battleship: 4,
		carrier: 5
	},
	playerTurn: "PLAYER",
	difficulty: 50
}

let TIMER = 1000;

$(document).ready(() => {
	gameRules.difficulty = +prompt("Select difficulty");
	console.log(gameRules.difficulty);

	initTable("player-board");
	initTable("cpu-board");
	playerTurn();
});

/**
 * play When you click on a cell
 * @author orozan
 */
function playerTurn() {
	$('#cpu-board td').on("click", function() {
		if (gameRules.playerTurn === "PLAYER") {
			if ($(this).attr("data-yet") === "0") {
				let position = $(this).attr("id").split("-");

				for (let el in gameRules.boatsSize) {
					// console.log(el, gameRules.boatsSize[el]);

					// Hit: can play once again
					if (CPUBoats[position[1]][position[2]] === gameRules.boatsSize[el]) {
						console.log(CPUBoats[position[1]][position[2]] + ": " + el + " Hit");
						gameRules.player[el]++;
						$(this).addClass(el + ' hit');

						if (gameRules.player[el] === gameRules.boatsSize[el]) {
							console.log(el + " sunk");
							$('#cpu-board').find('.' + el).removeClass("hit").addClass("sunk");
						}
					} 
				}

				// Missed: cpu turn
				if (CPUBoats[position[1]][position[2]] === 0) {
					console.log(CPUBoats[position[1]][position[2]] + ": Missed");
					$(this).addClass('missed');
					gameRules.playerTurn = "CPU";
					// setTimeout(CPUTurn, TIMER);
				}

				$(this).attr("data-yet", "1");
				gameOver(gameRules.player, () => setTimeout(CPUTurn, TIMER));
				// console.log(gameRules.player);
			} else {
				console.log("Yet clicked");
			}
		}
	});	
}

/**
 * CPUHitsABoat CPU chooses a Player's boat cell
 * @author orozan
 */
function CPUHitsABoat() {
	console.log("cpu Hit");
	let x = Math.floor(Math.random() * 10);
	let y = Math.floor(Math.random() * 10);
	let target = $('#player-board #cell-' + x + '-' + y);

	if (target.attr("data-yet") === "0") {
		for (let el in gameRules.boatsSize) {
			// Hit: can play another time
			if (PlayerBoats[x][y] === gameRules.boatsSize[el]) {
				console.log(PlayerBoats[x][y] + ": " + el + " Hit");
				gameRules.cpu[el]++;
				target.addClass(el + ' hit');

				if (gameRules.cpu[el] === gameRules.boatsSize[el]) {
					console.log(el + " sunk");
					$('#player-board').find('.' + el).removeClass("hit").addClass("sunk");
				}

				target.attr("data-yet", "1");
				gameOver(gameRules.cpu, () => setTimeout(CPUTurn, TIMER));
			} 
		}

		// Missed: cpu turn
		if (PlayerBoats[x][y] === 0) {
			CPUHitsABoat();
		}

	} else {
		console.log("Yet clicked");
		gameOver(gameRules.cpu, () => CPUHitsABoat());
	}
}

/**
 * CPUMissesABoat CPU chooses a Player's empty cell
 * @author orozan
 */
function CPUMissesABoat() {
	console.log("cpu Missed");
	let x = Math.floor(Math.random() * 10);
	let y = Math.floor(Math.random() * 10);
	let target = $('#player-board #cell-' + x + '-' + y);

	if (target.attr("data-yet") === "0") {
		for (let el in gameRules.boatsSize) {
			// Hit: can play another time
			if (PlayerBoats[x][y] === gameRules.boatsSize[el]) {
				CPUMissesABoat();
			} 
		}

		// Missed: cpu turn
		if (PlayerBoats[x][y] === 0) {
			target.addClass('missed');
			target.attr("data-yet", "1");
		}

	} else {
		console.log("Yet clicked");
		CPUMissesABoat();
	}

	gameRules.playerTurn = "PLAYER";
	console.log("**PLAYER**", gameRules.playerTurn);
}

/**
 * play When CPU chooses a cell
 * @author orozan
 */
function CPUTurn() {
	if (gameRules.playerTurn === "CPU") {
		console.log("**CPU**", gameRules.playerTurn);
		let turn = Math.floor(Math.random() * 100) + 1;
		console.log(turn, gameRules.difficulty);

		if (turn <= gameRules.difficulty) {
			CPUHitsABoat();
		} else {
			CPUMissesABoat();
		}
	}
}

/**
 * gameOver Every boats of a player are sunk
 * @author orozan
 * @params fail callback when all boats are not sunk
 */
function gameOver(check, fail) {
	console.log("CHECKING", check);
	if (
		check['destroyer'] === 2 && 
		check['cruiser'] === 3 && 
		check['battleship'] === 4 && 
		check['carrier'] === 5) {
		gameRules.playerTurn = "END";
		console.log("GAME OVER");
	} else {
		fail();
	}
}

/**
 * initTables Creates a table element
 * @author orozan
 * @args target string The table id
 */
function initTable(target) {
	let table = $('#wrapper div #' + target);

	for (let i = 0; i < 10; i++) {
		table.append("<tr id=row-" + i + ">");

		for (let j = 0; j < 10; j++) {
			let row = $("#" + target + " #row-" + i);
			row.append("<td id=cell-" + i + "-" + j + " data-yet=0></td>");
		}

		table.append("</tr>");
	}
}