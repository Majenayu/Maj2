document.addEventListener("DOMContentLoaded", function () {
    const apiKey = "mzDLjmDOdq62sKIc4y81FgMv8pqj2ndZWPBraNyCm2w";
    let platform = new H.service.Platform({ 'apikey': apiKey });
    let defaultLayers = platform.createDefaultLayers();
    let map = new H.Map(document.getElementById('map'), defaultLayers.vector.normal.map, {
        zoom: 7,
        center: { lat: 14.5, lng: 75.5 }
    });

    let behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
    let ui = H.ui.UI.createDefault(map, defaultLayers);

    let driverMarker, selectedMarker, routeLine;
    let driverLocation = null;
    let selectedLocation = null;

    // Function to fetch the driver's live location
    async function fetchDriverLocation(startCoords, endCoords) {
        try {
           let response = await fetch(`https://maj-65qm.onrender.com/get-driver-location?start=${JSON.stringify(startCoords)}&end=${JSON.stringify(endCoords)}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            let data = await response.json();
            if (data && data.driverLocation) {
                driverLocation = data.driverLocation;
                console.log("Driver location fetched:", driverLocation);
                updateDriverLocation(driverLocation.lat, driverLocation.lng);
                return true;
            } else {
                console.log("No active driver found.");
                return false;
            }
        } catch (error) {
            alert("Error connecting to the server. Please try again.");
            console.error("Error fetching driver location:", error);
            return false;
        }
    }

    // Function to update the driver's location on the map
    function updateDriverLocation(lat, lng) {
        if (driverMarker) map.removeObject(driverMarker);
        driverMarker = new H.map.Marker({ lat, lng });
        map.addObject(driverMarker);
    }

    // Function to calculate and display the route from driver to selected location
    function calculateRoute(start, end) {
        if (!start || !end) {
            alert("Error: Missing driver location or destination!");
            return;
        }

        let router = platform.getRoutingService(null, 8);
        let routeParams = {
            routingMode: 'fast',
            transportMode: 'car',
            origin: `${start.lat},${start.lng}`,  // Driver's live location
            destination: `${end.lat},${end.lng}`, // Selected location on map
            return: 'polyline,summary'
        };

        router.calculateRoute(routeParams, function (result) {
            if (!result.routes.length || !result.routes[0].sections) {
                alert("No route found!");
                return;
            }

            if (routeLine) {
                map.removeObject(routeLine);
            }

            let route = result.routes[0];
            let lineString = new H.geo.LineString();

            route.sections.forEach(section => {
                let coords = H.geo.LineString.fromFlexiblePolyline(section.polyline);
                coords.getLatLngAltArray().forEach((value, index, array) => {
                    if (index % 3 === 0) {
                        lineString.pushLatLngAlt(array[index], array[index + 1]);
                    }
                });
            });

            routeLine = new H.map.Polyline(lineString, { style: { strokeColor: 'blue', lineWidth: 4 } });
            map.addObject(routeLine);

            let distance = (route.sections[0].summary.length / 1000).toFixed(2);
            let travelTime = Math.ceil(route.sections[0].summary.duration / 60);
            document.getElementById("distanceToDriver").innerText = `${distance} km`;
            document.getElementById("ETA").innerText = `${travelTime} min`;

        }, function (error) {
            alert("Error calculating route: " + error);
        });
    }

    // Event Listener: Select destination from map
    map.addEventListener('tap', function (evt) {
        let coord = map.screenToGeo(evt.currentPointer.viewportX, evt.currentPointer.viewportY);
        selectedLocation = { lat: coord.lat, lng: coord.lng };

        if (selectedMarker) map.removeObject(selectedMarker);
        selectedMarker = new H.map.Marker(selectedLocation);
        map.addObject(selectedMarker);

        alert(`Location Selected: ${selectedLocation.lat}, ${selectedLocation.lng}`);
    });

    // Event Listener: Find driver and generate route
    document.getElementById("checkDriver").addEventListener("click", async function () {
        let startSelect = document.getElementById("start");
        let endSelect = document.getElementById("end");

        if (!startSelect.value || !endSelect.value) {
            alert("Please select both start and end locations first.");
            return;
        }

        if (!selectedLocation) {
            alert("Please select a location on the map.");
            return;
        }

        let startCoords = startSelect.value.split(",").map(Number);
        let endCoords = endSelect.value.split(",").map(Number);

        let driverFound = await fetchDriverLocation(startCoords, endCoords);
        if (!driverFound) {
            alert("No active driver found.");
            return;
        }

        // Now generate the route from driver to the selected map location
        alert(`Generating route from Driver (${driverLocation.lat}, ${driverLocation.lng}) to Selected Location (${selectedLocation.lat}, ${selectedLocation.lng})`);
        calculateRoute(driverLocation, selectedLocation);
    });

});
