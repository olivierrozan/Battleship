////////// Globals variables //////////
let IABoats = [
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
	ia: {
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
	playerTurn: true,
	difficulty: 75
}

let TIMER = 1000;

$(document).ready(() => {
	initTable("player-board");
	initTable("ia-board");
	playerTurn();
});

/**
 * play When you click on a cell
 * @author orozan
 */
function playerTurn() {
	$('#ia-board td').on("click", function() {
		if (gameRules.playerTurn) {
			if ($(this).attr("data-yet") === "0") {
				let position = $(this).attr("id").split("-");

				for (let el in gameRules.boatsSize) {
					// console.log(el, gameRules.boatsSize[el]);

					// Hit: can play another time
					if (IABoats[position[1]][position[2]] === gameRules.boatsSize[el]) {
						console.log(IABoats[position[1]][position[2]] + ": " + el + " Hit");
						gameRules.player[el]++;
						$(this).addClass(el + ' hit');

						if (gameRules.player[el] === gameRules.boatsSize[el]) {
							console.log(el + " sunk");
							$('.' + el).removeClass("hit").addClass("sunk");
						}
					} 
				}

				// Missed: ia turn
				if (IABoats[position[1]][position[2]] === 0) {
					console.log(IABoats[position[1]][position[2]] + ": Missed");
					$(this).addClass('missed');
					gameRules.playerTurn = false;
					setTimeout(IATurn, TIMER);
				}

				$(this).attr("data-yet", "1");
				// console.log(gameRules.player);
			} else {
				console.log("Yet clicked");
			}
		}
	});	
}

function ChoosePlayerCell() {
	let x = Math.floor(Math.random() * 10);
	let y = Math.floor(Math.random() * 10);
	let target = $('#cell-' + x + '-' + y);

	// $('#cell-' + x + '-' + y).css('background-color', "#000");

	if (target.attr("data-yet") === "0") {
		for (let el in gameRules.boatsSize) {
			// Hit: can play another time
			if (PlayerBoats[x][y] === gameRules.boatsSize[el]) {
				console.log(PlayerBoats[x][y] + ": " + el + " Hit");
				gameRules.ia[el]++;
				target.addClass(el + ' hit');

				if (gameRules.ia[el] === gameRules.boatsSize[el]) {
					console.log(el + " sunk");
					$('.' + el).removeClass("hit").addClass("sunk");
				}

				setTimeout(IATurn, TIMER);
			} 
		}

		// Missed: ia turn
		if (PlayerBoats[x][y] === 0) {
			ChoosePlayerCell();
		}

		target.attr("data-yet", "1");
	} else {
		console.log("Yet clicked");
		ChoosePlayerCell();
	}
}

/**
 * play When IA chooses a cell
 * @author orozan
 */
function IATurn() {
	if (!gameRules.playerTurn) {
		console.log("**IA**", gameRules.playerTurn);
		let turn = Math.floor(Math.random() * 100) + 1;

		if (turn <= gameRules.difficulty) {
			// console.log(turn, "Hit");
			ChoosePlayerCell();
			
		} else {
			// console.log(turn, "Missed");
			target.addClass('missed');
			gameRules.playerTurn = true;
			console.log("**PLAYER**", gameRules.playerTurn);
		}
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