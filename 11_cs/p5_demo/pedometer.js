
let datalist = [];
// set the dimensions and margins of the graph
var margin = {top: 20, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 410 - margin.top - margin.bottom;


(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', event => {
    let connectButton = document.querySelector("#connect");
    let statusDisplay = document.querySelector('#status');
    let port;

    function isNumeric(value) {
	    return /^\d+$/.test(value);
	}

    function connect() {
      port.connect().then(() => {
        statusDisplay.textContent = '';
        connectButton.textContent = 'Disconnect';

        console.log("connected");

        port.onReceive = data => {
          let textDecoder = new TextDecoder();
          let decodedData = parseInt(textDecoder.decode(data), 10);
          if (isNumeric(decodedData)){
            console.log(decodedData);
			// Shift all elements 1 place to the left
			// for (let i=1; i < numPoints; i++ ) {
			// 	path[i-1] = path[i];
			// }

			// Add new point to the end of the array
            // datalist.push(decodedData)
            let currDate = new Date()
            let datestr = String(currDate.getHours()) + "-" + String(currDate.getMinutes()) + "-" + String(currDate.getSeconds())
            datalist.push({timestamp: datestr, val: decodedData})
            // if (datalist.length == 0){
            //     datalist.push({ind: 1, val: decodeddatalist});
            // }
            // else{
            //     datalist.push({ind: datalist[datalist.length - 1].ind+1, val: decodedData});
            // }
            console.log(datestr);
            
          }

          drawgraph();
        };
      
        port.onReceiveError = error => {
          console.error(error);
        };
      }, error => {
        statusDisplay.textContent = error;
      });
    }

    connectButton.addEventListener('click', function() {
      if (port) {
        port.disconnect();
        connectButton.textContent = 'Connect';
        statusDisplay.textContent = '';
        port = null;
      } else {
        serial.requestPort().then(selectedPort => {
          port = selectedPort;
          connect();
        }).catch(error => {
          statusDisplay.textContent = error;
        });
      }
    });

    serial.getPorts().then(ports => {
      if (ports.length === 0) {
        statusDisplay.textContent = 'No device found.';
      } else {
        statusDisplay.textContent = 'Connecting...';
        port = ports[0];
        connect();
      }
    });

  });
})();


//Read the data
function drawgraph() {
    d3.select("svg").remove();
    var parseDate = d3.timeParse("%H-%M-%S");

var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom+50)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

    // function(d){
    //   return { date : d3.timeParse("%Y-%m-%d")(d.date), value : d.value }
    // },
    var x = d3.scaleTime()
      .domain(d3.extent(datalist, function(d) { console.log(parseDate(d.timestamp)); return parseDate(d.timestamp); }))
      .range([ 0, width ]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, d3.max(datalist, function(d) { return +d.val; })+20])
      .range([ height, 0 ]);
    svg.append("g")
      .call(d3.axisLeft(y));

    svg.append("path")
      .datum(datalist)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x(parseDate(d.timestamp)) })
        .y(function(d) { return y(d.val) })
        ) 

    svg.append("text")             
    .attr("transform",
          "translate(" + (width/2) + " ," + 
                          (height + margin.top + 10) + ")")
    .style("text-anchor", "middle")
    .text("Time");

    svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Total Steps");  

    svg.append("text")             
      .attr("transform",
            "translate(" + (width/2) + " ," + 
                           (-5) + ")")
      .style("text-anchor", "middle")
      .text("Step Counter");
};