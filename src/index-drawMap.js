var map;
var center = new google.maps.LatLng(39.395, -76.609);

function drawMap() {
  //document.getElementById('map_div').style.display = "none";
  var mapOptions = {
    zoom : 8,
    center : new google.maps.LatLng(39.395, -76.609),
    mapTypeId : google.maps.MapTypeId.TERRAIN
  };

  //console.log(document.getElementById('map_div'));
  map = new google.maps.Map(document.getElementById('map_div'), mapOptions);

  //Fusion table load much faster than KML layers! (perhaps because the USGS kml loads more slowly than the fusion table.)
  //fusion table ID: 11Ujto70g1r7bWNSax5X84KYYuTpwPGmWeacAhkwP

  var fusionLayer = new google.maps.FusionTablesLayer({
    query : {
      select : 'location',
      from : '1Rt_U4LqeNPi6Tk1-kq8ta-6OP748nJJJTqdwlC0Q'
    }
  });
  fusionLayer.setMap(map);
  
  google.maps.event.addListener(fusionLayer, 'click', function(event) {
    //console.log(event);
    var re = /[0-9]+/;
    //TODO: for now, we will only work with daily value sites.
    var sId = "dv" + re.exec(event.row.site_no.value)[0];

    console.log("The map event listener has determined that the sID is: " + sId);
    viewModel.siteId(sId);
    console.log("viewModel.siteID() is " + viewModel.siteId());
    viewModel.siteName(event.row.station_nm.value);


    // This will not match strings and integers. Be careful that both are integers or strings...
    var siteIndex = viewModel.siteIdArray.indexOf(sId);
    console.log("The siteIndex is: " + siteIndex);

    if (siteIndex === -1) {

      viewModel.siteArray.push({id: sId, name: event.row.station_nm.value, area: +event.row.drain_area_va.value});
      //This siteIdArray.push won't capture the first data requested.
      viewModel.siteIdArray.push(sId);
      //console.log(viewModel.siteId());
      console.log(viewModel.siteArray());
      //viewModel.siteName.push(kmlEvent.featureData.name);

      //console.log(sId);
      //console.log(viewModel.siteId());
      //console.log(viewModel.siteName());

      getUSGS(sId);
      getTuNexrad(sId);
    }
    //If we already have this site in the list, we don't need to request it again.
    //We still need to plot the data.
    viewModel.plotGraph(); //Unfortunately, this will only plot the most recently added sId.
  });
  
/*
  //KML layers can use real-time updates from USGS, and will plot 5,000 points quickly... compared to plotting 5,000 points using other methods.
  //The KML layer still loads too slowly, or not at all.
  var points = new google.maps.KmlLayer("http://waterwatch.usgs.gov/kmls/real.kmz", {
    suppressInfoWindows : true,
    preserveViewport : true,
    map : map
  });

  google.maps.event.addListener(fusionLayer, 'click', function(event) {
    console.log(event);
    var re = /^[0-9]+/;
    var sId = re.exec(event.featureData.name)[0];
    viewModel.siteId(sId);
    viewModel.siteName(event.featureData.name);
    //This siteIdArray.push won't capture the first data requested.
    viewModel.siteIdArray.push(+sId);
    console.log(viewModel.siteId());
    console.log(viewModel.siteIdArray());
    //viewModel.siteName.push(kmlEvent.featureData.name);

    //console.log(sId);
    //console.log(viewModel.siteId());
    //console.log(viewModel.siteName());

    getUSGS(sId);
  });
*/

  tileNEX = new google.maps.ImageMapType({
    getTileUrl : function(tile, zoom) {
      return "http://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/" + zoom + "/" + tile.x + "/" + tile.y + ".png?" + (new Date()).getTime();
    },
    tileSize : new google.maps.Size(256, 256),
    opacity : 0.90,
    name : 'NEXRAD',
    isPng : true
  });

  goes = new google.maps.ImageMapType({
    getTileUrl : function(tile, zoom) {
      return "http://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/goes-east-vis-1km-900913/" + zoom + "/" + tile.x + "/" + tile.y + ".png?" + (new Date()).getTime();
    },
    tileSize : new google.maps.Size(256, 256),
    opacity : 0.40,
    name : 'GOES East Vis',
    isPng : true
  });

  map.overlayMapTypes.push(null);
  //create empty overlay entry
  //map.overlayMapTypes.setAt("0",goes);
  map.overlayMapTypes.setAt("1", tileNEX);
  google.maps.event.addListener(map, 'bounds_changed', function() {
    //console.log(map.getBounds());
  });

}

google.maps.event.addDomListener(window, 'load', drawMap);

