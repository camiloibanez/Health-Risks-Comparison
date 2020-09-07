// @TODO: YOUR CODE HERE!

function makeResponsive() {
    var svgArea = d3.select("body").select("svg")

    if (!svgArea.empty()) {
        svgArea.remove();
    };

    var svgWidth = window.innerWidth * 0.8;
    var svgHeight = window.innerHeight * 0.8;

    var margin = {
        top: 40,
        bottom: 80,
        left: 100,
        right: 50
    };

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight -margin.top - margin.bottom;

    var svg = d3.select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    var chosenXAxis = "age"; //income, healthcare
    var chosenYAxis = "poverty"; //obesity, smokes

    function xScale(censusData, chosenXAxis) {
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.85, d3.max(censusData, d => d[chosenXAxis]) * 1.15])
            .range([0, width]);

        return xLinearScale;
    };

    function yScale(censusData, chosenYAxis) {
        var yLinearScale = d3.scaleLinear()
            .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.85, d3.max(censusData, d => d[chosenYAxis]) * 1.15])
            .range([height, 0]);

        return yLinearScale;
    };

    function newXAxis(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);

        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);

        return xAxis;
    };

    function newYAxis(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);

        yAxis.transition()
            .duration(1000)
            .call(leftAxis);
        
        return yAxis;
    };

    function newCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
        circlesGroup.transition()
            .duration(1000)
            .attr("cx", d => newXScale(d[chosenXAxis]))
            .attr("cy", d => newYScale(d[chosenYAxis]));

        return circlesGroup;
    };

    function newStates(stateLabels, newXScale, chosenXAxis, newYScale, chosenYAxis) {
        stateLabels.transition()
            .duration(1000)
            .attr("x", d => newXScale(d[chosenXAxis]))
            .attr("y", d => newYScale(d[chosenYAxis]));

        return stateLabels;
    };

    function updateToolTip(circlesGroup, stateLabels, chosenXAxis, chosenYAxis) {
        var xLabel;
        var yLabel;

        if (chosenXAxis === "age") {
            xLabel = "age";
        }
        else if (chosenXAxis === "income") {
            xLabel = "income";
        }
        else {
            xLabel = "healthcare";
        };

        if (chosenYAxis === "poverty") {
            yLabel = "poverty";
        }
        else if (chosenYAxis === "obesity") {
            yLabel = "obesity";
        }
        else {
            yLabel = "smokes";
        };

        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([80, -60])
            .html(function(d) {
                if (chosenXAxis === "age") {
                    return (`${d.state}<br>${yLabel}: ${d[chosenYAxis]}%<br>${xLabel}: ${d[chosenXAxis]} yrs`);
                }
                else if (chosenXAxis === "income") {
                    return (`${d.state}<br>${yLabel}: ${d[chosenYAxis]}%<br>${xLabel}: $${d[chosenXAxis]}`);
                }
                else {
                    return (`${d.state}<br>${yLabel}: ${d[chosenYAxis]}%<br>${xLabel}: ${d[chosenXAxis]}%`);
                };
            });

        circlesGroup.call(toolTip);

        circlesGroup.on("mouseover", function(data) {
            toolTip.show(data);
        }).on("mouseout", function(data) {
            toolTip.hide(data);
        });

        stateLabels.on("mouseover", function(data) {
            toolTip.show(data);
        }).on("mouseout", function(data) {
            toolTip.hide(data);
        });

        return circlesGroup;
    };


    d3.csv("static/data/data.csv").then(function(censusData) {
        censusData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.age = +data.age;
            data.income = +data.income;
            data.healthcare = +data.healthcare;
            data.obesity = +data.obesity;
            data.smokes = +data.smokes;
        });

        var xLinearScale = xScale(censusData, chosenXAxis);

        var yLinearScale = yScale(censusData, chosenYAxis);

        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        var xAxis = chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);
        
        var yAxis = chartGroup.append("g")
            .call(leftAxis);

        var circlesGroup = chartGroup.selectAll("circle")
            .data(censusData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", window.innerWidth * 0.015)
            .attr("opacity", 0.7)
            .classed("stateCircle", true);

        var stateLabels = chartGroup.selectAll(".stateText")
            .data(censusData)
            .enter()
            .append("text")
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis]))
            .text(d => d.abbr)
            .classed("stateText", true)
            .attr("dy", 6);        

        var xLabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 30})`);

        var healthcareLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 0)
            .attr("value", "healthcare")
            .classed("inactive aText", true)
            .text("Doesn't have Healthcare (%)");

        var incomeLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "income")
            .classed("inactive aText", true)
            .text("Median Yearly Income ($)");

        var ageLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age")
            .classed("active aText", true)
            .text("Median Age (years)");

        var yLabelsGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)");
            
        var smokesLabel = yLabelsGroup.append("text")
            .attr("x", -(height/2))
            .attr("y", -65)
            .attr("value", "smokes")
            .classed("inactive aText", true)
            .text("Percent who Smoke (%)");

        var obesityLabel = yLabelsGroup.append("text")
            .attr("x", -(height/2))
            .attr("y", -45)
            .attr("value", "obesity")
            .classed("inactive aText", true)
            .text("Percent Obese (%)");

        var povertyLabel = yLabelsGroup.append("text")
            .attr("x", -(height /2))
            .attr("y", -25)
            .attr("value", "poverty")
            .classed("active aText", true)
            .text("Percent in Poverty (%)");


        var circlesGroup = updateToolTip(circlesGroup, stateLabels, chosenXAxis, chosenYAxis);

        xLabelsGroup.selectAll("text")
            .on("click", function() {
                var value = d3.select(this).attr("value");
                if (value !== chosenXAxis) {
                    chosenXAxis = value;

                    xLinearScale = xScale(censusData, chosenXAxis);

                    xAxis = newXAxis(xLinearScale, xAxis);

                    circlesGroup = newCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                    circlesGroup = updateToolTip(circlesGroup, stateLabels, chosenXAxis, chosenYAxis);

                    stateLabels = newStates(stateLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                    
                    if (chosenXAxis === "healthcare") {
                        healthcareLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }

                    else if (chosenXAxis === "income") {
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }

                    else {
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        ageLabel
                            .classed("active", true)
                            .classed("inactive",false);
                    };
                };
            });

            yLabelsGroup.selectAll("text")
                .on("click", function() {
                    var value = d3.select(this).attr("value");

                    if (value !== chosenYAxis) {
                        chosenYAxis = value;

                        yLinearScale = yScale(censusData, chosenYAxis);

                        yAxis = newYAxis(yLinearScale, yAxis);

                        circlesGroup = newCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                        circlesGroup = updateToolTip(circlesGroup, stateLabels, chosenXAxis, chosenYAxis);

                        stateLabels = newStates(stateLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);


                        if (chosenYAxis === "smokes") {
                            smokesLabel
                                .classed("active", true)
                                .classed("inactive", false);
                            obesityLabel
                                .classed("active", false)
                                .classed("inactive", true);
                            povertyLabel
                                .classed("active", false)
                                .classed("inactive", true);
                        }

                        else if (chosenYAxis === "obesity") {
                            smokesLabel
                                .classed("active", false)
                                .classed("inactive", true);
                            obesityLabel
                                .classed("active", true)
                                .classed("inactive", false);
                            povertyLabel
                                .classed("active", false)
                                .classed("inactive", true);
                        }

                        else {
                            smokesLabel
                                .classed("active", false)
                                .classed("inactive", true);
                            obesityLabel
                                .classed("active", false)
                                .classed("inactive", true);
                            povertyLabel
                                .classed("active", true)
                                .classed("inactive", false);
                        };
                    };
                });
    }).catch(function(error) {
        console.log(error);
    });
}

makeResponsive();

d3.select(window).on("resize", makeResponsive);