/* main */

var glbShardArray=[];
var glbIndexArray=[];

function floorFigure(figure, decimals){
    if (!decimals) decimals = 2;
    var d = Math.pow(10,decimals);
    return (parseInt(figure*d)/d).toFixed(decimals);
};

function buildTreeViz()
{
    var svg = d3.select("svg"),width = +svg.attr("width"),height = +svg.attr("height");

    var data=new Object();
    data.name="root";
    data.parent="";
    data.children=[];

    for (var s=0;s<glbShardArray.length;s++)
    {
        var nodeName=glbShardArray[s].nodeName;
        var machineNum=-1;

        //if (nodeName.indexOf("esdn")!=-1)
        {
            for (var m=0;m<data.children.length;m++)
            {
                if (data.children[m].name==nodeName)
                {
                    machineNum=m;
                }
            }

            if (machineNum==-1)
            {
                var newmach=new Object();
                newmach.name=nodeName;
                newmach.parent="root";
                newmach.children=[];
                data.children.push(newmach);
                machineNum=data.children.length-1;
            }

            var ch1=new Object();
            ch1.name=glbShardArray[s].idxName;
            ch1.value=glbShardArray[s].shardSize;
            ch1.origSize=glbShardArray[s].origSize;
            ch1.parent=nodeName;
            data.children[machineNum].children.push(ch1);
        }
    }

    // sort by shard size

    function compare(a,b)
    {
        return ( ( a.name == b.name ) ? 0 : ( ( a.name > b.name ) ? 1 : -1 ) );
    }

    data.children.sort(compare);

    var root = d3.hierarchy(data).sum(function(d){ return d.value});

    var tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("background", "#000")
    .style("color","white")
    .text("");    

    d3.treemap()
    .size([width, height])
    .paddingTop(28)
    .paddingRight(7)
    .paddingInner(3)
    (root);

    svg
    .selectAll("rect")
    .data(root.leaves())
    .enter()
    .append("rect")
      .attr('x', function (d) { return d.x0; })
      .attr('y', function (d) { return d.y0; })
      .attr('width', function (d) { return d.x1 - d.x0; })
      .attr('height', function (d) { return d.y1 - d.y0; })
      .style("stroke", "black")
      .style("fill", function(d){
          if (d.data.parent.substring(0,4)=="esdn")
          {
            var curDate=new Date();
            var datestring = curDate.getFullYear() + "." + ("0"+(curDate.getMonth()+1)).slice(-2) + "." + ("0" + curDate.getDate()).slice(-2);
            if (d.data.name.indexOf(datestring)!=-1) return "#10c010";
            return "#d0d0d0";
          }
          else if (d.data.parent.substring(0,5)=="es-wn")
          {
              return "orange";
          }

          return "slateblue";
      })
      .on("mouseover", function(d)
      {
          tooltip.text(d.data.name+"\n"+d.data.origSize.toString()); 
          return tooltip.style("visibility", "visible");
      })
      .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
      .on("mouseout", function(){return tooltip.style("visibility", "hidden");})      
      ;

      svg
      .selectAll("titles")
      .data(root.descendants().filter(function(d){return d.depth==1}))
      .enter()
      .append("text")
        .attr("x", function(d){ return d.x0})
        .attr("y", function(d){ return d.y0+21})
        .text(function(d)
        {
            var machineName=d.data.name;
            var dimSum=0;
            var totShardsPerMachine=0;
            
            for (var s=0;s<glbShardArray.length;s++)
            {
                var nodeName=glbShardArray[s].nodeName;
                if (nodeName==machineName)
                {
                    dimSum+=glbShardArray[s].shardSize;
                    totShardsPerMachine+=1;
                }
            }
        
            dimSum/=1024*1024*1024;
            dimSum=floorFigure(dimSum/1024);
            
            return d.data.name+" ("+dimSum.toString()+"tb) ("+totShardsPerMachine+")";
        })
        .attr("font-size", "12px")
        .attr("fill",  function(d){ return "black"} );      

  // and to add the text labels
  svg
    .selectAll("text")
    .data(root.leaves())
    .enter()
    .append("text")
      .attr("x", function(d){ return d.x0+5})    // +10 to adjust position (more right)
      .attr("y", function(d){ return d.y0+20})    // +20 to adjust position (lower)
      .text(function(d)
      {
          return "";//d.data.name;
      })
      .attr("font-size", "15px")
      .attr("fill", "white")
       ;    
}

function buildBarViz()
{
    var width=1200;
    var height=640;

    var margin = {top: 20, right: 20, bottom: 30, left: 40};

    var data=[];

    var maxH=0;
    var barId=0;
    for (var i=0;i<glbIndexArray.length;i++)
    {
        var indx=glbIndexArray[i].indexName;
        if (indx.indexOf("fly.sdp.application")!=-1)
        {
            var vizObj=new Object();
            vizObj.name=glbIndexArray[i].indexName;
            vizObj.value=parseInt(glbIndexArray[i].idxSize)/1024*1024;
            vizObj.id=barId;

            if (vizObj.value>maxH) maxH=vizObj.value;

            data.push(vizObj);
            barId+=1;
        }
    }
   
    var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", 
        "translate(" + margin.left + "," + margin.top + ")");  
        var svg = d3.select("svg"),
        margin = {
            top: 20,
            right: 20,
            bottom: 30,
            left: 50
        },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        //var parseTime = d3.timeParse("%d-%b-%y");
        
        var x = d3.scaleBand()
            .rangeRound([0, width])
            .padding(0.1);
        
        var y = d3.scaleLinear()
            .rangeRound([height, 0]);
        
            x.domain(data.map(function (d) {
                    return d.name;
                }));
            /*y.domain([0, d3.max(data, function (d) {
                        return Nd.value;
                    })]);*/
        
            //g.append("g")
            //.attr("transform", "translate(0," + height + ")")
            //.call(d3.axisBottom(x))
        
            svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-90)");

            g.append("g")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("fill", "#000")
            //.attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Idx Size");
        
            g.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function (d) {
                return d.id*50;
            })
            .attr("y", function (d) {
                return 0;
            })
            .attr("width", 50)
            .attr("height", function (d) {
                return 300-d.value*300/maxH;
            });
}

function sizeToBytes(s)
{
    if (s.length!=0)
    {
        var multipl=1;
        if (s.indexOf("kb")>0)
        {
            multipl=1024;
            s=s.replace("kb","");
        }
        else if (s.indexOf("mb")>0)
        {
            multipl=1024*1024;
            s=s.replace("mb","");
        }
        else if (s.indexOf("gb")>0)
        {
            multipl=1024*1024*1024;
            s=s.replace("gb","");
        }
        else if (s.indexOf("tb")>0)
        {
            multipl=1024*1024*1024*1024;
            s=s.replace("tb","");
        }
        else if (s.indexOf("b")>0)
        {
            multipl=1;
            s=s.replace("b","");
        }

        var numberSize=parseFloat(s);
        return numberSize*multipl;
    }

    return 0;
}

function storeStatsElement(el)
{
/*
    var idxName=el.substr(0,60).trim();
    var shardId=el.substr(61,6).trim();
    var shardType=el.substr(67,7).trim();
    var shardStatus=el.substr(74,11).trim();
    var numDocs=el.substr(85,12).trim();
    var shardSize=el.substr(97,9).trim();
    var machineIp=el.substr(106,14).trim();
    var nodeName=el.substr(120).trim();
*/
    var idxName=el.index;
    var shardStatus=el.state;
    var shardSize=el.store;
    var nodeName=el.node;

    if ((shardStatus=="STARTED")&&(shardSize!=null))
    {
        var newShard=new Object();
        newShard.nodeName=nodeName.replace("-v6","");
        newShard.origSize=shardSize;
        newShard.shardSize=sizeToBytes(shardSize);
        newShard.idxName=idxName;

        if (newShard.shardSize>=1024)
        {
            glbShardArray.push(newShard);
        }
    }
}

function extractDate(idxName)
{
    idxName=idxName.replace("_slice","");
    var dateStart=idxName.indexOf("2020");

    var dateObj=new Object();
    dateObj.year=0;
    dateObj.month=0;
    dateObj.day=0;

    if (dateStart>0)
    {
        var theDate=idxName.substring(dateStart);
        var numPoints=theDate.split(".").length;

        if (numPoints==2)
        {
            // daily
            dateObj.year=parseInt(theDate.substring(0,4));
            dateObj.month=parseInt(theDate.substring(4,2));
            dateObj.day=parseInt(theDate.substring(6,2));
        }
        else if (numPoints==1)
        {
            // monthly
            dateObj.year=parseInt(theDate.substring(0,4));
            dateObj.month=parseInt(theDate.substring(4,2));
        }
        else
        {
            // yearly
            dateObj.year=parseInt(theDate);
        }
    }

    return dateObj;
}

function extractDateType(idxName)
{
    idxName=idxName.replace("_slice","");
    var dateStart=idxName.indexOf("2020");

    if (dateStart>0)
    {
        var theDate=idxName.substring(dateStart);
        var numPoints=theDate.split(".").length;

        if (numPoints==2)
        {
            return "daily";
        }
        else if (numPoints==1)
        {
            return "monthly";
        }
        else
        {
            return "yearly";
        }
    }

    return "noDate";
}

function storeIndexStats(el)
{
    var idxName=el.substr(14,60).trim();
    var numDocs=el.substr(106,10).trim();
    var idxSize=el.substr(130,11).trim();

    var newIndex=new Object();
    newIndex.indexName=idxName;
    newIndex.indexDate=extractDate(idxName);
    newIndex.idxDateType=extractDateType(idxName);
    newIndex.idxSize=sizeToBytes(idxSize);

    glbIndexArray.push(newIndex);
}

window.onload=function()
{
    document.getElementById('shardFile').onchange = function(e) 
    {
        const reader = new FileReader();
        var f=e.target.files[0];

        reader.onload = (function(theFile) 
        {
            return function(e) 
            {
                var urlName=window.location.href;

                if (urlName.indexOf("indexViz")>0)
                {
                    // index graph

                    var el=0;
                    var res=e.target.result;
                    var resarr=res.split("\n");
                    resarr.forEach(element => 
                    {
                        if (el>0)
                        {
                            storeIndexStats(element);
                        }
                        
                        el++;
                    });
                    
                    buildBarViz();
                }
                else if (urlName.indexOf("shardViz")>0)
                {
                    // shard graph
                    var res=e.target.result;
                    var parsedJson=JSON.parse(res);
                    parsedJson.forEach(element => 
                    {
                        storeStatsElement(element);
                    });

                    buildTreeViz();
                }
            };
        })(f);        

        reader.readAsText(f);
    };
}