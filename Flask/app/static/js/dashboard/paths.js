
g_project.path = SVG.append("g")
    .attr("id","Path")
    .attr("transform","translate(0),"+"scale(0)")

g_project.path.selectAll("g")
    .data(g_project.history)
    .enter()
    .append("g")
    .attr("class","planet")

