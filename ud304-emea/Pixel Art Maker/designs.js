"use strict";
let color = "#000000";
let inputHField = $( "#input_height" );
let inputWField = $( "#input_width" );
let canvaContainer = $( "#canva" );
let colorPicker = $( "#colorPicker" );
let canva;
// Build the grid and inject it into the page
function injectGrid( h, w, callback ) {
	const table = callback( h, w );
	if ( $( "#pixel_canvas" ).length ) {
		canvaContainer.empty();
	}
	document.getElementById( "canva" ).appendChild( table );
	canva = $( "#pixel_canvas" );
	mouseEvents();
}
let myGrid = function makeGrid( h, w ) {
	let detachedCanva = document.createElement( "table" );
	detachedCanva.setAttribute( "id", "pixel_canvas" );
	while ( h-- ) {
		let tr = document.createElement( "tr" );
		tr.className = "row";
		for ( let j = 0; j < w; j++ ) {
			let td = document.createElement( "td" );
			td.id = h + "x" + j;
			td.className = "cell";
			tr.appendChild( td );
		}
		detachedCanva.appendChild( tr );
	}
	return detachedCanva;
}
// Color cell
function painter( cell ) {
	if ( cell.is( "td" ) ) {
		$( cell ).css( 'background-color', color );
	}
}
// Delete cell
function ribbon( cell ) {
	if ( cell.is( "td" ) ) {
		$( cell ).css( 'background-color', "#FFFFFF" );
	}
}
// Color picker
function getColor() {
	color = $( "#colorPicker" ).val();
}
// Handler for .ready() called.
$( document ).ready(function() {
// Size submit
$( "#sizePicker" ).submit( function( event ) {
	const h = inputHField.val();
	const w = inputWField.val();
	injectGrid( h, w, myGrid );
	event.preventDefault();
} );
// Color change
colorPicker.change( function( event ) {
	getColor();
} );
});
// Mouse input
function mouseEvents() {
canva.mousedown( function( event ) {
	event.preventDefault();
	const target = $( event.target );
	let pressed = 0;
	if ( event.which === 1 ) {
		pressed = 1;
		painter( target );
	}
	if ( event.which === 3 ) {
		pressed = 3;
		ribbon( target );
	}
	//Add.hold("click") event listeners 
	canva.on( "mouseover", function( event ) {
		const target = $( event.target );
		if ( pressed == 1 ) {
			painter( target );
		}
		if ( pressed == 3 ) {
			ribbon( target );
		}
	} );
} );
// Remove them at button release
$( "body" ).on( "mouseup", function() {
	canva.off( "mouseover" );
} );
$( "body" ).on( "mouseleave", function() {
	canva.off( "mouseover" );
} );
// Prevent the context menu to fire 
canva.contextmenu( function() {
	return false;
} );
}