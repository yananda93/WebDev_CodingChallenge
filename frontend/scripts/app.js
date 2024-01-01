// Fetch data from the Flask API
const apiPlayers = "http://localhost:5000/players/";

var displayAttributes = ["Name", "Nationality", "National_Position", "Club", "Height", "Preffered_Foot", "Acceleration", "Dribbling"];
var numericalAttributes = ["Rating", "Height", "Weight", "Age",  
                            "Ball_Control", "Dribbling", "Marking", "Sliding_Tackle", "Standing_Tackle", "Aggression", "Reactions",
                            "Attacking_Position", "Interceptions", "Vision", "Composure", "Crossing", "Short_Pass", "Long_Pass", 
                            "Acceleration", "Speed", "Stamina", "Strength", "Balance", "Agility", "Jumping","Heading", "Shot_Power", 
                            "Finishing", "Long_Shots", "Curve", "Freekick_Accuracy", "Penalties", "Volleys", "GK_Positioning", "GK_Diving", 
                            "GK_Kicking", "GK_Handling", "GK_Reflexes"];
var categoricalAttributes = ["Nationality", "National_Position", "National_Kit", "Club", "Club_Position", "Club_Kit", "Contract_Expiry",
                            "Preffered_Foot", "Preffered_Position", "Work_Rate", "Weak_foot", "Skill_Moves", ];

var currentSortColumn = null;
var currentAsc = false;   
var selectedRow = null;   
var selectedPlayer = null;    


// barcharts parameters
const margin = {top: 30, right: 20, bottom: 50, left: 90};
const width = 320 - margin.left - margin.right;
const height = 320 - margin.top - margin.bottom;

// boxplots parameters
const margin1 = {top: 50, right: 30, bottom: 100, left: 30};
const width1 = 320 - margin1.left - margin1.right;
const height1 = 320 - margin1.top - margin1.bottom;

// const fillColor = "#69b3a2";
const fillColor = "#69b3a2";
const selectedColor = "orange";

//Function to fetch data from the API
async function fetchData(apiURL) {
    const response = await fetch(apiURL);
    const data = await response.json();
    renderDropdown(data, displayAttributes);
    renderTable(data, displayAttributes);
    renderPlots(data, displayAttributes);
}





function renderDropdown(data, displayAttributes) {
    var dropdown = d3.select("#table-columns-dropdown");
    var columns = Object.keys(data[0]);
    var displayStatus = {}; // Create a mapping to track the display status of each column
    columns.forEach(col => {
        displayStatus[col] = displayAttributes.includes(col);
    });

    // add select all checkbox
    var selectAll = d3.select("#select-all");
    selectAll.append("input")
            .attr("type", "checkbox")
            .attr("id", "select-all-checkbox")
            .property("checked", displayAttributes.length === columns.length)
            .on("change", function() {
                checkboxes.selectAll(".dropdown-item input[type='checkbox']").property("checked", this.checked);
                if (this.checked) {
                    displayAttributes = columns;
                } else {
                    displayAttributes = [];
                }
                columns.forEach(col => {
                    displayStatus[col] = displayAttributes.includes(col);
                });
                renderTable(data, displayAttributes);
                renderPlots(data, displayAttributes);
            })
    selectAll.append("label")
            .attr("for", "select-all-checkbox")
            .style("margin-left", "0.25rem")
            .text("Select All");


    var checkboxes = dropdown.selectAll("div")
        .data(Object.keys(data[0]))
        .enter()
        .append("div")
        .attr("class", "dropdown-item");
    
    checkboxes.append("input")
                .attr("type", "checkbox")
                .attr("id", d => d)
                // .attr("value", d => d)
                .property("checked", d => displayAttributes.includes(d))
                .on("change", function(d) {
                    displayStatus[this.id] = this.checked; // update the display status of the attribute
                    displayAttributes = columns.filter(col => displayStatus[col]); // update the display attributes
                    d3.select("#select-all-checkbox").property("checked", displayAttributes.length === columns.length) //update the select all checkbox
                    renderTable(data, displayAttributes); // render the table
                    renderPlots(data, displayAttributes);
                });

    checkboxes.append("label")
                .style("margin-left", "0.25rem")
                .attr("for", d => d)
                .text(d => d);
}

function renderTable(data, displayAttributes) {
    var table = d3.select("#players-table");
    table.selectAll("*").remove(); // clear the table
      
    var header = table.append("thead").append("tr")
                    .selectAll("th")
                    .data(displayAttributes)
                    .enter()
                    .append("th")
                    .style("cursor", "pointer")
                    .text(function(d) { return d; })
                    .on("mouseover", function(d) {
                        d3.select(this).selectAll("span.remove").style("visibility", "visible");
                    })
                    .on("mouseout", function(d) {
                        d3.select(this).selectAll("span.remove").style("visibility", "hidden");
                    })
                    .on("click", function(event, d) {  
                        
                        header.attr("class", "header"); // reset the header class
                        
                        if (currentSortColumn != d) {
                            currentSortColumn = d;
                            currentAsc = true;
                            
                        } else {
                            currentAsc = !currentAsc;
                            
                        }

                        // sort the rows
                        if (currentAsc){
                            rows.sort(function(a, b) {
                                return  a[d] < b[d]? -1: 1;
                            });
                            this.className = "asc";
                        }
                        else {
                            rows.sort(function(a, b) { 
                                return  a[d] > b[d]? -1: 1;
                            });

                            this.className = "des";
                        }

                    });

    // add remove symbol to the header
    d3.selectAll("th")
        .append("span")
        .classed("remove", true)
        .text("\u2715")
        .style("visibility", "hidden")
        .on("click", function(event, d) {
       
            // remove the corresponding header from the table
            d3.select(this.parentNode).remove();
    
            // remove the corresponding data column from the table
            d3.selectAll("tr").selectAll("td:nth-child(" + (displayAttributes.indexOf(d) + 1) + ")").remove();

            // remove the corresponding attribute from the displayAttributes
            displayAttributes = displayAttributes.filter(e => e !== d);

            d3.select("#" + d).property("checked", false); // uncheck the corresponding checkbox
            renderPlots(data, displayAttributes);
            
        }); 


        
    var rows = table.append("tbody")
                    .selectAll("tr")
                    .data(data)
                    .enter()
                    .append("tr")
                    .on("click", function(event, d) {
                        //update the color of the selected row and the corresponding bar and points in the plots
                        if (selectedRow != null) {
                            selectedRow.style("background-color", function(d, i) {  
                                return rows.nodes().indexOf(this) % 2 ? "#f0f0f0" : "white";
                            });

                            if (selectedPlayer === d.Name) { // same row is selected, unselect it
                                selectedRow = null;
                                selectedPlayer = null;
                                d3.selectAll(".bar").classed("selected", false);
                                d3.selectAll(".point").classed("selected", false).attr("r", 4);
                            }
                            else {
                                selectedRow = d3.select(this);
                                selectedPlayer = d.Name;
                                selectedRow.style("background-color", selectedColor);
                            }

                        }
                        else {
                            selectedRow = d3.select(this);
                            selectedPlayer = d.Name;
                            selectedRow.style("background-color", selectedColor);
                        }
                        if (selectedRow != null) {
                                d3.selectAll(".bar").classed("selected", false);
                                var bars = d3.selectAll(".bar").filter(function(d1) {
                                    var attribute = d1['attribute'];
                                    return d[attribute] == d1['key'];
                
                                });
        
                                bars.classed("selected", true);

                                var points = d3.selectAll(".point").filter(function(d1) {
                                    
                                    return d1.Name == d.Name;
                                });

                                d3.selectAll(".point").classed("selected", false).attr("r", 4);
                                
                                points.attr("r", 6);
                                points.classed("selected", true);
                        }

                        var name = d3.select("#selected-player");
                        name.selectAll("*").remove();
                        name.append("h4")
                        .text(selectedPlayer)
                        .style('text-align', 'center')
                        .style('padding', '0.25rem');
   
                    });
    rows.selectAll("td")
        .data(function(d) { 
            return displayAttributes.map(function(key) { return d[key]; }); 
        })
        .enter()
        .append("td")
        .text(function(d) { return d; });

}

function renderPlots(data, displayAttributes) {

    var charts = d3.select("#vis");
    charts.selectAll("*").remove(); // clear the table

    categoricalAttributes.forEach(attribute => {
        if (displayAttributes.includes(attribute)) {
            var groupedData = d3.rollup(data, v => v.length, d => d[attribute]); // group the data by the attribute and get frequency
            var groupedData = Array.from(groupedData, ([key, count]) => ({key, count}));
            groupedData.forEach(d => {
                d['attribute'] = attribute;
            });
            groupedData.sort(function(a, b) {return d3.descending(a['count'], b['count']); }); // sort the data by frequency
            groupedData = groupedData.filter(function(d) {   // remove null values
                return d.key != "" && d.key != null;
            });
            var chart = createChart(attribute, width + margin.left + margin.right, height + margin.top + margin.bottom, margin);
            renderBarchart(chart, groupedData, attribute);
        }
        });

    numericalAttributes.forEach(attribute => {
        if (displayAttributes.includes(attribute)) {
            var chart = createChart(attribute, width1 + margin1.left + margin1.right, height1 + margin1.top + margin1.bottom, margin1);
            renderBoxPlot(chart, data, attribute);

        }
    });   
}

function createChart(attribute, w, h, m) {
    var chart = d3.select("#vis")
                .append("div")
                .attr("class", "chart")
                .append("svg")
                // .style("background-color", "#f0f0f0f0")
                .attr("id", attribute)
                .attr("width", w)
                .attr("height",h)
                .append("g")
                .attr("transform", "translate(" + m.left + "," + m.top + ")");
    return chart;
}

// Plot frequency barchart for categorical attributes
function renderBarchart(chart, data, attribute) {

    // set X and Y axis
    var xScale = d3.scaleLinear()
                .domain([0, d3.max(data, (d) => d.count)])
                .range([0, width]);

    var yScale = d3.scaleBand()
                .domain(data.map(d => d.key))
                .range([0, height])
                .padding(0.1);


    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);
    xAxis.tickFormat(d3.format("d"));

    chart.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

    chart.append('g')
    .call(yAxis);

    // add X axis title
    chart.append("text")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .attr("x", width/2)
        .attr("y", height + margin.top + 5)
        .text("Count");

    // add Y axis title
    chart.append("text")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .attr("x", 0)
        .attr("y", -margin.top/2)
        .text(attribute)

    // draw the bars
    chart.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .classed("bar", true)
        .attr("x", xScale(0))
        .attr("y", d => yScale(d.key))
        .attr("width", d => xScale(d.count))
        .attr("height", yScale.bandwidth())
        .attr("fill", fillColor);


}



// Plot boxplot plot for numerical attributes
function renderBoxPlot(chart, data, attribute) {
    var new_data = data
    if (attribute == "Height" || attribute == "Weight") {
        new_data = JSON.parse(JSON.stringify(data))// make a copy of the data
        new_data.map(function(d) {
            d[attribute] = parseInt(d[attribute].split(' ')[0]);
        });
    }

        // prepare the data
    var input = new_data.map(function(d) {return d[attribute];})

    // Compute summary statistics used for the boxplot
    var q1 = d3.quantile(input, 0.25); 
    var median = d3.median(input)
    var q3 = d3.quantile(input, 0.75);
    var interQuantileRange = q3 - q1;

    var minVal = Math.max(q1 - 1.5 * interQuantileRange, Number(d3.min(input)));
    var maxVal = Math.min(q3 + 1.5 * interQuantileRange, Number(d3.max(input)));

    var sumstat = [{
        'minVal': minVal,
        'q1': q1,
        'median': median,
        'q3': q3,
        'maxVal': maxVal
    }]

    // set X and Y axis
    var xScale = d3.scaleLinear()
                .domain([Math.min(minVal, d3.min(input)), Math.max(maxVal, d3.max(input))])
                .range([0, width1]);


    var yScale = d3.scaleLinear()
                .domain([0, 4])      
                .range([3*height1/4, height1/4])
            
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale).tickFormat("").tickSize(0);
 
 
    chart.append("g")
        .attr("transform", "translate(0," + 3*height1/4 + ")")
        .call(xAxis);

    chart.append('g')
        .call(yAxis)
        .select(".domain") 
        .remove();

    // handle the case of height and weight
    var xAxisTitle = attribute;
    if (attribute == "Height") {
        xAxisTitle = "Height (cm)";
    }

    if (attribute == "Weight") {
        xAxisTitle = "Weight (kg)";
    }

    // add X axis title
    chart.append("text")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .attr("x", width1/2)
        .attr("y", 3*height1/4 + margin1.top )
        .text(xAxisTitle);



    // draw the box plot with individual points

    chart.selectAll("mainLine")
        .data(sumstat)
        .enter()
        .append("line")
        .attr("x1", function(d){return(xScale(d['minVal']))})
        .attr("x2",function(d){return(xScale(d['maxVal']))})
        .attr("y1", function(d){return(yScale(1.5))})
        .attr("y2", function(d){return(yScale(1.5))})
        .attr("stroke", "black")


    chart.selectAll("box")
        .data(sumstat)
        .enter()
        .append("rect")
        .attr("x", function(d){return(xScale(d['q1']))})
        .attr("y", yScale(2.5))
        .attr("height", yScale(1) - yScale(3) )
        .attr("width", function(d){return(xScale(d['q3']) - xScale(d['q1']))})
        .attr("stroke", "black")
        .style("fill", fillColor)
        .style("opacity", 0.3)


    // median line
    chart.selectAll("medianLine")
        .data(sumstat)
        .enter()
        .append("line")
        .attr("y1", yScale(0.5))
        .attr("y2", yScale(2.5))
        .attr("x1", function(d){return(xScale(d['median']))})
        .attr("x2", function(d){return(xScale(d['median']))})
        .attr("stroke", "black")
        .style("stroke-width", "2px")


    // draw the individual data points

    var jitterWidth = 30;
    chart.selectAll("indPoints")
        .data(new_data)
        .enter()
        .append("circle")
        .classed("point", true)
        .attr("cx", function(d){return(xScale(d[attribute]))})
        .attr("cy", function(d){return(yScale(2) + Math.random()*jitterWidth )})
        .attr("r", 4)
        .style("fill", fillColor)
        .style("opacity", 0.5)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("r", 6);
            d3.select(this).classed("selected", true);
            d3.select('body')
            .append('div')
            .attr("class","tooltip")   
            .style("opacity", 1)
            .html(d.Name + "<br/>" + attribute + ": " + d[attribute])
            .style("left", (event.pageX-55) + "px")
            .style("top", (event.pageY-65) + "px")

            
        })
        .on("mouseout", function(event, d) {
            d3.select(this).classed("selected", false);
            d3.select(this).attr("r", 4);
            d3.select(".tooltip").remove(); 
            
        });
}


fetchData(apiPlayers)




