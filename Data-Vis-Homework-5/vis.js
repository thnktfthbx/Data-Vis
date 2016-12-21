


var dataFile = "./data/ehr.json",
	patternFile = "./data/patterns",
	randomize = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
	symptoms = 
		["stress",
        "ptsd",
        "speech",
        "anxiety",
        "depression",
        "headache",
        "sleep",
        "audiology",
        "vision",
        "neurologic",
        "alzheimer",
        "cognitive",
        "pcs",
        "endocrine",
		"none"],
	colorSet = 
		["#a6cee3",
		 "#1f78b4",
		 "#b2df8a",
		 "#33a02c",
		 "#fb9a99",
		 "#e31a1c",
		 "#fdbf6f",
		 "#ff7f00",
		 "#cab2d6",
		 "#6a3d9a",
		 "#ffff99",
		 "#b15928",
		 "#e7298a",
		 "#525252",
		 "#CCCCCC"],
	xScale,
	yScale,
	width,
	height,
	lPad = 40,
	rPad = 120,
	tPad = 15,
	bPad = 40,
	xAxis,
	yAxis,
	entryWidth,
	xmin,
	xmax;

function getDimensions() {
	width = window.innerWidth;
	height = window.innerHeight;
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

function setScales(data) {
	xmin = d3.min(data, function(d) { 
				return d3.min(d.encounters, function(e) {
						return e.i;
						});
					});
	xmax = d3.max(data, function(d) { 
				return d3.max(d.encounters, function(e) {
						return e.i;
						});
					});
	xScale = d3.scaleLinear()
		.range([lPad, width-rPad])
		.domain([xmin, xmax]);
		
	var yRange = [];
	data.forEach(function(d) {
		yRange.push(d.id);					  
	});
	yScale = d3.scaleBand()
		.range([tPad, height-bPad]).domain(yRange);
		
	xAxis = d3.axisTop().scale(xScale);

	yAxis = d3.axisLeft()
		.scale(yScale);
	
	entryWidth = (width-rPad-lPad)/(xmax-xmin);
}

function getColor(type){
	var c = "gray";
	for (i=0; i<symptoms.length;i++){
		if (type == symptoms[i]){
			c = colorSet[i];
		}
	}
	return c;
}

getDimensions();
var svg = d3.select("body")
		.append("svg")
		.attr("width", width + lPad + rPad)
		.attr("height", height + tPad + bPad)
		.append("g")
		.attr("transform", "translate(" + lPad + "," + tPad + ")"),
	g = svg.append("g").attr("transform", "translate(" + lPad + "," + tPad + ")");

//Set background to grey
	g.append("rect")
    	.attr("width", "110%")
    	.attr("height", "110%")
		.attr("x", -68)
		.attr("y", -28)
    	.attr("fill", "white");

function getEncounterType(encounter) {
	var type;
	//Determine which type of symptom the event is
	if(encounter.stress){
		type = "stress";
	}else if(encounter.ptsd){
		type = "ptsd";
	}else if(encounter.speech){
		type = "speech";
	}else if(encounter.anxiety){
		type = "anxiety";
	}else if(encounter.depression){
		type = "depression";
	}else if(encounter.headache){
		type = "headache";
	}else if(encounter.sleep){
		type = "sleep";
	}else if(encounter.audiology){
		type = "audiology";
	}else if(encounter.vision){
		type = "vision";
	}else if(encounter.neurologic){
		type = "neurologic";
	}else if(encounter.alzheimer){
		type = "alzheimer";
	}else if(encounter.cognitive){
		type = "cognitive";
	}else if(encounter.pcs){
		type = "pcs";
	}else if(encounter.endocrine){
		type = "endocrine";
	} else {
		type = "none";
	}
	return type;
}
		
function findPatterns(data, patterns) {
	var foundPatterns = [];
	for (patient in data){
		for (pat in patterns) {
			
			var patA = patterns[pat][0],
				patB = patterns[pat][1],
				foundA = false,
				posA = 0;
				
			for	(entry in data[patient].encounters){
				type = getEncounterType(data[patient].encounters[entry]);
				if(foundA){          //if the first part of the pattern is already found
					if(type == patB){  // and the second matches up
										//add an instance of that pattern for display
						temp = {	id:	data[patient].id,
									pattern: pat,
									position: (posA + data[patient].encounters[entry].i)/2
								};
						foundPatterns.push(temp);
					}else if(type == "none"){  //if the first is found and the next is type none, skip forward
					}else if(type == patA) {  //if it's a mismatch, check if we should restart looking for part b
						posA = data[patient].encounters[entry].i;
					}else {            // then the second part is a mismatch, start again.
						foundA = false;
					}
				}else if(type == patA){
					foundA = true;
					posA = data[patient].encounters[entry].i;
				}
			}
		}
	}
	return foundPatterns;
}

function makeGlyph(x, y, type, g, size){
	var sizeScale = (size/15.34);
	switch(randomize[parseInt(type)]){
		case 0:				//Full Circle
			g.append("circle")
			.attr("cx", x)
			.attr("cy", y + size/2)
            .attr("r", size/2)
            .style("fill", "black")
			.style("stroke", "black");
			break;
		case 1:				//Hollow Circle
			g.append("path")
			.attr("d", "M 15.712 3.132 c 6.937 0 12.581 5.644 12.581 12.58 c 0 6.938 -5.645 12.581 -12.581 12.581 c -6.937 0 -12.58 -5.645 -12.58 -12.581 C 3.132 8.775 8.775 3.132 15.712 3.132 M 15.712 0 C 7.035 0 0 7.034 0 15.712 c 0 8.679 7.035 15.713 15.712 15.713 c 8.677 0 15.712 -7.034 15.712 -15.713 C 31.425 7.034 24.389 0 15.712 0 L 15.712 0 Z")
			.style("stroke-width", 1)
			.style("stroke", "black")
			.style("fill", "black")
			.attr("transform", "translate(" + (x-size/2) + "," + y + ") scale(" + sizeScale*.5 + ")");
			break;
		case 2:				//X Shape
			g.append("path")
			.attr("d", "M 0.324 1.909 c -0.429 -0.429 -0.429 -1.143 0 -1.587 c 0.444 -0.429 1.143 -0.429 1.587 0 l 9.523 9.539 l 9.539 -9.539 c 0.429 -0.429 1.143 -0.429 1.571 0 c 0.444 0.444 0.444 1.159 0 1.587 l -9.523 9.524 l 9.523 9.539 c 0.444 0.429 0.444 1.143 0 1.587 c -0.429 0.429 -1.143 0.429 -1.571 0 l -9.539 -9.539 l -9.523 9.539 c -0.444 0.429 -1.143 0.429 -1.587 0 c -0.429 -0.444 -0.429 -1.159 0 -1.587 l 9.523 -9.539 L 0.324 1.909 Z")
			.style("stroke-width", 1)
			.style("stroke", "black")
			.style("fill", "black")
			.attr("transform", "translate(" + (x-size/2) + "," + (y+sizeScale) + ") scale(" + sizeScale*.6 + ")");
			break;
		case 3:				//Zig-Zag Horizontal
			g.append("path")
			.attr("d", "M 54.411 24.535 c -1.065 -1.239 -2.934 -0.96 -4.038 0 c -2.959 2.571 -5.746 5.317 -8.554 8.046 c -2.872 -2.587 -5.566 -5.357 -8.352 -8.046 c -0.556 -0.536 -1.171 -0.77 -1.775 -0.8 c -0.064 -0.006 -0.129 -0.003 -0.195 -0.004 c -0.064 0.002 -0.13 -0.002 -0.195 0.004 c -0.603 0.031 -1.22 0.265 -1.775 0.8 c -2.786 2.688 -5.479 5.458 -8.353 8.046 c -2.808 -2.729 -5.596 -5.475 -8.553 -8.046 c -1.104 -0.96 -2.973 -1.239 -4.039 0 c -2.583 3.002 -5.134 6.027 -7.807 8.949 c -2.48 2.712 1.548 6.763 4.04 4.039 c 2.065 -2.257 4.057 -4.576 6.046 -6.898 c 2.784 2.562 5.46 5.232 8.194 7.851 c 1.202 1.152 2.822 1.012 4.039 0 c 2.961 -2.457 5.668 -5.175 8.402 -7.873 c 2.732 2.698 5.44 5.416 8.402 7.873 c 1.216 1.012 2.836 1.152 4.038 0 c 2.733 -2.618 5.409 -5.289 8.194 -7.851 c 1.988 2.322 3.98 4.642 6.045 6.898 c 2.49 2.724 6.52 -1.326 4.04 -4.039 C 59.543 30.562 56.994 27.537 54.411 24.535 Z")
			.style("stroke-width", 1)
			.style("stroke", "black")
			.style("fill", "black")
			.attr("transform", "translate(" + (x-size/1.25) + "," + (y-sizeScale*4) + ") scale(" + sizeScale*.4 + ")");
			break;
		case 4:				//Equals Sign Horizontal
			g.append("path")
			.attr("d", "M 7.308 85.264 h 107.188 c 4.037 0 7.309 -3.271 7.309 -7.31 s -3.271 -7.309 -7.309 -7.309 H 7.308 C 3.271 70.646 0 73.916 0 77.954 S 3.271 85.264 7.308 85.264 M 7.308 51.158 h 107.188 c 4.037 0 7.309 -3.272 7.309 -7.309 c 0 -4.037 -3.271 -7.308 -7.309 -7.308 H 7.308 C 3.271 36.541 0 39.812 0 43.849 C 0 47.886 3.271 51.158 7.308 51.158 Z")
			.style("stroke-width", 1)
			.style("stroke", "black")
			.style("fill", "black")
			.attr("transform", "translate(" + (x-size/2) + "," + (y-sizeScale*0) + ") scale(" + sizeScale*.125 + ")");
			break;
		case 5:				//Angled Not-Equals Sign
			g.append("path")
			.attr("d", "M 7.308 75.519 C 3.271 75.519 0 78.789 0 82.827 c 0 4.036 3.271 7.31 7.308 7.31 h 18.897 l -3.496 3.495 c -2.855 2.854 -2.855 7.48 0 10.337 c 1.428 1.427 3.299 2.141 5.167 2.141 c 1.869 0 3.74 -0.714 5.167 -2.139 l 13.833 -13.834 h 67.621 c 4.037 0 7.31 -3.272 7.31 -7.31 s -3.271 -7.309 -7.31 -7.309 H 61.495 L 80.982 56.03 h 33.515 c 4.037 0 7.31 -3.272 7.31 -7.308 c 0 -4.037 -3.271 -7.309 -7.31 -7.309 H 95.602 l 13.24 -13.24 c 2.854 -2.855 2.854 -7.481 0 -10.336 c -2.855 -2.855 -7.479 -2.853 -10.334 0 L 74.932 41.414 H 7.308 C 3.271 41.414 0 44.685 0 48.723 c 0 4.036 3.271 7.308 7.308 7.308 H 60.31 L 40.821 75.519 H 7.308 Z")
			.style("stroke-width", 1)
			.style("stroke", "black")
			.style("fill", "black")
			.attr("transform", "translate(" + (x-size*-0.75) + "," + (y-sizeScale*-4) + ") scale(" + sizeScale*.125 + ") rotate(-245)");
			break;
		case 6:				//Single Line Horizontal
			g.append("path")
			.attr("d", "M 68.927 32.731 H 4.242 C 1.898 32.731 0 34.455 0 36.583 c 0 2.128 1.898 3.852 4.242 3.852 h 64.685 c 2.343 0 4.24 -1.724 4.24 -3.852 C 73.167 34.455 71.27 32.731 68.927 32.731 Z")
			.style("stroke-width", 1)
			.style("stroke", "black")
			.style("fill", "black")
			.attr("transform", "translate(" + (x-size/2) + "," + (y-sizeScale*8.5) + ") scale(" + sizeScale*.24 + "," + sizeScale*.45 + ")");
			break;
			
		case 7:				//Zig-Zag 45 degrees
			g.append("path")
			.attr("d", "M 54.411 24.535 c -1.065 -1.239 -2.934 -0.96 -4.038 0 c -2.959 2.571 -5.746 5.317 -8.554 8.046 c -2.872 -2.587 -5.566 -5.357 -8.352 -8.046 c -0.556 -0.536 -1.171 -0.77 -1.775 -0.8 c -0.064 -0.006 -0.129 -0.003 -0.195 -0.004 c -0.064 0.002 -0.13 -0.002 -0.195 0.004 c -0.603 0.031 -1.22 0.265 -1.775 0.8 c -2.786 2.688 -5.479 5.458 -8.353 8.046 c -2.808 -2.729 -5.596 -5.475 -8.553 -8.046 c -1.104 -0.96 -2.973 -1.239 -4.039 0 c -2.583 3.002 -5.134 6.027 -7.807 8.949 c -2.48 2.712 1.548 6.763 4.04 4.039 c 2.065 -2.257 4.057 -4.576 6.046 -6.898 c 2.784 2.562 5.46 5.232 8.194 7.851 c 1.202 1.152 2.822 1.012 4.039 0 c 2.961 -2.457 5.668 -5.175 8.402 -7.873 c 2.732 2.698 5.44 5.416 8.402 7.873 c 1.216 1.012 2.836 1.152 4.038 0 c 2.733 -2.618 5.409 -5.289 8.194 -7.851 c 1.988 2.322 3.98 4.642 6.045 6.898 c 2.49 2.724 6.52 -1.326 4.04 -4.039 C 59.543 30.562 56.994 27.537 54.411 24.535 Z")
			.style("stroke-width", 1)
			.style("stroke", "black")
			.style("fill", "black")
			.attr("transform", "translate(" + (x-size*-.2) + "," + (y-sizeScale*8) + ") scale(" + sizeScale*.33 + ") rotate(45)");
			break;
		case 8:				//Equals Sign 45 degrees
			g.append("path")
			.attr("d", "M 7.308 85.264 h 107.188 c 4.037 0 7.309 -3.271 7.309 -7.31 s -3.271 -7.309 -7.309 -7.309 H 7.308 C 3.271 70.646 0 73.916 0 77.954 S 3.271 85.264 7.308 85.264 M 7.308 51.158 h 107.188 c 4.037 0 7.309 -3.272 7.309 -7.309 c 0 -4.037 -3.271 -7.308 -7.309 -7.308 H 7.308 C 3.271 36.541 0 39.812 0 43.849 C 0 47.886 3.271 51.158 7.308 51.158 Z")
			.style("stroke-width", 1)
			.style("stroke", "black")
			.style("fill", "black")
			.attr("transform", "translate(" + (x-size*0) + "," + (y-sizeScale*2) + ") scale(" + sizeScale*.12 + ") rotate(45)");
			break;
		case 9:				//Single Line 45 degrees
			g.append("path")
			.attr("d", "M 68.927 32.731 H 4.242 C 1.898 32.731 0 34.455 0 36.583 c 0 2.128 1.898 3.852 4.242 3.852 h 64.685 c 2.343 0 4.24 -1.724 4.24 -3.852 C 73.167 34.455 71.27 32.731 68.927 32.731 Z")
			.style("stroke-width", 6)
			.style("stroke", "black")
			.style("fill", "black")
			.attr("transform", "translate(" + (x-size*-.1) + "," + (y-sizeScale*2) + ") scale(" + sizeScale*.2 + ") rotate(45)");
			break;
			
		case 10:				//Zig-Zag Vertical
			g.append("path")
			.attr("d", "M 54.411 24.535 c -1.065 -1.239 -2.934 -0.96 -4.038 0 c -2.959 2.571 -5.746 5.317 -8.554 8.046 c -2.872 -2.587 -5.566 -5.357 -8.352 -8.046 c -0.556 -0.536 -1.171 -0.77 -1.775 -0.8 c -0.064 -0.006 -0.129 -0.003 -0.195 -0.004 c -0.064 0.002 -0.13 -0.002 -0.195 0.004 c -0.603 0.031 -1.22 0.265 -1.775 0.8 c -2.786 2.688 -5.479 5.458 -8.353 8.046 c -2.808 -2.729 -5.596 -5.475 -8.553 -8.046 c -1.104 -0.96 -2.973 -1.239 -4.039 0 c -2.583 3.002 -5.134 6.027 -7.807 8.949 c -2.48 2.712 1.548 6.763 4.04 4.039 c 2.065 -2.257 4.057 -4.576 6.046 -6.898 c 2.784 2.562 5.46 5.232 8.194 7.851 c 1.202 1.152 2.822 1.012 4.039 0 c 2.961 -2.457 5.668 -5.175 8.402 -7.873 c 2.732 2.698 5.44 5.416 8.402 7.873 c 1.216 1.012 2.836 1.152 4.038 0 c 2.733 -2.618 5.409 -5.289 8.194 -7.851 c 1.988 2.322 3.98 4.642 6.045 6.898 c 2.49 2.724 6.52 -1.326 4.04 -4.039 C 59.543 30.562 56.994 27.537 54.411 24.535 Z")
			.style("stroke-width", 1)
			.style("stroke", "black")
			.style("fill", "black")
			.attr("transform", "translate(" + (x-size*-.6) + "," + (y-sizeScale*.5) + ") scale(" + sizeScale*.26 + ") rotate(90)");
			break;
		case 11:				//Equals Sign Vertical
			g.append("path")
			.attr("d", "M 7.308 85.264 h 107.188 c 4.037 0 7.309 -3.271 7.309 -7.31 s -3.271 -7.309 -7.309 -7.309 H 7.308 C 3.271 70.646 0 73.916 0 77.954 S 3.271 85.264 7.308 85.264 M 7.308 51.158 h 107.188 c 4.037 0 7.309 -3.272 7.309 -7.309 c 0 -4.037 -3.271 -7.308 -7.309 -7.308 H 7.308 C 3.271 36.541 0 39.812 0 43.849 C 0 47.886 3.271 51.158 7.308 51.158 Z")
			.style("stroke-width", 1)
			.style("stroke", "black")
			.style("fill", "black")
			.attr("transform", "translate(" + (x-size*-.6) + "," + (y-sizeScale*-.3) + ") scale(" + sizeScale*.12 + ") rotate(90)");
			break;
		case 12:				//Single Line Vertical
			g.append("path")
			.attr("d", "M 68.927 32.731 H 4.242 C 1.898 32.731 0 34.455 0 36.583 c 0 2.128 1.898 3.852 4.242 3.852 h 64.685 c 2.343 0 4.24 -1.724 4.24 -3.852 C 73.167 34.455 71.27 32.731 68.927 32.731 Z")
			.style("stroke-width", 8)
			.style("stroke", "black")
			.style("fill", "black")
			.attr("transform", "translate(" + (x-size*-.6) + "," + (y-sizeScale*-1) + ") scale(" + sizeScale*.2 + ") rotate(90)");
			break;
			
		case 13:				//Zig-Zag backwards 45 degrees
			g.append("path")
			.attr("d", "M 54.411 24.535 c -1.065 -1.239 -2.934 -0.96 -4.038 0 c -2.959 2.571 -5.746 5.317 -8.554 8.046 c -2.872 -2.587 -5.566 -5.357 -8.352 -8.046 c -0.556 -0.536 -1.171 -0.77 -1.775 -0.8 c -0.064 -0.006 -0.129 -0.003 -0.195 -0.004 c -0.064 0.002 -0.13 -0.002 -0.195 0.004 c -0.603 0.031 -1.22 0.265 -1.775 0.8 c -2.786 2.688 -5.479 5.458 -8.353 8.046 c -2.808 -2.729 -5.596 -5.475 -8.553 -8.046 c -1.104 -0.96 -2.973 -1.239 -4.039 0 c -2.583 3.002 -5.134 6.027 -7.807 8.949 c -2.48 2.712 1.548 6.763 4.04 4.039 c 2.065 -2.257 4.057 -4.576 6.046 -6.898 c 2.784 2.562 5.46 5.232 8.194 7.851 c 1.202 1.152 2.822 1.012 4.039 0 c 2.961 -2.457 5.668 -5.175 8.402 -7.873 c 2.732 2.698 5.44 5.416 8.402 7.873 c 1.216 1.012 2.836 1.152 4.038 0 c 2.733 -2.618 5.409 -5.289 8.194 -7.851 c 1.988 2.322 3.98 4.642 6.045 6.898 c 2.49 2.724 6.52 -1.326 4.04 -4.039 C 59.543 30.562 56.994 27.537 54.411 24.535 Z")
			.style("stroke-width", 1)
			.style("stroke", "black")
			.style("fill", "black")
			.attr("transform", "translate(" + (x-size*-.9) + "," + (y-sizeScale*-8) + ") scale(" + sizeScale*.26 + ") rotate(135)");
			break;
		case 14:				//Equals Sign backwards 45 degrees
			g.append("path")
			.attr("d", "M 7.308 85.264 h 107.188 c 4.037 0 7.309 -3.271 7.309 -7.31 s -3.271 -7.309 -7.309 -7.309 H 7.308 C 3.271 70.646 0 73.916 0 77.954 S 3.271 85.264 7.308 85.264 M 7.308 51.158 h 107.188 c 4.037 0 7.309 -3.272 7.309 -7.309 c 0 -4.037 -3.271 -7.308 -7.309 -7.308 H 7.308 C 3.271 36.541 0 39.812 0 43.849 C 0 47.886 3.271 51.158 7.308 51.158 Z")
			.style("stroke-width", 1)
			.style("stroke", "black")
			.style("fill", "black")
			.attr("transform", "translate(" + (x-size*-.9) + "," + (y-sizeScale*-8) + ") scale(" + sizeScale*.12 + ") rotate(135)");
			break;
		case 15:				//Single Line backwards 45 degrees
			g.append("path")
			.attr("d", "M 68.927 32.731 H 4.242 C 1.898 32.731 0 34.455 0 36.583 c 0 2.128 1.898 3.852 4.242 3.852 h 64.685 c 2.343 0 4.24 -1.724 4.24 -3.852 C 73.167 34.455 71.27 32.731 68.927 32.731 Z")
			.style("stroke-width", 8)
			.style("stroke", "black")
			.style("fill", "black")
			.attr("transform", "translate(" + (x-size*-.9) + "," + (y-sizeScale*-8) + ") scale(" + sizeScale*.2 + ") rotate(135)");
			break;
			
	}
}

d3.json(dataFile, function(error, data){
	if (error) throw error;
	d3.text(patternFile, function(er, p){
		if (er) throw error;	
		var ssv = d3.dsvFormat(" ");
		patterns = ssv.parseRows(p);
		
		getDimensions();
		setScales(data);
		var glyphs = findPatterns(data, patterns);
		for (patient in data){
			for	(entry in data[patient].encounters){
				//Find the type of encounter
				var type = getEncounterType(data[patient].encounters[entry]);
				//Determine the proper opacity, based on how far from the head injury
				var opac;
				if(data[patient].encounters[entry].i < 0){  //even is befor 0, so compare with xmin
					opac = (.7-(data[patient].encounters[entry].i/xmin)*.7) + .3;
				} else {
					opac = (.7-(data[patient].encounters[entry].i/xmax)*.7) + .3;	
				}
				
				g.append("rect")    //Add the rectangles for each entry
					.attr("class", "entry")
					.attr("x", xScale(data[patient].encounters[entry].i))
					.attr("y", yScale(data[patient].id))
					.attr("width", entryWidth)
					.attr("height", yScale.bandwidth()-1)
					.style("fill", getColor(type))
					.style("opacity", opac);
			}
		}
		
		
		for (n in glyphs) {	
			makeGlyph(xScale(glyphs[n].position), yScale(glyphs[n].id), glyphs[n].pattern, g, yScale.bandwidth()-1);	
		}
		
		g.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append("text")
			.attr("fill", "#000")
			.attr("transform", "rotate(-90)")
			.attr("y", -65)
			.attr("x", -(height/2.2))
			.attr("dy", "0.71em")
			.style("text-anchor", "end")
			.text("Patient ID");
		g.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + tPad/2 + ")")
			.call(xAxis)
			.append("text")
			.attr("fill", "#000")
			//.attr("transform", "rotate(-90)")
			.attr("y", -32)
			.attr("x", (width/2.2))
			.attr("dy", "0.71em")
			.style("text-anchor", "middle")
			.text("Order Before and After Head Injury");
		var thingHeight = 10;
		var lx = width - 100-rPad;
		var l2x = width - 275-rPad;
		var ly = height - symptoms.length*(thingHeight*2) - bPad;
		var l2y = height - patterns.length*(thingHeight*2) - bPad;
		g.append("g")
			.append("rect")
			.attr("class", "legend")
			.attr("height", symptoms.length*(thingHeight*2))
			.attr("width", 100)
			.attr("x", lx)
			.attr("y", ly)
			.style("fill", "gray")
			.style("opacity", .4)
			.style("stroke", "black")
			.style("stroke-width", 2);
		for (s in symptoms){
			g.append("circle")
			.attr("cx", lx + 10)
			.attr("cy", ly + (s)*thingHeight*2 + thingHeight)
            .attr("r", thingHeight/2)
            .style("fill", getColor(symptoms[s]))
			.style("stroke", "black")
			.style("stroke-width", 1);
			g.append("text")
			.attr("x", lx + 20)
			.attr("y", ly + (s)*thingHeight*2 + thingHeight + 4)
            .style("fill", "black")
			.style("stroke", "black")
			.style("stroke-width", 1)
			.text(symptoms[s]);
		}
		
		g.append("g")
			.append("rect")
			.attr("class", "legend")
			.attr("height", patterns.length*(thingHeight*2))
			.attr("width", 165)
			.attr("x", l2x)
			.attr("y", l2y)
			.style("fill", "gray")
			.style("opacity", .4)
			.style("stroke", "black")
			.style("stroke-width", 2);
		for (s in patterns){
			makeGlyph(l2x + 10, (l2y + (s)*thingHeight*2 + thingHeight/2), 
									   s, g, thingHeight);
			g.append("text")
			.attr("x", l2x + 20)
			.attr("y", l2y + (s)*thingHeight*2 + thingHeight + 4)
            .style("fill", "black")
			.style("stroke", "black")
			.style("stroke-width", 1)
			.text(patterns[s][0] + " -> " + patterns[s][1]);
		}
	/*	
		g.append("path")
			.attr("d", "M 54.411 24.535 c -1.065 -1.239 -2.934 -0.96 -4.038 0 c -2.959 2.571 -5.746 5.317 -8.554 8.046 c -2.872 -2.587 -5.566 -5.357 -8.352 -8.046 c -0.556 -0.536 -1.171 -0.77 -1.775 -0.8 c -0.064 -0.006 -0.129 -0.003 -0.195 -0.004 c -0.064 0.002 -0.13 -0.002 -0.195 0.004 c -0.603 0.031 -1.22 0.265 -1.775 0.8 c -2.786 2.688 -5.479 5.458 -8.353 8.046 c -2.808 -2.729 -5.596 -5.475 -8.553 -8.046 c -1.104 -0.96 -2.973 -1.239 -4.039 0 c -2.583 3.002 -5.134 6.027 -7.807 8.949 c -2.48 2.712 1.548 6.763 4.04 4.039 c 2.065 -2.257 4.057 -4.576 6.046 -6.898 c 2.784 2.562 5.46 5.232 8.194 7.851 c 1.202 1.152 2.822 1.012 4.039 0 c 2.961 -2.457 5.668 -5.175 8.402 -7.873 c 2.732 2.698 5.44 5.416 8.402 7.873 c 1.216 1.012 2.836 1.152 4.038 0 c 2.733 -2.618 5.409 -5.289 8.194 -7.851 c 1.988 2.322 3.98 4.642 6.045 6.898 c 2.49 2.724 6.52 -1.326 4.04 -4.039 C 59.543 30.562 56.994 27.537 54.411 24.535 Z")
			.style("stroke-width", 1)
			.style("stroke", "black")
			.style("fill", "black")
			.attr("transform", "translate(100, 100) scale(.5)");
			
	
		var dots = legend.selectAll("circle")
			.data(symptoms)
			.enter()
			.append("circle")
			.attr("cx", lx + 10)
			.attr("cy", function (d) { ly + symptoms.indexOf(d)*thingHeight*1.5})
            .attr("r", thingHeight/2)
            .style("fill", function(d) { return getColor(d); });
	*/
		
		
	});
});









