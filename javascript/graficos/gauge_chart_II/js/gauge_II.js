var gaugeOptions = {min: 0, max: 280, yellowFrom: 200, yellowTo: 250,
  redFrom: 250, redTo: 280, minorTicks: 5};
var gauge;

function drawGauge() {
  gaugeData = new google.visualization.DataTable();
  gaugeData.addColumn('number', 'Motor');
  gaugeData.addColumn('number', 'Torpedo');
  gaugeData.addRows(2);
  gaugeData.setCell(0, 0, 120);
  gaugeData.setCell(0, 1, 80);

  gauge = new google.visualization.Gauge(document.getElementById('gauge_div'));
  gauge.draw(gaugeData, gaugeOptions);
}

function changeTemp(dir) {
  gaugeData.setValue(0, 0, gaugeData.getValue(0, 0) + dir * 25);
  gaugeData.setValue(0, 1, gaugeData.getValue(0, 1) + dir * 20);
  gauge.draw(gaugeData, gaugeOptions);
}