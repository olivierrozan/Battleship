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

/* playerTurn: 
INIT
PLAYER
CPU
END
*/
const gameRules_init = {
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
	playerTurn: "INIT",
	difficulty: 0
}

let gameRules = {};

let TIMER = 1000;

$(document).ready(() => {
	initTable("player-board");
	initTable("cpu-board");
	initGame();

	$('.difficulty label').on("click", function() {
		$('.skill-go').removeAttr("disabled");
	});

	$('.skill-go').on("click", function() {
		$('#reset-game').show();
		let text = $('.difficulty input:checked').attr("id").split("-")[1];

		$('#skill-message').text(text).addClass(text).delay(200).fadeIn();

		$('.difficulty').fadeOut(200, () => {
			$(this).hide();
		});

		gameRules.playerTurn = "PLAYER";
		gameRules.difficulty = +$('.difficulty input:checked').val();
		$('#player-wrapper').css("opacity", "0.3");
		$('#cpu-wrapper').css("opacity", "1");
		playerTurn();
	});

	$('#reset-game').on("click", function() {
		initGame();
	});
});

/**
 * initGame Inits / resets the game
 * @author orozan
 */
function initGame() {
	$('#player-wrapper').css("opacity", "1");
	$('#cpu-wrapper').css("opacity", "0.3");
	$('#reset-game').hide();
	gameRules = JSON.parse(JSON.stringify(gameRules_init));
	$('.difficulty').show();
	$('.difficulty input:checked').prop("checked", false);
	$('#messages').empty();
	$('.skill-go').attr("disabled", "disabled").show();
	$('#skill-message').empty().removeClass().hide();
	$('td').removeAttr("class").attr("data-yet", "0");
}

/**
 * log Displays message
 * @author orozan
 * @params player string Player / CPU
 * @params x string x position
 * @params y string y position
 * @params boat string The hit boat
 * @params state string hit / sunk / missed
 */
function log(player, x, y, boat, state) {
	x = +x;
	let playerElement = "<span class=" + player + ">" + player + "</span>";
	let position = "<span>" + String.fromCharCode(65 + x) + "-" + y + "</span>";
	let boatElement = boat === "" ? "" : "<span>" + boat + "</span>";
	let stateElement = "<span>" + state + "</span>";
	$('#messages').prepend("<div>" + playerElement + position + boatElement + stateElement + "</div>");
}

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
					// Hit: can play once again
					if (CPUBoats[position[1]][position[2]] === gameRules.boatsSize[el]) {
						gameRules.player[el]++;
						$(this).addClass(el + ' hit');
						log("Player", position[1], position[2], el, "hit");

						if (gameRules.player[el] === gameRules.boatsSize[el]) {
							$('#cpu-board').find('.' + el).removeClass("hit").addClass("sunk");
							log("Player", position[1], position[2], el, "sunk");
						}

						gameOver(gameRules.player);
					} 
				}

				// Missed: cpu turn
				if (CPUBoats[position[1]][position[2]] === 0) {
					$(this).addClass('missed');
					log("Player", position[1], position[2], "", "missed");
					gameRules.playerTurn = "CPU";
					$('#player-wrapper').css("opacity", "1");
					$('#cpu-wrapper').css("opacity", "0.3");
					setTimeout(CPUTurn, TIMER);
				}

				$(this).attr("data-yet", "1");
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
	let x = Math.floor(Math.random() * 10);
	let y = Math.floor(Math.random() * 10);
	let target = $('#player-board #cell-' + x + '-' + y);

	if (target.attr("data-yet") === "0") {
		for (let el in gameRules.boatsSize) {
			// Hit: can play another time
			if (PlayerBoats[x][y] === gameRules.boatsSize[el]) {
				gameRules.cpu[el]++;
				target.addClass(el + ' hit');
				log("CPU", x, y, el, "hit");

				if (gameRules.cpu[el] === gameRules.boatsSize[el]) {
					$('#player-board').find('.' + el).removeClass("hit").addClass("sunk");
					log("CPU", x, y, el, "sunk");
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
			log("CPU", x, y, "", "missed");
			target.attr("data-yet", "1");
		}

	} else {
		console.log("Yet clicked");
		CPUMissesABoat();
	}

	gameRules.playerTurn = "PLAYER";
	console.log("**PLAYER**");
	$('#player-wrapper').css("opacity", "0.3");
	$('#cpu-wrapper').css("opacity", "1");
}

/**
 * play When CPU chooses a cell
 * @author orozan
 */
function CPUTurn() {
	if (gameRules.playerTurn === "CPU") {
		console.log("**CPU**");
		let turn = Math.floor(Math.random() * 100) + 1;
		// console.log(turn, gameRules.difficulty);

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
function gameOver(check, fail = null) {
	if (
		check['destroyer'] === 2 && 
		check['cruiser'] === 3 && 
		check['battleship'] === 4 && 
		check['carrier'] === 5) {
		
		$("#messages").prepend("<div>**" + gameRules.playerTurn + " Wins**</div>");
		gameRules.playerTurn = "END";
		console.log("GAME OVER");
	} else {
		if (fail !== null) fail();
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