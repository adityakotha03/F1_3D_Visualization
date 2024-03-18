// Function to scale coordinates
function scaleCoordinates(x, y, scale_factor) {
  return [x / scale_factor, y / scale_factor];
}

// Function to fetch and store location and car data for each driver
export async function fetchLocationData(sessionKey, driverData, driverId, startTime, endTime, scaleFactor = 100) {
  const locationUrl = `https://api.openf1.org/v1/location?session_key=${sessionKey}&driver_number=${driverId}&date>=${startTime}&date<${endTime}`;
  const Driverurl = `https://api.openf1.org/v1/drivers?driver_number=${driverId}&session_key=${sessionKey}`;
  const carDataUrl = `https://api.openf1.org/v1/car_data?session_key=${sessionKey}&driver_number=${driverId}&date>=${startTime}&date<${endTime}`;

  const locationResponse = await fetch(locationUrl);
  const locationData = await locationResponse.json();

  const carDataResponse = await fetch(carDataUrl);
  const carData = await carDataResponse.json();

  const response = await fetch(Driverurl);
  const data = await response.json();

  //console.log(locationData);
  //console.log(carData);

  // Merge location and car data based on closest timestamps
  const mergedData = locationData.map(location => {
      const [scaledX, scaledY] = scaleCoordinates(location.x, location.y, scaleFactor);
      const closestCarData = carData.reduce((closest, carDatum) => {
          const timeDiff = Math.abs(new Date(carDatum.date) - new Date(location.date));
          return timeDiff < closest.timeDiff ? { data: carDatum, timeDiff } : closest;
      }, { timeDiff: Infinity }).data;

      return { 
          x: scaledX, 
          y: scaledY, 
          cardata: closestCarData,
          driverdata: data[0],
      };
  });

  driverData[driverId] = mergedData;
  //console.log(driverData);
}