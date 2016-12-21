


var dataFile = "./data/ehr.json",
	patternFile = "./data/patterns",
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
		 "#525252"],
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
	console.log(entryWidth);
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
    	.attr("fill", "#CCCCCC");

d3.json(dataFile, function(error, data){
	if (error) throw error;
	d3.text(patternFile, function(er, p){
		if (er) throw error;	
		var ssv = d3.dsvFormat(" ");
		patterns = ssv.parseRows(p);
		
		getDimensions();
		setScales(data);
		
		for (patient in data){
			for	(entry in data[patient].encounters){
				var type;
				//Determine which type of symptom the event is
				if(data[patient].encounters[entry].stress){
					type = "stress";
				}else if(data[patient].encounters[entry].ptsd){
					type = "ptsd";
				}else if(data[patient].encounters[entry].speech){
					type = "speech";
				}else if(data[patient].encounters[entry].anxiety){
					type = "anxiety";
				}else if(data[patient].encounters[entry].depression){
					type = "depression";
				}else if(data[patient].encounters[entry].headache){
					type = "headache";
				}else if(data[patient].encounters[entry].sleep){
					type = "sleep";
				}else if(data[patient].encounters[entry].audiology){
					type = "audiology";
				}else if(data[patient].encounters[entry].vision){
					type = "vision";
				}else if(data[patient].encounters[entry].neurologic){
					type = "neurologic";
				}else if(data[patient].encounters[entry].alzheimer){
					type = "alzheimer";
				}else if(data[patient].encounters[entry].cognitive){
					type = "cognitive";
				}else if(data[patient].encounters[entry].pcs){
					type = "pcs";
				}else if(data[patient].encounters[entry].endocrine){
					type = "endocrine";
				} else {
					type = "none";
				}						
				
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
		var ly = height - symptoms.length*(thingHeight*2) - bPad;
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
			
	/*
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









