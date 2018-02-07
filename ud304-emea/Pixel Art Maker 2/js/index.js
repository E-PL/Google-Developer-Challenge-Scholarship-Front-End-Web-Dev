"use strict";

// variables declaration
let color = "#228dff";
let inputHField = $("#input_height");
let inputWField = $("#input_width");
let canvaContainer = $("#canva");
let colorPicker = $("#colorPicker");
let canva;
let search;
let keyword = "forest";
let searchIndex = 1;
let searchResults;
let numberOfResults;

//functions declaration

// Build the grid and inject it into the page
function injectGrid(h, w, callback) {
	const table = callback(h, w);
	if ($("#pixel_canvas").length) {
		canvaContainer.empty();
	}
	document.getElementById("canva").appendChild(table);
	canva = $("#pixel_canvas");
	let mE = mouseEvents();
	dimension(w);
}
let myGrid = function makeGrid(h, w) {
	let detachedCanva = document.createElement("table");
	detachedCanva.setAttribute("id", "pixel_canvas");
	while (h--) {
		let tr = document.createElement("tr");
		tr.className = "row";
		for (let j = 0; j < w; j++) {
			let td = document.createElement("td");
			td.id = h + "x" + j;
			td.className = "cell";
			tr.appendChild(td);
		}
		detachedCanva.appendChild(tr);
	}
	return detachedCanva;
};

// Set cell dimension
function dimension(w) {
	let cellWidth = ($("#canva").width() - 100) / w;
	if (cellWidth < 5) {
		cellWidth = 5;
	}
	$("#pixel_canvas tr td").css({
		height: cellWidth,
		width: cellWidth
	});
}

// Add the mouse event listeners to the table
function mouseEvents() {
	canva.mousedown(function(event) {
		event.preventDefault();
		const target = $(event.target);
		let pressed = 0;
		if (event.which === 1) {
			pressed = 1;
			painter(target);
		}
		if (event.which === 3) {
			pressed = 3;
			ribbon(target);
		}
		// 	//Add.hold("click") event listeners
		canva.on("mouseover", function(event) {
			const target = $(event.target);
			if (pressed == 1) {
				painter(target);
			}
			if (pressed == 3) {
				ribbon(target);
			}
		});

		// Remove continius drawing event listeners at button release and mouseout
		$("#canva").on("mouseup", function(event) {
			canva.off("mouseover");
			$("#canva").off("mouseup");
			event.preventDefault();
		});
		$("#canva").on("mouseleave", function(event) {
			canva.off("mouseover");
			$("#canva").off("mouseleave");
			event.preventDefault();
		});
		// disable the context menu on right click
		canva.contextmenu(function() {
			return false;
		});
	});
}

// Color cell
function painter(cell) {
	if (cell.is("td")) {
		$(cell).css("background-color", color);
	}
}

// Delete cell
function ribbon(cell) {
	if (cell.is("td")) {
		$(cell).css("background-color", "transparent");
	}
}

// Color picker
function getColor() {
	let col = $("#colorPicker").val();
	return col;
}

// color the table borders
function colorGrid() {
	$("#pixel_canvas tr td").css({
		"border-color": color
	});
	$("#color-grid").css({
		"background-color": color
	});
}

// flick search
function searchFlickr(keyword) {
	$("#canva").css("background-color", "transparent");
	// API call
	$.getJSON(
		"https://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?",
		{
			tags: keyword,
			tagmode: "any",
			format: "json"
		},
		function(data) {
			searchResults = data;
			numberOfResults = data.items.length;
			searchIndex = 1;
			let image_src = data.items[searchIndex]["media"]["m"].replace("_m", "_b");
			$(".container").css("background-image", "url('" + image_src + "')");
		}
	);
}

// show next flickr image in search results
function nextImage() {
	$("#canva").css("background-color", "transparent");
	$("#prevImage").prop("disabled", false);
	if (searchIndex <= numberOfResults) {
		searchIndex++;
		let image_src = searchResults.items[searchIndex]["media"]["m"].replace(
			"_m",
			"_b"
		);
		$(".container").css("background-image", "url('" + image_src + "')");
	} else {
		$("#nextImage").prop("disabled", true);
	}
}

// show previus flickr image in search results
function prevImage() {
	$("#canva").css("background-color", "transparent");
	if (searchIndex > 0) {
		searchIndex--;
		let image_src = searchResults.items[searchIndex]["media"]["m"].replace(
			"_m",
			"_b"
		);
		$(".container").css("background-image", "url('" + image_src + "')");
	} else {
		$("#prevImage").prop("disabled", true);
	}
}

// remove background image
function removeBackgroundImage() {
	$(".container").css("background-image", "none");
}

// Save your amazing pixel art as png using html2canvas and FileSaver.js
function screenShot() {
	html2canvas($("#canva"), {
		onrendered: function(canvas) {
			canvas.toBlob(function(blob) {
				saveAs(blob, "yourPixelArt.png");
			});
		}
	});
}

//set background-image url
function setBackground(url) {
	$(".container").css("background-image", "url(" + url + ")");
	$("#canva").css("background-color", "transparent");
	$("#noBackground").prop("disabled", false);
}

// set background color
function setBackgroundColor() {
	$("body").css("background-color", color);
	$("#canva").css("background-color", color);
	$("#colorBody").css("background-color", color);
}

// set event listeners for forms, buttons and colorpicker
function setEventListeners() {
	// add event listener for background color button
	$("#colorBody").on("click", function(event) {
		event.preventDefault();
		setBackgroundColor();
	});

	// add event listener for no background image button
	$("#noBackground").on("click", function(event) {
		event.preventDefault();
		removeBackgroundImage();
	});

	// add event listener for previous image button
	$("#prevImage").on("click", function(event) {
		event.preventDefault();
		prevImage();
	});

	// add event listener for next image button
	$("#nextImage").on("click", function(event) {
		event.preventDefault();
		nextImage();
		$("#prevImage").prop("disabled", false);
	});

	// add event listener for the flickr search form
	$("#imagesearch").on("submit", function(event) {
		event.preventDefault();
		keyword = $("#search").val();
		searchFlickr(keyword);
		$("#nextImage").prop("disabled", false);
		$("#noBackground").prop("disabled", false);
	});

	// add event listener for the table creation form
	$("#sizePicker").submit(function(event) {
		const h = inputHField.val();
		const w = inputWField.val();
		injectGrid(h, w, myGrid);
		$("#save").prop("disabled", false);
		event.preventDefault();
	});

	// add event listener for colorpicker change to cache color var
	$("#colorPicker").on("change", function(event) {
		color = getColor();
	});

	// add event listeners for hover coloring the grid and page coloring buttons
	$("#color-grid").hover(function() {
		$(this).css("background-color", color);
	});
	$("#colorBody").hover(function() {
		$(this).css("background-color", color);
	});
	$("#color-grid").mouseleave(function() {
		$(this).css("background-color", "transparent");
	});
	$("#colorBody").mouseleave(function() {
		$(this).css("background-color", "transparent");
	});

	// add event listener for the table borders coloring button
	$("#color-grid").on("click", function(event) {
		event.preventDefault();
		colorGrid();
	});

	// add event listener for the save image form
	$("#screenshot").submit(function(event) {
		event.preventDefault();
		screenShot();
	});

	// add event listener for the set background-image url form
	$("#backgroundSet").submit(function(event) {
		event.preventDefault();
		const url = $("#backgroundurl").val();
		setBackground(url);
	});
}

// end of function declations

// Handler for .ready() called.

$(document).ready(function() {
	// run the evol-colorpicker
	$("#colorPicker").colorpicker({ color: "#228dff", defaultPalette: "web" });

	// install all event listeners except mouse events targeting the pixel canvas
	setEventListeners();

	// create a starting canva with default dimentions
	const h = inputHField.val();
	const w = inputWField.val();
	injectGrid(h, w, myGrid);
});