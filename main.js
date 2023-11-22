document.addEventListener("DOMContentLoaded", function () {
    // The svg
    var svg = d3.select("#my_dataviz"),
      width = +svg.attr("width"),
      height = +svg.attr("height");
  
    // Rest of your JavaScript code starting from the Promise.all() block
    // ...
    // Map and projection
    

    // Data and color scale
    // var start_date='4/6/2020 0:00'
    // var end_date='4/11/2020 0:00'
    var data = new Map();
    var selectedStates = [];

    var colorScale = d3.scaleThreshold()
      .domain([0, 2, 4, 6, 8, 10])
      .range(d3.schemeBlues[7]);

    // Load external data and boot
    Promise.all([
      d3.json("StHimark.geojson"),
      // d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
      d3.csv("processed_data.csv")
    ]).then(function (files) {
      var topo = files[0];
      var csvData = files[1];
      console.log(csvData);

      var startDate = new Date('4/6/2020 0:00');
      var endDate = new Date('4/11/2020 0:00');

      // Filter the CSV data based on the date range
      var filteredData = csvData.filter(function (d) {
        var currentDate = new Date(d.time);
        return currentDate >= startDate && currentDate <= endDate;
      });

      // Group the filtered data by location and calculate the average impact
      var groupedData = d3.group(filteredData, d => d.location);

      var averagedImpact = new Map();
      groupedData.forEach((value, key) => {
        var totalImpact = value.reduce((acc, cur) => acc + parseFloat(cur.impact), 0);
        var averageImpact = totalImpact / value.length;
        averagedImpact.set(key, averageImpact);
      });

      console.log(averagedImpact);


      let projection = d3.geoMercator()
      .scale(135000)
      .center(d3.geoCentroid(topo))
      .translate([(width/2),height/2]);

      let path = d3.geoPath().projection(projection);
    
      // csvData.forEach(function (d) {
      //   data.set(d.code, +d.pop);
      // });

      let mouseOver = function(d) {
        console.log(d);
        // d3.select(".Country")
        //   .transition()
        //   .duration(200)
        //   // .style("opacity", .5)
        d3.select(this)
          .transition()
          .duration(200)
          // .style("opacity", 1)
          .style("stroke", "black")
          .style("stroke-width","2px")
      }

      let mouseLeave = function(d) {
        d3.select(this)
        .transition()
        .duration(200)
        .style("stroke", "black")
        .style("stroke-width","0px")
      }

      // let click = function(d) {
      //   const selected = d.properties.Id;
      //   const index = selectedStates.indexOf(selected);

      //   if (d && d.properties && d.properties.Id) {
      //     const selected = d.properties.Nbrhood;
      //     const index = selectedStates.indexOf(selected);

      //     if (index > -1) {
      //       // Remove from selected states
      //       selectedStates.splice(index, 1);
      //     } else {
      //       // Add to selected states
      //       selectedStates.push(selected);
      //     }
      //   }

      //   // Highlight selected states
      //   g.selectAll("path")
      //     .style("opacity", function(state) {
      //       if (!selectedStates) {
      //         d3.select(".Country")
      //           .transition()
      //           .duration(200)
      //           .style("opacity", 1)
      //         return 

      //       }
      //       else{
      //         return 0.5
      //       // return selectedStates.includes(state.properties.Nbrhood) ? 1 : 0.5;
      //       }
      //     });

      //   console.log(selectedStates);
      // };

      // Draw the map

      // var pathGenerator = d3.geoPath(projection);
      let g = svg.append("g")
      g.selectAll("path")
      .data(topo.features)
      .enter()
      .append("path")
      .attr("d",path)
      .attr("id", function(d){return d.properties.Id})
      .attr("class", function(d){ console.log(); return "Country" })
      .style("stroke-width", "2")
      .style("stroke","#fff")
      .attr("fill", function (d) {
        var location = d.properties.Id; // Assuming 'Nbrhood' holds the location value
        console.log(location)
        var averageImpact = averagedImpact.get(location.toString());
        return averageImpact ? colorScale(parseFloat(averageImpact)): '#ffffff';
        // return '#ffffff'

      })
      .on("mouseover", mouseOver )
      .on("mouseleave", mouseLeave )
      .on("click", function(d) {
          console.log(d);
          const selected = d.srcElement.__data__.properties.Id;
          const name = d.srcElement.__data__.properties.Nbrhood;
          console.log(selected)
          let index = selectedStates.indexOf(name);

          // if (d && d.properties && d.properties.Id) {
          //   const selected = d.properties.Nbrhood;
          //   const index = selectedStates.indexOf(selected);

            if (index > -1) {
              // Remove from selected states
              selectedStates.splice(index, 1);
            } else {
              // Add to selected states
              selectedStates.push(name);
            }
          // }

          // Highlight selected states
          g.selectAll("path")
            .style("opacity", function(state) {
              if (selectedStates.length===0){
                d3.select(".Country")
                .transition()
                .duration(200)
                .style("opacity", 1);

              }
              else{
              
              return selectedStates.includes(state.properties.Nbrhood) ? 1 : 0.2;
              }
            })
            // .on("click", mouseLeave);

          console.log(selectedStates);
          // mouseLeave();
      });

    }).catch(function (error) {
      console.log(error);
    });
    // Load external data and boot

  
  });
  