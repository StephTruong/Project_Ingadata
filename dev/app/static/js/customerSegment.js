//# dc.js Getting Started and How-To Guide
'use strict';

/* jshint globalstrict: true */
/* global dc,d3,crossfilter,colorbrewer */
// ### Create Chart Objects

// Create chart objects associated with the container elements identified by the css selector.
// Note: It is often a good idea to have these objects accessible at the global scope so that they can be modified or
// filtered by other page controls.

var categoryBubbleChart = dc.bubbleChart('#category-bubble-chart');
var boxADS    = dc.numberDisplay("#number-ADS");
var boxUPT    = dc.numberDisplay("#number-UPT");
var boxAUR    = dc.numberDisplay("#number-AUR");
var boxAAS    = dc.numberDisplay("#number-AAS");

d3.csv('/static/BWFakeData.csv', function (data) {
    // Since its a csv file we need to format the data a bit.
    var dateFormat = d3.time.format('%m/%d/%Y');
    var numberFormat = d3.format('.2f');
	var categoryLabel=[ "Fashionistas","Enthusiasts" ,"Big Potential", "Moderates","Discount Seekers"];

    data.forEach(function (d) {
        // d.dd = dateFormat.parse(d.date);
        // d.month = d3.time.month(d.dd); // pre-calculate month for better performance
        d.annualSpent = +d.annualSpent; // coerce to number
        d.numberDept  = +d.numberDept;
        d.ads = +d.ads;
        d.aur = +d.aur;
        d.upt = +d.upt;

    });

    //### Create Crossfilter Dimensions and Groups

    //See the [crossfilter API](https://github.com/square/crossfilter/wiki/API-Reference) for reference.
    var ndx = crossfilter(data);
    var all = ndx.groupAll();


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

  var average = function(d) {
      return d.count ? d.total / d.count : 0;
  };


//Chart plotting


    categoryBubbleChart /* dc.bubbleChart('#category-bubble-chart', 'chartGroup') */
        // (_optional_) define chart width, `default = 200`
        .width(700)
        // (_optional_) define chart height, `default = 200`
        .height(250)
        // (_optional_) define chart transition duration, `default = 750`
        .transitionDuration(1500)
        .margins({top: 10, right: 50, bottom: 30, left: 40})
        .dimension(catDim)
        //The bubble chart expects the groups are reduced to multiple values which are used
        //to generate x, y, and radius for each key (bubble) in the group
        .group(customerBehaviourGroup)
        // (_optional_) define color function or array for bubbles: [ColorBrewer](http://colorbrewer2.org/)
        .colors(colorbrewer.RdYlGn[9])
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
        .renderLabel(false)
        .label(function (p) {
            return p.category;
        })
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
          .formatNumber(d3.format("$.3r"))
          .valueAccessor(average)
          .group(avgAdsByCatGroup)

       boxUPT
          .formatNumber(d3.format(".3r"))
          .valueAccessor(average)
          .group(avgUptByCatGroup);
       
       boxAUR
          .formatNumber(d3.format("$.3r"))
          .valueAccessor(average)
          .group(avgAurByCatGroup);
     
       boxAAS
          .formatNumber(d3.format("$.3r"))
          .valueAccessor(average)
          .group(avgAasByCatGroup);


    //simply call `.renderAll()` to render all charts on the page
    dc.renderAll();
});