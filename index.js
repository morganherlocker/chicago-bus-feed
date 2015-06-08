var request = require('request')
var turf = require('turf')
var fs = require('fs')
var parse = require('xml-parser')
var moment = require('moment')

var trains = {}
var currentFile = ''
var key = require('./key.json').key
var url = 'http://lapi.transitchicago.com/api/1.0/ttarrivals.aspx?key='+key+'&mapid=40380'
setInterval(function(){
  request(url, function(err, res, body){
    try{
      var data = parse(body)
      data = data.root.children.map(function(item){
        if(item.name === 'eta') {
          var train = {}
          item.children.forEach(function(prop){
            if(prop.name === 'staId') train.id = prop.content
            if(prop.name === 'stpId') train.id += prop.content
            if(prop.name === 'rn') train.id += prop.content
            if(prop.name === 'rt') train.id += prop.content
            if(prop.name === 'lat') train.lat = parseFloat(prop.content)
            if(prop.name === 'lon') train.lon = parseFloat(prop.content)
          })
          return train
        }
      }).filter(function(train){
        if(train && train.lat && train.lon) return true
      })

      var time = moment()
      var year = time.format('YYYY')
      var month = time.format('MM')
      var day = time.format('DD')
      var hours = time.format('HH')

      var file = __dirname + '/out/'+year+'-'+month+'-'+day+'-'+hours+'.geojson'

      if(file !== currentFile) {
        trains = {}
        currentFile = file
      }

      data.forEach(function(train){
        if(!trains[train.id]) {
          trains[train.id] = turf.linestring([], {id: train.id, times: []})
        }
        var lastCoord = trains[train.id].geometry.coordinates[trains[train.id].geometry.coordinates.length - 1]
        if(trains[train.id].geometry.coordinates.length === 0 || (!(lastCoord[0] === train.lon && lastCoord[1] === train.lat) && inRange(lastCoord, [train.lon, train.lat])) ){
          trains[train.id].geometry.coordinates.push([
              train.lon,
              train.lat
            ])
          trains[train.id].properties.times.push(moment().format('HH:mm:ss'))
        }
      })

      fs.writeFileSync(file, JSON.stringify(getTraces(trains)))
    } catch(e){
      console.log(e)
    }
  })
}, 10000)

function getTraces (trains) {
  return turf.featurecollection(Object.keys(trains).map(function(route){
    return trains[route]
  }).filter(function(route){
    if(route.geometry.coordinates.length > 1) return true
  }))
}

function inRange(coord1, coord2) {
  var distance = turf.distance(turf.point(coord1), turf.point(coord2), 'miles')
  if(distance < 0.3) return true
}