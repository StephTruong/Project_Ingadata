//# dc.js Getting Started and How-To Guide
'use strict';

/* jshint globalstrict: true */
/* global dc,d3,crossfilter,colorbrewer */
// ### Create Chart Objects

// Create chart objects associated with the container elements identified by the css selector.
// Note: It is often a good idea to have these objects accessible at the global scope so that they can be modified or
// filtered by other page controls.

var CN = d3.locale({
  "decimal": ".",
  "thousands": ",",
  "grouping": [3],
  "currency": ["¥", ""],
  "dateTime": "%a %b %e %X %Y",
  "date": "%m/%d/%Y",
  "time": "%H:%M:%S",
  "periods": ["AM", "PM"],
  "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  "shortDays": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  "months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  "shortMonths": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
});


var categoryBubbleChart = dc.bubbleChart('#category-bubble-chart');
var boxADS    = dc.numberDisplay("#number-ADS");
var boxUPT    = dc.numberDisplay("#number-UPT");
var boxAUR    = dc.numberDisplay("#number-AUR");
var boxAAS    = dc.numberDisplay("#number-AAS");
var ageDistributionChart = dc.rowChart('#age-distribution-chart');
var incomeDistributionChart = dc.rowChart('#income-distribution-chart');
var valueImpactChart = dc.compositeChart('#value-impact-chart');

//We set some variables for autoscaling dc charts.
var bubbleChartWidth = document.getElementById('category-bubble-chart').offsetWidth;
var ageDistributionChartWidth = document.getElementById('age-distribution-chart').offsetWidth;
var incomeDistributionChartWidth = document.getElementById('income-distribution-chart').offsetWidth;
var valueImpactChartWidth = document.getElementById('value-impact-chart').offsetWidth;

customerData = $.parseJSON(customerData);
// valueImpactData = $.parseJSON(valueImpactData);

var numberFormat = d3.format(',.2f');
var smallMoneyFormat =  CN.numberFormat('$,.2f');
var bigMoneyFormat =  CN.numberFormat('$,.0f');
var yearFormat = d3.time.format("%Y");
var categoryLabel=[ "Fashionistas","Enthusiasts" ,"Big Potential", "Moderates","Discount Seekers"];
var ageLabel=[ "<24 yo","25-34 yo" ,"35-44 yo", "45-54 yo","55-64 yo","+75 yo"];
var incomeLabel=[ "<10k","10-30k" ,"30-50k", "50-70k","+70k"];

customerData.forEach(function (d) {
    // d.dd = dateFormat.parse(d.date);
    // d.month = d3.time.month(d.dd); // pre-calculate month for better performance
    d.annualSpent = +d.annualSpent; // coerce to number
    d.numberDept  = +d.numberDept;
    d.ads = +d.ads;
    d.aur = +d.aur;
    d.upt = +d.upt;
    d.age = +d.age;
    d.income = +d.income;
});

//### Create Crossfilter Dimensions and Groups

//See the [crossfilter API](https://github.com/square/crossfilter/wiki/API-Reference) for reference.
var ndx = crossfilter(customerData);
var all = ndx.groupAll();




// Dimensions:

// Dimension by category
var catDim = ndx.dimension(function (d) {
    return d.category;
});

//To be able to synchronize across different charts, we need to replicate the dimension.
var catDim2 = ndx.dimension(function (d) {
    return d.category;
});
var catDim3 = ndx.dimension(function (d) {
    return d.category;
});
var catDim4 = ndx.dimension(function (d) {
    return d.category;
});
var catDim4 = ndx.dimension(function (d) {
    return d.category;
});
var catDim5 = ndx.dimension(function (d) {
    return d.category;
});

 var ageDim = ndx.dimension(function (d) {
    if (d.age <= 24) {
    return 0;}
    else if (d.age > 24 && d.age <= 34) {
        return 1;}
    else if (d.age > 34 && d.age <= 44) {
        return 2;}
    else if (d.age > 44 && d.age <= 54) {
        return 3;}
    else if (d.age > 54 && d.age <= 64) {
        return 4;}
    else if (d.age > 64 && d.age <= 74) {
        return 5;}
    else if (d.age > 74) {
        return 6;}
    else console.log("Age do not fit into bins.");
});

 var incomeDim = ndx.dimension(function (d) {
    if (d.income <= 10000) {
    return 0;}
    else if (d.income > 10000 && d.income <= 30000) {
        return 1;}
    else if (d.income > 30000 && d.income <= 50000) {
        return 2;}
    else if (d.income > 50000 && d.income <= 70000) {
        return 3;}
    else if (d.income > 70000) {
        return 4;}
    else console.log("Income do not fit into bins.");
});


// Groups
var customerBehaviourGroup =catDim.group().reduce(
    /* callback for when data is added to the current filter results */
    function (p, v) {
        ++p.count;
        p.numberDeptTotal +=v.numberDept;
        p.annualSpentTotal +=v.annualSpent;
        p.annualSpentAvg = p.annualSpentTotal / p.count;
        p.numberDeptAvg = p.numberDeptTotal/ p.count;
        return p;
    },
    /* callback for when data is removed from the current filter results */
    function (p, v) {
        --p.count;
        p.numberDeptTotal -=v.numberDept;
        p.annualSpentTotal -=v.annualSpent;
        p.annualSpentAvg = p.count ? p.annualSpentTotal / p.count: 0;
        p.numberDeptAvg = p.count ? p.numberDeptTotal/ p.count: 0;
        return p;
    },
    /* initialize p */
    function () {
        return {
            count: 0,
            numberDeptTotal: 0,
            annualSpentTotal: 0, 
            numberDeptAvg: 0, 
            annualSpentAvg: 0, 
        };
    }
);



var avgAdsByCatGroup = catDim2.groupAll().reduce(
    function (p, v) {
        ++p.count;
        p.total += v.ads;
        return p;
       
    },
    function (p, v) {
        --p.count;
        p.total -= v.ads;
        return p;
    },
    function () {
        return {count: 0, total: 0};
    }
);

var avgUptByCatGroup =   catDim3.groupAll().reduce(
    function (p, v) {
        ++p.count;
        p.total += v.upt;
        return p;
    },
    function (p, v) {
        --p.count;
        p.total -= v.upt;
        return p;
    },
    function () {
        return {count: 0, total: 0};
    }
);

var avgAurByCatGroup =   catDim4.groupAll().reduce(
    function (p, v) {
        ++p.count;
        p.total += v.aur;
        return p;
    },
    function (p, v) {
        --p.count;
        p.total -= v.aur;
        return p;
    },
    function () {
        return {count: 0, total: 0};
    }
);

var avgAasByCatGroup =   catDim5.groupAll().reduce(
    function (p, v) {
        ++p.count;
        p.total += v.annualSpent;
        return p;
    },
    function (p, v) {
        --p.count;
        p.total -= v.annualSpent;
        return p;
    },
    function () {
        return {count: 0, total: 0};
    }
);

var distByAgeGroup =   ageDim.group();
var distByIncomeGroup =   incomeDim.group();

var average = function(d) {
  return d.count ? d.total / d.count : 0;
};







//Chart plotting

categoryBubbleChart /* dc.bubbleChart('#category-bubble-chart', 'chartGroup') */
    // (_optional_) define chart width, `default = 200`
    .width(bubbleChartWidth)
    // (_optional_) define chart height, `default = 200`
    // .height(bubbleChartHeight)
    // (_optional_) define chart transition duration, `default = 750`
    .transitionDuration(1500)
    .margins({top: 10, right: 50, bottom: 30, left: 40})
    .dimension(catDim)
            //legend
    .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
    .brushOn(false)
    //The bubble chart expects the groups are reduced to multiple values which are used
    //to generate x, y, and radius for each key (bubble) in the group
    .group(customerBehaviourGroup, 'Monthly Index Average')
    // (_optional_) define color function or array for bubbles: [ColorBrewer](http://colorbrewer2.org/)
    .colors(colorbrewer.Dark2[8])
    //(optional) define color domain to match your data domain if you want to bind data or color
    .colorDomain([0, 5])
    //##### Accessors
    //Accessor functions are applied to each value returned by the grouping

    // `.colorAccessor` - the returned value will be passed to the `.colors()` scale to determine a fill color
    .colorAccessor(function (d) {
        return d.key;
    })
    // `.keyAccessor` - the `X` value will be passed to the `.x()` scale to determine pixel location
    .keyAccessor(function (p) {
        return p.value.numberDeptAvg;
    })
    // `.valueAccessor` - the `Y` value will be passed to the `.y()` scale to determine pixel location
    .valueAccessor(function (p) {
        return p.value.annualSpentAvg;
    })
    // `.radiusValueAccessor` - the value will be passed to the `.r()` scale to determine radius size;
    //   by default this maps linearly to [0,100]
    .radiusValueAccessor(function (p) {
        return p.value.count;
    })
    .maxBubbleRelativeSize(0.05)

    .x(d3.scale.linear().domain([0, 20]))
    .y(d3.scale.linear().domain([0, 3000]))
    .r(d3.scale.linear().domain([0, 200]))
    //##### Elastic Scaling

    //`.elasticY` and `.elasticX` determine whether the chart should rescale each axis to fit the data.
    .elasticY(true)
    .elasticX(true)
    //`.yAxisPadding` and `.xAxisPadding` add padding to data above and below their max values in the same unit
    //domains as the Accessors.
    .yAxisPadding(300)
    .xAxisPadding(2)
    // (_optional_) render horizontal grid lines, `default=false`
    .renderHorizontalGridLines(true)
    // (_optional_) render vertical grid lines, `default=false`
    .renderVerticalGridLines(true)
    // (_optional_) render an axis label below the x axis
    .xAxisLabel('Number of Department Shopped')
    // (_optional_) render a vertical axis lable left of the y axis
    .yAxisLabel('Average Annual Spending')
    
    //##### Labels and  Titles

    //Labels are displayed on the chart for each bubble. Titles displayed on mouseover.
    // (_optional_) whether chart should render labels, `default = true`
    // .renderLabel(false)
    .label(function (p) {
        return categoryLabel[p.key];
    })
    //legend
    .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))

    // (_optional_) whether chart should render titles, `default = false`
    .renderTitle(true)
    .title(function (p) {
        return [
            categoryLabel[p.key],
            'Number of Department Shopped: ' + numberFormat(p.value.numberDeptAvg),
            'Average Annual Spending: ' + numberFormat(p.value.annualSpentAvg) ,
            'Count: ' + numberFormat(p.value.count)
        ].join('\n');
    });
  

   //#### Box numbers
   boxADS
      .formatNumber(smallMoneyFormat)
      .valueAccessor(average)
      .group(avgAdsByCatGroup)

   boxUPT
      .formatNumber(smallMoneyFormat)
      .valueAccessor(average)
      .group(avgUptByCatGroup);
   
   boxAUR
      .formatNumber(smallMoneyFormat)
      .valueAccessor(average)
      .group(avgAurByCatGroup);
 
   boxAAS
      .formatNumber(bigMoneyFormat)
      .valueAccessor(average)
      .group(avgAasByCatGroup);
// age distribution

ageDistributionChart /* dc.rowChart('#day-of-week-chart', 'chartGroup') */
    .width(ageDistributionChartWidth)
    .margins({top: 20, left: 10, right: 10, bottom: 20})
    .group(distByAgeGroup)
    .dimension(ageDim)
    // Assign colors to each value in the x scale domain
    .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
    .label(function (d) {
        return ageLabel[d.key];
    })
    .label(function (d) {
        if (ageDistributionChart.hasFilter() && !ageDistributionChart.hasFilter(d.key))
            return ageLabel[d.key] + " (0%)";
        var label = ageLabel[d.key];
        if(all.value())
            label += " (" + Math.floor(d.value / all.value() * 100) + "%)";
        return label;
    })
    // Title sets the row text
    .title(function (d) {
        return ageLabel[d.key]+": "+d.value+ " individuals";
    })
    .elasticX(true)
    .xAxis().ticks(5);

incomeDistributionChart 
    .width(incomeDistributionChartWidth)
    .margins({top: 20, left: 10, right: 10, bottom: 20})
    .group(distByIncomeGroup)
    .dimension(incomeDim)
    // Assign colors to each value in the x scale domain
    .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
    // .label(function (d) {
    //     return ageLabel[d.key];
    // })
    .label(function (d) {
        if (incomeDistributionChart.hasFilter() && !incomeDistributionChart.hasFilter(d.key))
            return incomeLabel[d.key] + " (0%)";
        var label = incomeLabel[d.key];
        if(all.value())
            label += " (" + Math.floor(d.value / all.value() * 100) + "%)";
        return label;
    })
    // Title sets the row text
    .title(function (d) {
        return incomeLabel[d.key]+": "+d.value+ " individuals";
    })
    .elasticX(true)
    .xAxis().ticks(5);

//migration value impact
DrawValueImpactChart(valueImpactData);

//simply call `.renderAll()` to render all charts on the page
dc.renderAll();

window.onresize = function(event) {
  var newBubbleWidth = document.getElementById('category-bubble-chart').offsetWidth;
  var newAgeWidth = document.getElementById('age-distribution-chart').offsetWidth;
  var newIncomeWidth = document.getElementById('income-distribution-chart').offsetWidth;

  categoryBubbleChart.width(newBubbleWidth).transitionDuration(0);
  ageDistributionChart.width(newAgeWidth).transitionDuration(0);
  incomeDistributionChart.width(newIncomeWidth).transitionDuration(0);

    
  dc.renderAll();  
  categoryBubbleChart.transitionDuration(750);
  ageDistributionChart.transitionDuration(750);
  incomeDistributionChart.transitionDuration(750);

};
// // with default value
// // load the matrix -> migration pct 
// plot the chord diagram <- migration counts
//  update the impact chart 
//  save revenues in the table
//  // on update of matrix -> migration pct
//  // update chord diagram -> counts
//  update impact chart  <- migration pct -> revenues
//  save revenues in the table <- revenues

function DrawValueImpactChart (data) {
    //See the [crossfilter API](https://github.com/square/crossfilter/wiki/API-Reference) for reference.
    var ndxImpact = crossfilter(data);
    var allImpact = ndxImpact.groupAll();
    var yearDim = ndxImpact.dimension(function (d) { return  new Date(d["Year"],1,1)});
    var defaultGroup = yearDim.group().reduceSum(function (d) { return d["Default"]; });
    var alt1Group = yearDim.group().reduceSum(function (d) { return d["Alt1"]; });
    
    valueImpactChart
        .width(valueImpactChartWidth)
        // .width(1000)

        .margins({ top: 10, right: 10, bottom: 20, left: 40 })
        .dimension(yearDim)
        .transitionDuration(500)
        .elasticY(true)
        .brushOn(false)
        .legend(dc.legend().x(valueImpactChartWidth-200).y(100).itemHeight(13).gap(5))
        .title(function (d) {
            return [
            'Year: ' + yearFormat(d.key),
            'Expected Value (RMB): ' + numberFormat(d.value) 
        ].join('\n');
        })
        .yAxisPadding(300) 
        // .xAxisLabel('Years')
        // .yAxisLabel('Value (kRMB)',30)
        .x(d3.time.scale().domain([new Date(2016,1,1), new Date(2028,1,1)]))
        .xUnits(d3.time.years)

        .compose([
            dc.lineChart(valueImpactChart).group(defaultGroup, "Default").valueAccessor(function (d) {return d.value/1000;}).dashStyle([3,1,1,1]).renderDataPoints({radius: 2, fillOpacity: 0.8, strokeOpacity: 0.8}),
            dc.lineChart(valueImpactChart).group(alt1Group, "Alternative").valueAccessor(function (d) {return d.value/1000;}).renderDataPoints({radius: 2, fillOpacity: 0.8, strokeOpacity: 0.8})
        ]);

         // valueImpactChart.renderlet(function (chart) {
         //   // rotate x-axis labels
         //   chart.selectAll('g.x text')
         //     .attr('transform', 'translate(-10,10) rotate(315)')
         //     ;
         // })
         dc.renderAll();
}

var rowID=0;


//migration matrix 
function drawTable(data, tableContainer,chartContainer, valueChart) {
    var columnNames = [0,1,2,3,4,5,'Total']
    
    function getSum(total, num) {
        return total + num;
    }
    var dataPct =[];
    for(var i=0;i < data.length;i++){
        var sum = data[i].reduce(getSum, 0);
        dataPct[i]= data[i].map(function(e) {  
                return Math.round(e/sum*100*10)/10;
            });    
        // dataPct[i].push(Math.round(dataPct[i].reduce(getSum,0)))
        }


    var currentData = dataPct;

    // Charts
    var table = Table()
      .on('edit', function(d){ 
        currentData = d
       });

    function updateTable(_data){
        d3.select(tableContainer)
            .datum(_data)
            .call(table);
    }


   
    function updateValueImpactChart(_data, valueChart){
   
        console.log(_data)
        $.post(
            '/dashboard/migrationImpact', 
            data = JSON.stringify(_data), 
            function(data) { 
                // console.log(data)
                data = $.parseJSON(data);
                DrawValueImpactChart(data);
                insertRowRevenueTable(data,"#revenue-table",rowID);
                rowID++;
            })
    }



    // updateChart(data)
    updateTable([dataPct, columnNames]);
    drawRevenueTable("#revenue-table");

    
    
    updateValueImpactChart(currentData,valueChart);

    // updateChart(connectionData)

    // Update charts on reset
    d3.select('#impact-reset')
        .on("click", function(d, i){
        console.log("reset");
        // updateChart(connectionData);
        currentData = dataPct
        updateTable([currentData, columnNames]);
        // updateValueImpactChart( currentData,valueChart);

        });
    d3.select('#impact-update')
        .on("click", function(d, i){
        // console.log(d3.selectAll("table"))
        // console.log(currentData)
        // updateTable([data, columnNames])
        // updateChart(connectionData);
        // taking off the last columns (totals)
        var currentData2 = []
        for (var i = 0; i < currentData.length; i++) {
            currentData2.push(currentData[i].slice(0,-1))
        }
        updateValueImpactChart(currentData2,valueChart);
        });
}

drawTable(migrationData, "#migration-matrix", "#value-impact-chart");

//migration chart

function drawChordChart(data, container) {
    var width = 720,
    height = 720,
    outerRadius = Math.min(width, height) / 2 - 10,
    innerRadius = outerRadius - 24;
     
    var formatPercent = d3.format(". individuals");
     
    var arc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);
     
    var layout = d3.layout.chord()
    .padding(.04)
    .sortSubgroups(d3.descending)
    .sortChords(d3.ascending);
     
    var path = d3.svg.chord()
    .radius(innerRadius);
     
    var svg = d3.select(container).append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("id", "circle")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
     
    svg.append("circle")
    .attr("r", outerRadius);
    var segments= [{"name":0,"color":"#9ACD32"},{"name":1,"color":"#377DB8"},{"name":2,"color":"#F5DEB3"},{"name":3,"color":"#EE82EE"},{"name":4,"color":"#40E0D0"},{"name":5,"color":"#FF6347"}]
    var matrix = data


     
    // Compute the chord layout.
    layout.matrix(matrix);
     
    // Add a group per neighborhood.
    var group = svg.selectAll(".group")
    .data(layout.groups)
    .enter().append("g")
    .attr("class", "group")
    .on("mouseover", mouseover);
     
    // Add a mouseover title.
    // group.append("title").text(function(d, i) {
    // return segments[i].name + ": " + formatPercent(d.value) + " of origins";
    // });
     
    // Add the group arc.
    var groupPath = group.append("path")
    .attr("id", function(d, i) { return "group" + i; })
    .attr("d", arc)
    .style("fill", function(d, i) { return segments[i].color; });
     
    // Add a text label.
    var groupText = group.append("text")
    .attr("x", 6)
    .attr("dy", 15);
     
    groupText.append("textPath")
    .attr("xlink:href", function(d, i) { return "#group" + i; })
    .text(function(d, i) { return segments[i].name; }).attr("startOffset", "20%");
     
    // Remove the labels that don't fit. :(
    groupText.filter(function(d, i) { return groupPath[0][i].getTotalLength() / 2 - 16 < this.getComputedTextLength(); })
    .remove();
     
    // Add the chords.
    var chord = svg.selectAll(".chord")
    .data(layout.chords)
    .enter().append("path")
    .attr("class", "chord")
    .style("fill", function(d) { return segments[d.source.index].color; })
    .attr("d", path);
     
    // Add an elaborate mouseover title for each chord.
     chord.append("title").text(function(d) {
     return segments[d.source.index].name
     + " → " + segments[d.target.index].name
     + ": " + formatPercent(d.source.value)
     + "\n" + segments[d.target.index].name
     + " → " + segments[d.source.index].name
     + ": " + formatPercent(d.target.value);
     });
     
    function mouseover(d, i) {
    chord.classed("fade", function(p) {
    return p.source.index != i
    && p.target.index != i;
    });
    }

}
drawChordChart(migrationData, "#migration-chord-chart")


function drawRevenueTable(tableContainer) {
    var periods = []
    for (var i= 0; i< 13; i++){
        periods[i]=2016+i
    }

    var info = d3.select(tableContainer),
        thead = info.append("thead"),
        tbody = info.append("tbody");

    thead.append("tr")
    .append("th").text("")
    thead.select("tr")
     .selectAll("th")
     .data(periods, function(d) { return d; })
     .enter()
     .insert("th")
     .text(function (d) { return (d);  });
  

    
}

function insertRowRevenueTable(data,tableContainer){
   
    var rowIDText = ""
    if (rowID==0){
        rowIDText= "Default"
    }else{
        rowIDText = "Alt"+rowID
    }

    var data2 =[rowIDText];
    for(var i=0;i < data.length;i++){
        data2.push(bigMoneyFormat(Math.round(data[i]['Alt1'])))
    }

    console.log(data2)
    
    var tbody = d3.select(tableContainer).select("tbody")
    tbody.insert("tr").selectAll("td").data(data2, function(d){ return (d);}).enter().insert("td").text(function (d) { return (d);  });
    
};
