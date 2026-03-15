/**
 * Distance and Location Utilities
 */

/**
 * Calculate the straight-line distance between two points in kilometers using the Haversine formula.
 * Includes a road distance estimation factor for more realistic travel times.
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Basic validation
    if (lat1 === null || lat1 === undefined ||
        lon1 === null || lon1 === undefined ||
        lat2 === null || lat2 === undefined ||
        lon2 === null || lon2 === undefined) {
        return null;
    }

    const nLat1 = parseFloat(lat1);
    const nLon1 = parseFloat(lon1);
    const nLat2 = parseFloat(lat2);
    const nLon2 = parseFloat(lon2);

    if (isNaN(nLat1) || isNaN(nLon1) || isNaN(nLat2) || isNaN(nLon2)) {
        return null;
    }

    const R = 6371; // Earth's radius in km
    const dLat = (nLat2 - nLat1) * Math.PI / 180;
    const dLon = (nLon2 - nLon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(nLat1 * Math.PI / 180) * Math.cos(nLat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance; // Returns distance in kilometers
};

/**
 * Get the current user location with high accuracy.
 */
export const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            (error) => {
                let message = 'Unable to get your location.';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Location permission denied. Please enable location services.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        message = 'Location request timed out.';
                        break;
                }
                reject(new Error(message));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
};

/**
 * Calculate estimated travel times based on distance.
 * Adds a road buffer factor (default 1.3x) because driving/walking is never in a straight line.
 */
export const calculateTravelTimes = (distanceKm) => {
    if (distanceKm === null || isNaN(distanceKm)) return null;

    // Road buffer factor: Estimated road distance is usually ~30% longer than straight line
    const roadDistance = distanceKm * 1.3;

    // Average speeds in km/h
    const speeds = {
        walking: 5,
        biking: 20, // Moderate cycling/scooter speed
        driving: 35 // Urban driving speed considering traffic
    };

    return {
        walking: (roadDistance / speeds.walking) * 60,
        biking: (roadDistance / speeds.biking) * 60,
        driving: (roadDistance / speeds.driving) * 60,
        roadDistance: roadDistance
    };
};

/**
 * Formats distance into a readable string (m or km)
 */
export const formatDistance = (km) => {
    if (km === null || isNaN(km)) return 'Unknown';
    if (km < 1) {
        return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(2)} km`;
};

/**
 * Formats time in minutes to a readable string
 */
export const formatTravelTime = (minutes) => {
    if (minutes === null || isNaN(minutes)) return 'Unknown';
    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};
