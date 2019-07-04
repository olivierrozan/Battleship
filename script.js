/*=====  Globals variables  ======*/

let CPUBoats = [];
let PlayerBoats = [];

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
let newPositions = {};

/*=====  Functions  ======*/

/**
 * placeBoats place CPU boat
 * @author orozan
 * type int boat type
 */
function placeBoats(type) {
	// 0: Horizontal, 1: vertical
	let direction = Math.floor(Math.random() * 2);
	let x = Math.floor(Math.random() * (10 - type));
	let y = Math.floor(Math.random() * (10 - type));
	let isOKToPlace = 0;
	
	for (let i = 0; i < type; i++) {
		if (direction === 0) {
			if (CPUBoats[x][y+i] !== 0) {
				isOKToPlace++;
			}
		} else {
			if (CPUBoats[x+i][y] !== 0) {
				isOKToPlace++;
			}
		}
	}

	if (isOKToPlace > 0) {
		placeBoats(type);
	} else {
		for (let i = 0; i < type; i++) {
			if (direction === 0) {
				CPUBoats[x][y+i] = type;
			} else {
				CPUBoats[x+i][y] = type;
			}
		}
	}
}

/**
 * initCPUPosition Inits CPU fleet position
 * @author orozan
 */
function initCPUPosition() {
	CPUBoats = [];
	
	for (let i = 0; i < 10; i++) {
		let tmp = Array(10).fill(0);
		CPUBoats.push(tmp);
	}

	for (let i = 5; i >= 2; i--) {
		placeBoats(i);
	}
}

/**
 * initGame Inits / resets the game
 * @author orozan
 */
function initGame() {
	gameRules = JSON.parse(JSON.stringify(gameRules_init));
	CPUBoats = [];
	PlayerBoats = [];
	$('#player-wrapper').removeClass("turn");
	$('#cpu-wrapper').addClass("turn");
	getInstructions("Choose a difficulty and place your boats (double click to change boat orientation)");
	$('#message-win').hide();
	$('.difficulty').show();
	$('.difficulty input:checked').prop("checked", false);
	$('#history>table').empty();
	$('#history div').remove();
	$('.skill-go').attr("disabled", "disabled").show();
	$('#skill-message').empty().removeClass().hide();
	$('td').removeAttr("class").attr("data-yet", "0");
	$('.fb').removeClass('f-sunk-boat');
	$( ".p-boat" ).draggable( "enable" );
}

/**
 * log Displays message
 * @author orozan
 * @params player  string  Player / CPU
 * @params x       string  x position
 * @params y       string  y position
 * @params boat    string  The hit boat
 * @params state   string  hit / sunk / missed
 */
function log(player, x, y, boat, state) {
	x = +x + 1;
	let playerElement = "<td class=" + player + ">" + player + "</td>";
	let position = "<td class='message-coord'>" + String.fromCharCode(64 + x) + "-" + (+y + 1) + "</td>";
	let boatElement = boat === "" ? "<td class='message-boat'></td>" : "<td class='message-boat'>" + boat + "</td>";
	let stateElement = "<td class='message-state'>" + state + "</td>";
	$('#history>table').prepend("<tr>" + playerElement + position + boatElement + stateElement + "</tr>");
}

/**
 * hitABoat When player / cpu hits a boat
 * @author orozan
 * @params _Boats        array   Player / CPU cells
 * @params x             string  x position
 * @params y             string  y position
 * @params target        string  The target
 * @params player        string  Player / CPU
 * @params _gameRules    object  player / cpu gameRules variable
 * @params boardElement  string  player / cpu board element
 * @params boardWrapper  string  player / cpu table
 */
function hitABoat(_Boats, x, y, target, player, _gameRules, boardElement, boardWrapper) {
	for (let el in gameRules.boatsSize) {
		// Hit: can play once again
		if (_Boats[x][y] === gameRules.boatsSize[el]) {
			_gameRules[el]++;
			target.addClass(el + ' hit');
			log(player, x, y, el, "hit");

			if (_gameRules[el] === gameRules.boatsSize[el]) {
				$(boardElement).find('.' + el).removeClass("hit").addClass("sunk");
				log(player, x, y, el, "sunk");
				$(boardWrapper + ' .boats-feedback').find('.f-' + el).addClass("f-sunk-boat");
			}

			if (player === "Player") {
				gameOver(gameRules.player);
			} else {
				target.attr("data-yet", "1");
				gameOver(gameRules.cpu, () => setTimeout(CPUTurn, TIMER));
			}
		} 
	}
}

/**
 * getInstructions Writes instructions
 * @author orozan
 * @params text string Instruction to display
 */
function getInstructions(text) {
	$('#instructions').text(text);
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
				hitABoat(CPUBoats, position[1], position[2], $(this), "Player", gameRules.player, '#cpu-board', '#cpu-wrapper');
				
				// Missed: cpu turn
				if (CPUBoats[position[1]][position[2]] === 0) {
					$(this).addClass('missed');
					log("Player", position[1], position[2], "", "missed");
					gameRules.playerTurn = "CPU";
					$('#player-wrapper').removeClass("turn");
					$('#cpu-wrapper').addClass("turn");
					getInstructions("CPU is playing");
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
		hitABoat(PlayerBoats, x, y, target, "CPU", gameRules.cpu, '#player-board', '#player-wrapper');

		// Missed: cpu turn
		if (PlayerBoats[x][y] === 0) {
			CPUHitsABoat();
		}

	} else {
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
	$('#cpu-wrapper').removeClass("turn");
	$('#player-wrapper').addClass("turn");
	getInstructions("Player is playing");
}

/**
 * play When CPU chooses a cell
 * @author orozan
 */
function CPUTurn() {
	if (gameRules.playerTurn === "CPU") {
		console.log("**CPU**");
		let turn = Math.floor(Math.random() * 100) + 1;

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
		
		$("#history").prepend("<div>**" + gameRules.playerTurn + " Wins**</div>");
		$('#message-win').show().find("span").text(gameRules.playerTurn + " Wins");
		gameRules.playerTurn = "END";
		$('#player-wrapper').addClass("turn");
		$('#cpu-wrapper').addClass("turn");
		getInstructions("Game Over");
		console.log("GAME OVER");

		for (let i = 0; i < 10; i++) {
			for (let j = 0; j < 10; j++) {
				let cpuCell = $('#cpu-board #cell-' + i + '-' + j);
				let playerCell = $('#player-board #cell-' + i + '-' + j);

				if (CPUBoats[i][j] !== 0 && !cpuCell.hasClass("hit") && !cpuCell.hasClass("sunk")) {
					$('#cpu-board #cell-' + i + '-' + j).addClass("reveal");
				}

				if (PlayerBoats[i][j] !== 0 && !playerCell.hasClass("hit") && !playerCell.hasClass("sunk")) {
					$('#player-board #cell-' + i + '-' + j).addClass("reveal");
				}
			}
		}
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
	let table = $('section div #' + target);

	for (let i = 0; i < 10; i++) {
		table.append("<tr id='row-" + i + "'>");

		for (let j = 0; j < 10; j++) {
			let row = $("#" + target + " #row-" + i);
			row.append("<td id=cell-" + i + "-" + j + " data-yet=0><div class='cell-r'></div></td>");
		}

		table.append("</tr>");
		$('#' + target).find('#cell-' + i + '-0').append("<div class='coordX'>" + (String.fromCharCode(i + 65)) + "</div>");
		$('#' + target).find('#cell-0-' + i).append("<div class='coordY'>" + (i + 1) + "</div>");
	}
}

/**
 * ucfirst Gets the first letter in uppercase
 * @author orozan
 * @return The first letter in uppercase
 */
String.prototype.ucfirst = function()
{
    return this.charAt(0).toUpperCase() + this.substr(1);
}

/**
 * placePlayerBoats Places draggable boat
 * @author orozan
 * @param type number The number of case of a boat
 */
function placePlayerBoats(type) {
	// 0: Horizontal, 1: vertical
	let direction = Math.floor(Math.random() * 2);
	let x = Math.floor(Math.random() * (10 - type));
	let y = Math.floor(Math.random() * (10 - type));
	let isOK = 0;
	
	for (let i = 0; i < type; i++) {
		if (direction === 0) {
			if ($('#player-board #cell-' + x + '-' + (y + i)).attr("data-cell") === "busy") {
				isOK++;
			}
		} else {
			if ($('#player-board #cell-' + (x + i) + '-' + y).attr("data-cell") === "busy") {
				isOK++;
			}
		}
	}

	if (isOK > 0){
		placePlayerBoats(type);
	} else {
		let boat = "<div class='p-boat p-boat-" + type + "-" + direction + "' data-dir='" + direction + "' data-boat='" + type + "'></div>";
		$('#player-board #cell-' + x + '-' + y).find('.cell-r').append(boat);

		for (let i = 0; i < type; i++) {
			if (direction === 0) {
				$('#player-board #cell-' + x + '-' + (y + i)).attr("data-cell", "busy");
			} else {
				$('#player-board #cell-' + (x + i) + '-' + y).attr("data-cell", "busy");
			}
		}

		newPositions[type] = {"top": -16, "left": -16};
	}
}

/**
 * hitbox Prevents boats from overlapping
 * @author orozan
 * @params ui Object draggable element
 * @return overlap boolean can move boat or not 
 */
function hitbox(ui) {
	let overlap = false;

    $('.p-boat').each(function() {
        if (this != ui.helper[0]) { // Not the one being dragged
            let left = $(this).offset().left;
            let top = $(this).offset().top;
            overlap = !(ui.offset.left + ui.helper.width() < left ||
                        ui.offset.left > left + $(this).width() ||
                        ui.offset.top + ui.helper.height() < top ||
                        ui.offset.top > top + $(this).height());
            return !overlap; // Break out when true
        }
    });

    return overlap;
}

/**
 * getNewPositions Gets the new boats positions after drag n drop
 * @author orozan
 * @params type string boat
 * @return {a, b} object the new boats positions
 */
function getNewPositions(type) {
	let oldCoord = $('.p-boat[data-boat=' + type + ']').closest('td').attr("id").split("-");
	let oldPos = -16;
	let leftResult = (newPositions[type].left - oldPos) / 32;
	let topResult = (newPositions[type].top - oldPos) / 32;
	
	return {
		a: +oldCoord[1] + topResult,
		b: +oldCoord[2] + leftResult
	};
}

/**
 * drag_drop Player's boats Drag n drop
 * @author orozan
 */
function drag_drop() {
	$('.p-boat').draggable({
		snap: '#player-board td',
		revert: 'invalid',
		containment: '#player-board',
		zIndex: 100,
        drag: (e, ui) => {
        	let overlap = hitbox(ui);

            if (overlap) {
            	$(e.target).css("border-color", "#dc3545");
            } else {
            	$(e.target).css("border-color", "#007bff");
            }
        },
        start: (e) => {
        	let target = $(e.target);
        	target.css("border-color", "#007bff");

        	let type = target.attr("data-boat");
        	let direction = target.attr("data-dir");

			let data = getNewPositions(type);

			for (let i = 0; i < type; i++) {
				if (direction === "0") {
					$('#player-board #cell-' + data.a + '-' + (data.b+i)).removeAttr("data-cell");
				} else {
					$('#player-board #cell-' + (data.a+i) + '-' + data.b).removeAttr("data-cell");
				}
			}
        },
        stop: (e) => {
        	let target = $(e.target);
        	target.css("border-color", "#007bff");
        	newPositions[target.attr("data-boat")] = target.position();

        	let type = target.attr("data-boat");
        	let direction = target.attr("data-dir");
   			
   			let data = getNewPositions(type);

			for (let i = 0; i < type; i++) {
				if (direction === "0") {
					$('#player-board #cell-' + data.a + '-' + (data.b+i)).attr("data-cell", "busy");
				} else {
					$('#player-board #cell-' + (data.a+i) + '-' + data.b).attr("data-cell", "busy");
				}
			}
        }
	});

	$('#player-board').droppable({
	    drop : (e, ui) => {
	        let overlap = hitbox(ui);

            ui.draggable.draggable( 'option', 'revert', overlap );
	    }
	});
}

/**
 * findNewBoatPosition Gets the new boats position and writes it into PlayerBoats
 * @author orozan
 * @params type number The boat id
 */
function findNewBoatPosition(type) {
	let dir = +$('.p-boat[data-boat=' + type + ']').attr("data-dir");

	let data = getNewPositions(type);

	for (let i = 0; i < type; i++) {
		if (dir === 1) {
			PlayerBoats[data.a+i][data.b] = type;
		} else {
			PlayerBoats[data.a][data.b+i] = type;
		}
	}
}

/**
 * initPlayerPosition Inits the player boats position
 * @author orozan
 */
function initPlayerPosition() {
	for (let i = 0; i < 10; i++) {
		let tmp = Array(10).fill(0);
		PlayerBoats.push(tmp);
	}

	for (let i = 5; i >= 2; i--) {
		findNewBoatPosition(i);
	}
}

/**
 * switchBoatPosition Switches horizontal / vertical boat position on double click
 * @author orozan
 */
function switchBoatPosition() {
	$('.p-boat').on("dblclick", (e) => {
		if (gameRules.playerTurn === "INIT") {
			let target = $(e.target);
			let type = target.attr('data-boat');
			let oldDirection = target.attr('data-dir');

			let data = getNewPositions(type);

			// Si l'ancienne direction est verticale
			if (oldDirection === "1") {
				let offset = data.b + +type;
				let isOK = 0;

				for (let i = 1; i < type; i++) {
					if ($('#player-board #cell-' + data.a + '-' + (data.b+i)).attr("data-cell") === "busy") {
						isOK++;
					}
				}

				// Si le bateau ne dépasse pas le tableau
				if (offset <= 10 && isOK === 0) {
					// La nouvelle direction est horizontale
					let newDirection = oldDirection === "0" ? "1" : "0";
					target.removeClass("p-boat-" + type + "-" + oldDirection).addClass("p-boat-" + type + "-" + newDirection).attr("data-dir", newDirection);

					$('#player-board #cell-' + data.a + '-' + data.b).attr("data-cell", "busy");
					for (let i = 1; i < type; i++) {
						$('#player-board #cell-' + data.a + '-' + (data.b+i)).attr("data-cell", "busy");
						$('#player-board #cell-' + (data.a+i) + '-' + data.b).removeAttr("data-cell");
					}
				} else {
					console.log("OOB: cannot flip");
					target.addClass("blink");
					setTimeout(() => {
						target.removeClass("blink");
					}, 1000);
				}
			} else {
				// Si l'ancienne direction est horizontale
				let offset = data.a + +type;
				let isOK = 0;

				for (let i = 1; i < type; i++) {
					if ($('#player-board #cell-' + (data.a+i) + '-' + data.b).attr("data-cell") === "busy") {
						isOK++;
					}
				}

				// Si le bateau ne dépasse pas le tableau
				if (offset <= 10 && isOK === 0) {
					// La nouvelle direction est verticale
					let newDirection = oldDirection === "0" ? "1" : "0";
					target.removeClass("p-boat-" + type + "-" + oldDirection).addClass("p-boat-" + type + "-" + newDirection).attr("data-dir", newDirection);

					$('#player-board #cell-' + data.a + '-' + data.b).attr("data-cell", "busy");
					for (let i = 1; i < type; i++) {
						$('#player-board #cell-' + data.a + '-' + (data.b+i)).removeAttr("data-cell");
						$('#player-board #cell-' + (data.a+i) + '-' + data.b).attr("data-cell", "busy");
					}
				} else {
					console.log("OOB");
				}
			}
		}
	});
}

/**
 * play Allows player to play after moving boats and choosing a difficulty
 * @author orozan
 */
function play() {
	$('.skill-go').on("click", function() {
		initPlayerPosition();
		initCPUPosition();
		let text = $('.difficulty input:checked').attr("id").split("-")[1].ucfirst();

		$('#skill-message').text(text).addClass(text).delay(200).fadeIn();

		$('.difficulty').fadeOut(200, () => {
			$(this).hide();
		});

		gameRules.playerTurn = "PLAYER";
		gameRules.difficulty = +$('.difficulty input:checked').val();
		$('#cpu-wrapper').removeClass("turn");
		$('#player-wrapper').addClass("turn");
		getInstructions("Player is playing");
		playerTurn();
		$( ".p-boat" ).draggable( "disable" );
	});
}

/*=====  Document init  ======*/

$(document).ready(() => {
	initTable("player-board");
	initTable("cpu-board");
	initGame();

	for (let i = 5; i >= 2; i--) {
		placePlayerBoats(i);
	}

	drag_drop();
	switchBoatPosition();

	$('.difficulty label').on("click", function() {
		$('.skill-go').removeAttr("disabled");
	});

	play();

	$('#reset-game').on("click", function() {
		initGame();
	});
});