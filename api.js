// Function to scale coordinates
function scaleCoordinates(x, y, scale_factor) {
    return [x / scale_factor, y / scale_factor];
}

// Function to fetch and store location data for each driver
export async function fetchLocationData(sessionKey, driverData, driverId, startTime, endTime, scaleFactor = 100) {
    const url = `https://api.openf1.org/v1/location?session_key=${sessionKey}&driver_number=${driverId}&date>=${startTime}&date<${endTime}`;
    const response = await fetch(url);
    const data = await response.json();

    driverData[driverId] = data.map(location => {
        const [scaledX, scaledY] = scaleCoordinates(location.x, location.y, scaleFactor);
        return { x: scaledX, y: scaledY };
    });
}

window.fetchDriverDetails = fetchDriverDetails;

// Function to fetch driver details
export async function fetchDriverDetails() {
    const driverId = document.getElementById('driverSelect').value;
    const url = `https://api.openf1.org/v1/drivers?driver_number=${driverId}&session_key=9472`; // Use your actual API URL
    const response = await fetch(url);
    const data = await response.json();

    // Assuming `data` is the array of driver details
    const driver = data[0]; // Getting the first driver in the array
    displayDriverDetails(driver);
}

function displayDriverDetails(driver) {
    const detailsContainer = document.getElementById('driverDetails');
    const teamColor = `#${driver.team_colour}`;

    detailsContainer.style.background = `linear-gradient(160deg, #0A0A0A 50%, ${teamColor} 50%)`;
    detailsContainer.innerHTML = `
      <div class="driver-card">
        <div class="driver-number-circle">${driver.driver_number}</div>
        <img src="${driver.headshot_url}" alt="${driver.full_name}" class="driver-headshot">
        <div class="driver-details-content">
          <div class="driver-name">${driver.broadcast_name}</div>
          <div class="driver-country">${driver.country_code}</div>
          <div class="driver-team" style="background-color: #${driver.team_colour};">
            ${driver.team_name}
          </div>
        </div>
      </div>
    `;
    detailsContainer.style.display = 'flex'; // Adjust display style as needed
  }
