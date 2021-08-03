var myData;
var myDataApp;
var myDataClu;

//Load will call back the drawCoverageDetails function with data 
google.charts.load('current', {
    callback: function () {
      drawCoverageDetails(data);
      myData = data
    },
    packages: ['corechart']
});

//drawCoverageDetails is used for coverage based pie graph
function drawCoverageDetails(myData) {
  var data = google.visualization.arrayToDataTable(myData);

var options = {
  legend: 'none',
  pieSliceText: 'label',
  title: 'Total Coverage',
  pieStartAngle: 100,
};

  var chart = new google.visualization.PieChart(document.getElementById('piechart'));
  chart.draw(data, options);
};


