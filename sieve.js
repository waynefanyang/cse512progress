var aacolor = d3.scale.ordinal()
	.range(['#CCFF00','#FFFF00','#FF0000','#FF0066','#00FF66','#FF9900','#0066FF',
		'#66FF00','#6600FF','#33FF00','#00FF00','#CC00FF','#FFCC00','#FF00CC',
		'#0000FF','#FF3300','#FF6600','#99FF00','#00CCFF','#00FFCC'])
	.domain(['A','C','D','E','F','G','H','I','K','L','M',
		'N','P','Q','R','S','T','V','W','Y']);
var barmargin = {top: 5, right: 10, bottom: 0, left: 10},
	barwidth = 200,
	barheight = 20,
	barpadding = .1;
var barchartmargin = {top: 5, right: 10, bottom: 10, left: 50},
	barchartwidth = 250,
	barchartheight = 70;
		
var plac_scale = d3.scale.linear()
		.range([0, barwidth]);
var vac_scale = plac_scale;
		
/** With data in hand, make the visualization */
function generateVis(){
	
	plac_scale.domain([0, numplac]);
	vac_scale.domain([0, numvac]);
	
	generateSiteSelector();
}

function generateSiteSelector() {
	var margin = {top: 20, right: 30, bottom: 30, left: 40},
	width = 500 - margin.left - margin.right,
	height = 300 - margin.top - margin.bottom;
	
	var xScale = d3.scale.ordinal()
		.domain(d3.range(vaccine.sequence.length))
		.rangeBands([0, width], 0.05);
		
	var yScale = d3.scale.linear()
		.domain([0, 1])
		.range([height, 0]);
	
	var svg = d3.select("#overview").append("svg")
	    .attr("width", width)
	    .attr("height", height)
	  .append("g")
	  	.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	    .call(d3.behavior.zoom().scaleExtent([0, 1000]).on("zoom", zoom));
	
	svg.append("rect")
	    .attr("class", "overlay")
	    .attr("width", width)
	    .attr("height", height);
	
	var sitebars = svg.selectAll(".sitebars")
	    .data(vaccine.sequence)
	  .enter().append("rect")
	    .attr("x", function (d,i) { return xScale(i); })
		.attr("y", yScale(1))
		.attr("width", xScale.rangeBand())
		.attr("height", height - yScale(1))
		.attr("fill", function (d,i) {
			if (i%2 === 0) return "orange";
			else return "steelblue";
		});
	
	function zoom() {
	  sitebars.attr("transform", "translate(" + d3.event.translate[0]+",0)scale(" + d3.event.scale + ",1)");
	}
}