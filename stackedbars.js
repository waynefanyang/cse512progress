//This is an array of indices corresponding to the shown AA sites in figure 3 of the paper
var fig3array = [8, 21, 186, 198, 307, 358, 387, 399, 420, 330, 468, 480]

var legendspacing = {x: 25, y: 15};

var group_axis = d3.svg.axis()
	.scale(d3.scale.ordinal()
		.domain(["Vaccine", "Placebo"])
		.rangeRoundPoints([15,40]))
	.orient("left");

var mismatch_axis = d3.svg.axis()
	.scale(d3.scale.linear()
		.domain([0,1])
		.range([0, barwidth]))
	.orient("bottom")
	.ticks(5)
	.tickFormat(d3.format(".0%"));

var sites_svg = d3.select("#sites")
	.append("svg")
	.attr("width", barchartwidth + barchartmargin.left + barchartmargin.right)
	.attr("height", 0);

function update_AAsites(sites)
{
	//Use enter() and exit() to create, move, and remove AA site charts around
	var AAsites = sites_svg.selectAll(".AAsite")
		.data(sites, function(d) { return d; });
	sites_svg.transition() //makes the svg resize to fit charts
		.attr("height", AAsites[0].length*(barchartheight + barchartmargin.top + barchartmargin.bottom));
	
	AAsites.transition() //moves charts which are staying to accomadate new/removed charts
		.attr("transform", AAsite_translate);
	
	AAsites.exit().transition() //animates a removal by pushing chart downwards while scaling y component to 0
		.attr("transform", function(d, i) { return AAsite_shrink(d,i+1); })
		.remove();
		
	AAsites.enter().append("g")
		.attr("class", "AAsite")
		.attr("transform", AAsite_shrink) //start with 0 y scaling
		.each(create_AAsite_chart)
		.transition()
		.attr("transform", AAsite_translate); //scale y component from 0 to 1
}

function create_AAsite_chart(site)
{
	//Create a viz of two stacked horizontal stacked bar charts.
	//Passed the location to append viz and the index of the site of interest
	var vacnest = d3.nest()
	//count aas of each type at this site
		.key(function(d) { return d; })
		.sortKeys(d3.ascending)
		.rollup(function(d) { return d.length; })
		.entries(sequences.vaccine[site].filter(function(d) {
			return d != vaccine.sequence[site];
		}));
	var placnest = d3.nest()
		.key(function(d, i) { return d; })
		.sortKeys(d3.ascending)
		.rollup(function(d) { return d.length; })
		.entries(sequences.placebo[site].filter(function(d) {
			return d!= vaccine.sequence[site];
		}));
	var svg = d3.select(this);
	
	svg.append("g")
		.attr("class", "group axis")
		.call(group_axis);
	create_stacked_bar(svg, vacnest, vac_scale, 0);
	create_stacked_bar(svg, placnest, plac_scale, 25);
	svg.append("g")
		.attr("transform", "translate(10,55)")
		.attr("class", "mismatch axis")
		.call(mismatch_axis);
	
	//Create title
	svg.append("text")
		.attr("class", "aatitle")
		.attr("text-anchor", "middle")
		.attr("x", barchartwidth/2)
		.attr("y", 0)
		.text("Env " + envmap[site].hxb2Pos + " (" + vaccine.sequence[site]+ ") Mismatches");
	
	//Create legend
	var acids = d3.set(); //assemble list of amino acids present in chart
	vacnest.forEach(function(d) { acids.add(d.key); });
	placnest.forEach(function(d) { acids.add(d.key); });
	acids = acids.values().sort(d3.ascending);
	var legend = svg.append("g")
		.attr("class", "aalegend")
		.attr("transform", "translate(" + (barwidth + barmargin.right + barmargin.left) + ", -10)");
	acids.forEach(function(d,i)
	{
		var acid_g = legend.append("g")
			.attr("transform", AAlegend_translate(i));
		acid_g.append("rect")
			.attr("width", 10)
			.attr("height", 10)
			.style("fill", aacolor(d));
		acid_g.append("text")
			.attr("transform", "translate(12,9)")
			.text(d);
	});
}

function create_stacked_bar(svg, nest, scale, yloc)
{
	var bar = svg.append("g")
		.attr("width", barwidth + barmargin.left + barmargin.right)
		.attr("height", barheight + barmargin.top + barmargin.bottom)
		.append("g")
			.attr("transform", "translate(" + barmargin.left + "," + (barmargin.top+yloc) + ")");
	var sum = 0;
	nest.forEach(function(d)
	{
		d.x0 = sum;
		sum += d.values;
		d.x1 = sum;
	});
	
	bar.selectAll("rect")
		.data(nest)
		.enter().append("rect")
		.attr("x", function(d) {return scale(d.x0);})
		.attr("height", barheight)
		.attr("width", function(d) {return scale(d.x1) - scale(d.x0);})
		.style("fill", function(d) {return aacolor(d.key);});
}

function AAsite_translate(d, i)
{
	return "translate(" + barchartmargin.left + "," + (i * (barchartheight + barchartmargin.top + barchartmargin.bottom) + barchartmargin.top) + ") scale(1,1)"; 
}

function AAsite_shrink(d, i)
{
	return "translate(" + barchartmargin.left + "," + (i * (barchartheight + barchartmargin.top + barchartmargin.bottom) + barchartmargin.top) + ") scale(1,0)";
}

function AAlegend_translate(i)
{
	return "translate(" + (Math.floor(i/5) * legendspacing.x) + "," + ((i % 5) * legendspacing.y) + ")";
}