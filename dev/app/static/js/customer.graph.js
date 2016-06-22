
// initialization
$(document).ready(function() {
document.getElementById("customer_profile_graph").innerHTML = "";
customerProfilePlot("customer_profile_graph");

});

//plots the customer cluster graphs
function customerProfilePlot(target_div){
  var d3 = Plotly.d3;

  var WIDTH_IN_PERCENT_OF_PARENT = 100,
      HEIGHT_IN_PERCENT_OF_PARENT = 100;

  var gd3 = d3.select('#'+target_div)
      .style({
          width: WIDTH_IN_PERCENT_OF_PARENT + '%',
          'margin-left': (100 - WIDTH_IN_PERCENT_OF_PARENT) / 2 + '%',

          height: HEIGHT_IN_PERCENT_OF_PARENT + 'vh',
           'margin-top': (100 - HEIGHT_IN_PERCENT_OF_PARENT) / 2 + 'vh'
          
      });

  var gd = gd3.node();


   var categories=[ "Discount Seekers", "Moderates", "Big Potential", "Enthusiasts", "Fashionistas"]
   var counts= [400, 300, 290, 190, 80]
   var annualSpend= [50,200,250,600,1800]
   var dptShopped= [1.8, 1.9, 3.8, 6.5, 11.5]
   var labels= []
   for (i = 0; i < categories.length; i++) { 
    labels.push(categories[i]+ "<br />"+"count: "+counts[i]);

   }
   console.log(labels)
   var trace1 = {
  x: dptShopped,
  y: annualSpend,
  text: labels,
  mode: 'markers',
  category: categories,
  marker: {
    color: ['rgb(93, 164, 214)', 'rgb(255, 144, 14)',  'rgb(44, 160, 101)', 'rgb(255, 65, 54)'],
    size: counts,
    sizeref: 0.1,
    sizemode: 'area'
  }
};

var data = [trace1];

var layout = {
   hovermode:'closest',
  title: 'Customer Segmentation',
  showlegend: false,
   xaxis: {
    autorange: true,
    showgrid: true,
    zeroline: false,
    showline: false,
    autotick: true,
    ticks: '',
    showticklabels: true,
    title:"Number of Departments Shopped"
  },
  yaxis: {
    autorange: true,
    showgrid: true,
    zeroline: false,
    showline: false,
    autotick: true,
    ticks: '',
    showticklabels: true,
    title:"Average Annual Spending"

  }
};

Plotly.plot(gd, data, layout);

gd.on('plotly_click', function(data){
    var pts = '';
    for(var i=0; i < data.points.length; i++){
        pts = 'Category = '+data.points[i].data.category[data.points[i].pointNumber] + '\n\n';
        console.log(data)
    }
    alert('Closest point clicked:\n\n'+pts);
});

window.onresize = function() {
    Plotly.Plots.resize(gd);
};
}