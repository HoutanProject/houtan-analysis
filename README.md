# houtan-analysis

## Goal and Overview

houtan-analysis is a set of Google Apps Script code that reads from a Google Spreadsheet document containing:

* a sheet: Station_names/BSSID
 * columns: 地铁站名称	BSSID	Session
 
 and outputs a JSON document mapping MAC addresses of BSSID and the name of the station (地铁站名称)

## Usage

Once pushed to a proper spreadsheet, can use as follow:

```Tools > Script Editor > Publish > Deploy as Web App >  Test web app for your latest code.```

This is a URL that you can open in the browser.

By default, this URL serves a web inetrface:

Can then test on different text files or generate the JSON document.

You can also append ```?export=1``` to the URL to open the full JSON mapping (this is actually what we'll want to consume in the Houtan Android application).

TODO: should be a way to generalize this and publish as a web add-ons to facilitate usage in other application

## Development

### Building Google Apps Script command-line utility (clasp)

```
cd docker/
./dockerize
```

This will create a container with clasp.

### Running 

```
cd docker/
./run-docker.sh
```

This will give you a shell with clasp in the global path


### Login in to Google Scripts

```
clasp login
```

This will log you in and put the login information in the host ~/.clasprc.json

### Development

Pulling the source code from Google:

```
cd src/
clasp pull
```
