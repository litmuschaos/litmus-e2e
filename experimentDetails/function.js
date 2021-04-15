var myData;
var myDataApp;
var myDataClu;

//Load will call back the drawExperimentDetails function with data 
google.charts.load('current', {
    callback: function () {
      drawExperimentDetails(data);
      myData = data
    },
    packages: ['corechart', 'bar']
});

//Load will call back the drawAppDetails function with data 
google.charts.load('current', {
  callback: function () {
    drawAppDetails(dataApp);
    myDataApp = dataApp
  },
  packages: ['table']
});

//Load will call back the drawClusterDetails function with data 
google.charts.load('current', {
  callback: function () {
    drawClusterDetails(dataClu);
    myDataClu = dataClu
  },
  packages: ['table']
});

//drawExperimentDetails is used for Experiment based bar graph
function drawExperimentDetails(myData) {
  var data = google.visualization.arrayToDataTable(myData)

  var materialOptions = {
    chart: {
      title: 'Experiment Details',
      subtitle: 'Experiment based coverage'
    },
    hAxis: {
      title: 'Total Coverage',
      minValue: 0,
    },
    vAxis: {
      title: 'Coverage'
    },
    colors: ['#db4437', '#4285f4'],
    bars: 'vertical'
  };
  
  var materialChart = new google.charts.Bar(document.getElementById('chart_div'));
  google.visualization.events.addListener(materialChart, 'select', selectHandler);
  materialChart.draw(data, materialOptions);
};

//selectHandler will redirect to master yaml for coverage details
function selectHandler(e) {
  window.location = "https://github.com/litmuschaos/litmus-e2e/blob/generic/.master-plan.yml";
};

//drawAppDetails is used for Application based coverage
function drawAppDetails(myDataApp) {
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Application based coverage');
  data.addColumn('boolean', 'Tested in e2e');
  data.addRows(myDataApp);

  var table = new google.visualization.Table(document.getElementById('table_div'));
  table.draw(data, {showRowNumber: true, width: '100%', height: '100%'});
};

//drawClusterDetails Cluster runtime based coverage
function drawClusterDetails(myDataClu) {
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Cluster runtime based coverage');
  data.addColumn('boolean', 'Tested in e2e');
  data.addRows(myDataClu);

  var table = new google.visualization.Table(document.getElementById('table_div_app'));
  table.draw(data, {showRowNumber: true, width: '100%', height: '100%'});
};