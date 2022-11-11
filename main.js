"use strict";

const path = "driving.csv";

async function fetchData(path) {
  const response = d3.csv(path, d3.autoType);
  return response;
}

const data = await fetchData(path);
console.log(data);

const margin = { top: 25, right: 25, bottom: 25, left: 45 };
const width = 800 - margin.left - margin.right;
const height = 650 - margin.top - margin.bottom;

const svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const x = d3
  .scaleLinear()
  .domain(d3.extent(data.map((d) => d.miles)))
  .nice()
  .range([0, width]);

const y = d3
  .scaleLinear()
  .range([height, 0])
  .domain(d3.extent(data.map((d) => d.gas)))
  .nice();

const xAxis = d3
  .axisBottom()
  .scale(x)
  .ticks(width / 80);
const yAxis = d3.axisLeft().scale(y).ticks(null, "$");

const xGroup = svg
  .append("g")
  .attr("class", "axis x-axis")
  .attr("transform", `translate(0, ${height})`);

const yGroup = svg.append("g").attr("class", "axis y-axis");

// draw axes
svg
  .append("g")
  .attr("class", "axis x-axis")
  .call(xAxis)
  .attr("transform", `translate(0, ${height})`);

svg.append("g").attr("class", "axis y-axis").call(yAxis);

svg
  .append("text")
  .attr("x", width - 180)
  .attr("y", height - 5)
  .attr("class", "axis-label")
  .attr("font-weight", 600)
  .text("Miles per person per year");

svg
  .append("text")
  .attr("x", 10)
  .attr("y", 10)
  .attr("class", "axis-label")
  .attr("font-weight", 600)
  .text("Cost per gallon");

// generate labels (years)
const label = svg
  .append("g")
  .attr("font-family", "sans-serif")
  .attr("font-size", 12)
  .selectAll("g")
  .data(data)
  .join("g")
  .attr("transform", (d) => `translate(${x(d.miles)},${y(d.gas)})`)
  .attr("opacity", 1);

label
  .append("text")
  .text((d) => d.year)
  .each(position)
  .call(halo);

// plots circles (done last to prevent years messing it up)
svg
  .selectAll("circle")
  .data(data)
  .enter()
  .append("circle")
  .attr("cx", (d) => x(d.miles))
  .attr("cy", (d) => y(d.gas))
  .attr("r", 6)
  .style("fill", "white")
  .style("stroke", "black");

// add grid lines
xGroup.call(xAxis).call((g) => g.select(".domain").remove());
xGroup
  .selectAll(".tick line")
  .clone()
  .attr("y2", -height)
  .attr("stroke-opacity", 0.3);

yGroup.call(yAxis).call((g) => g.select(".domain").remove());
yGroup
  .selectAll(".tick line")
  .clone()
  .attr("x2", width)
  .attr("stroke-opacity", 0.3);

// add line and animation (copied from original: https://observablehq.com/@d3/connected-scatterplot)
const line = d3
  .line()
  .x((d) => x(d.miles))
  .y((d) => y(d.gas));

svg
  .append("path")
  .datum(data)
  .attr("fill", "none")
  .attr("stroke", "black")
  .attr("stroke-width", 2.5)
  .attr("stroke-linejoin", "round")
  .attr("stroke-linecap", "round")
  .attr("stroke-dasharray", `0,${length(line(data))}`)
  .attr("d", line)
  .transition()
  .duration(7000)
  .ease(d3.easeLinear)
  .attr("stroke-dasharray", `${length(line(data))},${length(line(data))}`);

function position(d) {
  const t = d3.select(this);
  switch (d.side) {
    case "top":
      t.attr("text-anchor", "middle").attr("dy", "-0.7em");
      break;
    case "right":
      t.attr("dx", "0.5em").attr("dy", "0.32em").attr("text-anchor", "start");
      break;
    case "bottom":
      t.attr("text-anchor", "middle").attr("dy", "1.4em");
      break;
    case "left":
      t.attr("dx", "-0.5em").attr("dy", "0.32em").attr("text-anchor", "end");
      break;
  }
}

function halo(text) {
  text
    .select(function () {
      return this.parentNode.insertBefore(this.cloneNode(true), this);
    })
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-width", 4)
    .attr("stroke-linejoin", "round");
}

function length(path) {
  return d3.create("svg:path").attr("d", path).node().getTotalLength();
}
