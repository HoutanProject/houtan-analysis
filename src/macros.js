function compute() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('Station_names/BSSID');
  const maxColumn = sheet.getLastColumn();
  const maxRow = sheet.getLastRow();
  const range = sheet.getRange(2, 1, maxRow, maxColumn);
  console.log(range);
  const values = range.getValues();
  const perStation = {}
  const perMac = {};
  const blacklist = {}
  
  values.forEach(function(v) {
    var stationName = v[0];
    var mac = v[1].toUpperCase();
    var session = Math.ceil(v[2]);
    if(!stationName || !mac || !session) {
      return;
    }
    
    // was seen in multiple stations before
    if(blacklist[mac]) {
      return;
    }
    
    // if we've never seen it before, record
    if(!perMac[mac]) {
      perMac[mac] = stationName;
    } else {
      if(perMac[mac] != stationName) {
        // probably our own or other passengers device
        if(!blacklist[mac]) {
          blacklist[mac] = [perMac[mac]];
          // remove previously capture perStation
          delete perStation[perMac[mac]][mac];
        }
        blacklist[mac].push(stationName);
        return;
      }
    }
    
    // populate mapping from station -> mac
    if(!perStation[stationName]) {
      perStation[stationName] = {};
    }
    if(!perStation[stationName][mac]) {
      perStation[stationName][mac] = [];
    }
    if(perStation[stationName][mac].indexOf(session) == -1) {
      perStation[stationName][mac].push(session);
    }
  });
  
  // flip station -> mac into mac -> station for those we've seen across
  // at least two sessions
  var selectedMac = {};
  Object.keys(perStation).forEach(function(station) {
    filtered = Object.keys(perStation[station]).filter(function(mac) {
      // has been seen in at least two sessions
      return perStation[station][mac].length >= 2;
    });
    filtered.forEach(function(mac) {
      selectedMac[mac] = station;
    })
  })

  PropertiesService.getDocumentProperties().setProperty('PER_MAC', JSON.stringify(selectedMac))
  return selectedMac;
}

function doGet(e) {
  var perMac = PropertiesService.getDocumentProperties().getProperty('PER_MAC');
  if(!(perMac instanceof Object)) {
    perMac = JSON.parse(perMac);
  }
  if(e.parameter.mac) {
    return ContentService.createTextOutput(searchMatch(e.parameter.mac, perMac))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return HtmlService.createHtmlOutputFromFile('index.html');
}

function searchMatch(txt, perMac) {
  var macs = searchMac(txt);
  var matches = findMatches(macs, perMac);
  return {matches: matches, macs: macs};
}

function unique(a) {
  return a.sort().filter(function(elem, index, arr) {
    return index == arr.length - 1 || arr[index + 1] != elem
  });
}

function toUpper(a) {
  if(!a) {
    return [];
  }
  return a.map(function(s) { return s.toUpperCase(); });
}

function searchMac(txt) {
  var regexp = /[0-9a-f]{1,2}([\.:-])[0-9a-f]{1,2}(?:\1[0-9a-f]{1,2}){4}/ig;
  var results = txt.match(regexp);
  return unique(toUpper(results));
}

function findMatchesTest() {
  var results = findMatches(["0A:14:4B:71:31:88"], {'0A:14:4B:71:31:88': '昌平路7号线'});
  return results;
}

function findMatches(macs, perMac) {
  var matches = {};
  macs.forEach(function(mac) {
    if(perMac[mac]) {
      var stationName = perMac[mac];
      if(!matches[stationName]) {
        matches[stationName] = [];
      }
      matches[stationName].push(mac);
    }
  });
  return matches;
}

function doPost(e) {
  if(typeof e !== 'undefined' && e.parameter.mac) {
    var perMac = PropertiesService.getDocumentProperties().getProperty('PER_MAC');
    return ContentService.createTextOutput(searchMatch(e.parameter.mac, perMac))
      .setMimeType(ContentService.MimeType.JSON);
  } else {
    return ContentService.createTextOutput({error: 'no sample parameter found in post'})
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function processForm(data) {
  var perMac = JSON.parse(PropertiesService.getDocumentProperties().getProperty('PER_MAC'));
  var sample = data.myFile.getDataAsString();
  return searchMatch(sample, perMac);
}

function getActiveSpreadsheetUrl() {
  return {url: SpreadsheetApp.getActiveSpreadsheet().getUrl()};
}