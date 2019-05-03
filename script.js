let boats = [
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
}

$(document).ready(function() {
	// initTable("player-board");
	initTable("ia-board");

	$('#ia-board td').on("click", function() {
		if ($(this).attr("data-yet") === "0") {
			let position = $(this).attr("id").split("-");

			for (let el in gameRules.boatsSize) {
				console.log(el, gameRules.boatsSize[el]);

				if (boats[position[1]][position[2]] === gameRules.boatsSize[el]) {
					console.log(boats[position[1]][position[2]] + ": " + el + " Hit");
					gameRules.player[el]++;
					$(this).addClass(el + ' hit');

					if (gameRules.player[el] === gameRules.boatsSize[el]) {
						console.log(el + " sunk");
						$('.' + el).removeClass("hit").addClass("sunk");
					}
				} 

				if (boats[position[1]][position[2]] === 0) {
					console.log(boats[position[1]][position[2]] + ": Missed");
					$(this).addClass('missed');
				}
			}

			$(this).attr("data-yet", "1");
			console.log(gameRules.player);
		} else {
			console.log("Yet clicked");
		}
	});	
});

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