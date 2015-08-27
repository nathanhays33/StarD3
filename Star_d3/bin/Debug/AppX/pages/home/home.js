var data = null;
//var w = 850;
//var h = 400;
//var x = new Array();

(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/home/home.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.

            parse(Data.label, Data.color, Data.x, Data.y);

            // Initialize event listeners.
            document.getElementById("edit").addEventListener("click", showEditFlyout, false);
            document.getElementById("submit").addEventListener("click", submitGraph, false);
            document.getElementById("moreInformation").addEventListener("click", moreInformation, false);

            function moreInformation() {
                var site = "http://astronexus.com/node/34";
                var url = new Windows.Foundation.Uri(site);
                Windows.System.Launcher.launchUriAsync(url);
            }
            // Command and Flyout functions.
            function showEditFlyout() {
                showFlyout(confirmFlyout, edit, "left");
            }
            function showFlyout(flyout, anchor, placement) {
                flyout.winControl.show(anchor, placement);

                var selectElementL = document.getElementById("label");
                selectElementL.addEventListener("change", function (evt) {
                    Data.label = evt.target.options[evt.target.selectedIndex].value;
                });

                var selectElementC = document.getElementById("color");
                selectElementC.addEventListener("change", function (evt) {
                    Data.color = evt.target.options[evt.target.selectedIndex].value;
                });

                var selectElementX = document.getElementById("x");
                selectElementX.addEventListener("change", function (evt) {
                    Data.x = evt.target.options[evt.target.selectedIndex].value;
                });

                var selectElementY = document.getElementById("y");
                selectElementY.addEventListener("change", function (evt) {
                    Data.y = evt.target.options[evt.target.selectedIndex].value;
                });
                /*
                var r = document.getElementById('xZoom');
                r.onmouseup = (function (e) {
                    var f = r.offsetLeft;
                    var x = r.value;
                });
                */
            }
            function submitGraph() {
 

                var r = document.getElementById('xZoom');
                Data.xZoom = r.value/100;

                var k = document.getElementById('yZoom');
                Data.yZoom = k.value/100;

                var z = document.getElementById('StarCount');
                Data.starCount = z.value;

                d3.select("svg").remove();

                parse(Data.label, Data.color, Data.x, Data.y);
                document.getElementById("confirmFlyout").winControl.hide();
            }
            function getTitles() {
                var titles = new Array();
                d3.csv("/data/hygxyz.csv", function (csv) {
                    titles.push(Object.keys(csv[0]));
                });
            }
            function getRowInformation(index) {
                var information = new Array();
                d3.csv("/data/hygxyz.csv", function (csv) {
                    information = (csv[index]);
                });
                return information;
            }
            function parse(label, color, X, Y) {
                d3.csv("/data/hygxyz.csv", function (stars) {
                    //prices is an array of json objects containing the data in from the csv
                    data = stars.map(function (d) {
                            d.label = d[label];     //label
                            d.color = +d[color]; // color
                            d.x = +d[X];   //X
                            d.y = +d[Y];  // Y
                            d.index = d['StarID'];
                            return { "label": d.label, "color": d.color, "x": d.x, "y": d.y, "index": d.index };
                    })
                   data= data.slice(0, Data.starCount);
                       scatterPlot(data);
                })
            }
            function onCancel() { }
            function showNoPhotoDialog(index) {

               d3.csv("/data/hygxyz.csv", function (csv) {
                  var data =  (csv[index]);

                  var message =
                                "AbsMag: " + data.AbsMag + '\n' +
                                "Bayer Flamsted: " + data.BayerFlamsteed + '\n' +
                                "Color Index: " + data.ColorIndex + '\n' +
                                "Dec: " + data.Dec + '\n' +
                                "Distance: " + data.Distance + '\n' +
                                "Gliese: " + data.Gliese + '\n' +
                                "HD: " + data.HD + '\n' +
                                "HIP: " + data.HIP + '\n' +

                                "HR: " + data.HR + '\n' +
                                "Mag: " + data.Mag + '\n' +
                                "PMDec: " + data.PMDec + '\n' +
                                "PMRA: " + data.PMRA + '\n' +
                                "Proper Name: " + data.ProperName + '\n' +

                                "RA: " + data.RA + '\n' +
                                "RV: " + data.RV + '\n' +
                                "Spectrum: " + data.Spectrum + '\n' +
                                "Star ID: " + data.StarID + '\n' +
                                "VX: " + data.VX + '\n' +
                                "VY: " + data.VY + '\n' +
                                "VZ: " + data.VZ + '\n' +
                                "X: " + data.X + '\n' +
                                "Y: " + data.Y + '\n' +
                                "Z: " + data.Z;
              
                var msg = new Windows.UI.Popups.MessageDialog(message);
                //Add buttons and set their callback functions
                msg.commands.append(new Windows.UI.Popups.UICommand("OK",
                   function (command) {


                   }));

                msg.commands.append(new Windows.UI.Popups.UICommand("More Information in Browser",
                        function (command) {
                            var value = data.HD.toString();
                            var site = "http://server6.sky-map.org/starview?object_type=1&object_id=212&object_name=HD+" + value; 
                            var url = new Windows.Foundation.Uri(site);
                            Windows.System.Launcher.launchUriAsync(url);

                        }));
                msg.showAsync();

               })
            }
            function scatterPlot(data) {
                // just to have some space around items.  
                var xLabel = document.getElementById('xAxisLabel');
                var yLabel = document.getElementById('yAxisLabel');

                xLabel.innerText = "X: " + Data.x;
                yLabel.innerText = "Y: " + Data.y;

                var margins = {
                    "left": 80,
                    "right": 30,
                    "top": 20,
                    "bottom": 20
                };

                var width = 1200;
                var height = 700;

                // this will be our colour scale. An Ordinal scale.
                var colors = d3.scale.category20();

                // we add the SVG component to the scatter-load div
                var svg = d3.select("#scatter-load").append("svg").attr("width", "90%").attr("height", "90%").append("g")
                    .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

                // this sets the scale that we're using for the X axis. 
                // the domain define the min and max variables to show. In this case, it's the min and max prices of items.
                // this is made a compact piece of code due to d3.extent which gives back the max and min of the price variable within the dataset
                var x = d3.scale.linear()
                    .domain(d3.extent(data, function (d) {
                        return Data.xZoom * d.x;
                    }))
                //    .domain([xScaleMin,xScaleMax])
                // the range maps the domain to values from 0 to the width minus the left and right margins (used to space out the visualization)
                  .range([0, width - margins.left - margins.right]);

      
                // this does the same as for the y axis but maps from the rating variable to the height to 0. 
                var y = d3.scale.linear()
                    .domain(d3.extent(data, function (d) {
                        return Data.yZoom * d.y;
                    }))
                  //  .domain([yScaleMin, yScaleMax])
                // Note that height goes first due to the weird SVG coordinate system
                .range([height - margins.top - margins.bottom, 0]);
                

                // we add the axes SVG component. At this point, this is just a placeholder. The actual axis will be added in a bit
                svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + y.range()[0] + ")");
                svg.append("g").attr("class", "y axis");

                // this is our X axis label. Nothing too special to see here.
                /*
                svg.append("text")
                    .attr("fill", "#414241")
                    .attr("text-anchor", "end")
                    .attr("x", width / 2)
                    .attr("y", height - 35)
                    .text(Data.x);
                    */
                // this is our X axis label. Nothing too special to see here.
                /*
                svg.append("text")
                    .attr("fill", "#414241")
                    .attr("text-anchor", "left")
                    .text(Data.y);
*/

                // this is the actual definition of our x and y axes. The orientation refers to where the labels appear - for the x axis, below or above the line, and for the y axis, left or right of the line. Tick padding refers to how much space between the tick and the label. There are other parameters too - see https://github.com/mbostock/d3/wiki/SVG-Axes for more information
                var xAxis = d3.svg.axis().scale(x).orient("bottom").tickPadding(2);
                var yAxis = d3.svg.axis().scale(y).orient("left").tickPadding(2);

                // this is where we select the axis we created a few lines earlier. See how we select the axis item. in our svg we appended a g element with a x/y and axis class. To pull that back up, we do this svg select, then 'call' the appropriate axis object for rendering.    
                svg.selectAll("g.y.axis").call(yAxis);
                svg.selectAll("g.x.axis").call(xAxis);

                // now, we can get down to the data part, and drawing stuff. We are telling D3 that all nodes (g elements with class node) will have data attached to them. The 'key' we use (to let D3 know the uniqueness of items) will be the name. Not usually a great key, but fine for this example.
                var chocolate = svg.selectAll("g.node").data(data, function (d) {
                    return d.index;
                });

                // we 'enter' the data, making the SVG group (to contain a circle and text) with a class node. This corresponds with what we told the data it should be above.
                var chocolateGroup = chocolate.enter().append("g").attr("class", "node")
                // this is how we set the position of the items. Translate is an incredibly useful function for rotating and positioning items 
                .attr('transform', function (d) {
               
                    return "translate(" + x(d.x) + "," + y(d.y) + ")";
                });
            
                // we add our first graphics element! A circle! 
                chocolateGroup.append("circle")
                    //    .filter(function (d) { return (d.x < xScaleMax && d.x >xScaleMin && d.y < yScaleMax && d.y > yScaleMin ); })
                        .attr("r", 5)
                        .attr("class", "dot")
                        .on('click', function (d, i) {
                            showNoPhotoDialog(i);
                        })
                        .style("fill", function (d) {
                            // remember the ordinal scales? We use the colors scale to get a colour for our manufacturer. Now each node will be coloured
                            // by who makes the chocolate.                         
                            //progressBar.value = 1 * (count / Data.starCount);
                            return colors(d.color);
                        });
    
                // now we add some text, so we can see what each item is.

                if(Data.label != "null"){
                chocolateGroup.append("text")
                    .style("text-anchor", "middle")
                    .attr("dy", -10)
                    .text(function (d) {
                        // this shouldn't be a surprising statement.
                        return d.label;
                    });
                }

               

              
            }
        }
    });
})();


