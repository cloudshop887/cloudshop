# Distance & Travel Time Calculator Feature

## Overview
The Distance & Travel Time Calculator helps customers see how far a shop is from their current location and estimates how long it will take to reach the shop using different modes of transportation.

## Features

### 📍 Distance Calculation
- **Real-time location**: Uses browser's geolocation API to get customer's current position
- **Accurate distance**: Calculates straight-line distance using the Haversine formula
- **Smart display**: Shows meters for distances under 1 km, kilometers for longer distances

### 🚶 Travel Time Estimates
Provides estimated travel times for three modes of transportation:

1. **Walking** 🚶
   - Average speed: 5 km/h
   - Icon: Footprints (green)
   - Best for: Short distances (< 2 km)

2. **Biking** 🚴
   - Average speed: 15 km/h
   - Icon: Bike (blue)
   - Best for: Medium distances (2-10 km)

3. **Driving** 🚗
   - Average speed: 40 km/h (city traffic)
   - Icon: Car (purple)
   - Best for: Long distances (> 5 km)

### 🗺️ Google Maps Integration
- Direct link to Google Maps with directions
- Opens in new tab
- Pre-filled with origin (customer location) and destination (shop location)

## How It Works

### For Customers

1. **Visit Shop Page**: Navigate to any shop's detail page
2. **Click "Calculate Distance"**: Button located in the Distance & Travel Time section
3. **Allow Location Access**: Browser will request permission to access your location
4. **View Results**: See distance and travel times for all three modes
5. **Get Directions**: Click "Open in Google Maps" for turn-by-turn navigation

### Technical Implementation

#### Distance Calculation (Haversine Formula)
```javascript
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
};
```

#### Travel Time Calculation
```javascript
const calculateTravelTimes = (distanceKm) => {
    return {
        walking: (distanceKm / 5) * 60,   // minutes
        biking: (distanceKm / 15) * 60,   // minutes
        driving: (distanceKm / 40) * 60   // minutes
    };
};
```

## UI Components

### Distance Display Card
- Large, prominent display of distance
- Primary color theme
- Converts to meters if < 1 km

### Travel Mode Cards
Three cards showing:
- Mode icon with colored background
- Mode name
- Estimated time (formatted)
- Average speed reference

### Google Maps Button
- Opens directions in new tab
- Uses Google Maps Directions API
- Pre-filled origin and destination

## Requirements

### Shop Requirements
- Shop must have `latitude` and `longitude` fields in database
- Coordinates must be valid decimal degrees

### Browser Requirements
- Modern browser with Geolocation API support
- HTTPS connection (required for geolocation)
- Location permissions granted by user

## Privacy & Security

### Location Data
- Location is only accessed when user clicks "Calculate Distance"
- Location data is NOT stored or sent to server
- Calculations happen entirely in browser
- User must explicitly grant permission

### HTTPS Requirement
- Geolocation API requires HTTPS in production
- Works on localhost for development
- Ensure SSL certificate is configured for production

## Error Handling

### Location Permission Denied
```
Alert: "Unable to get your location. Please enable location services."
```

### Shop Location Not Available
```
Alert: "Shop location not available"
```

### Geolocation Not Supported
```
Alert: "Geolocation is not supported by your browser"
```

## Example Scenarios

### Scenario 1: Nearby Shop (500m)
- **Distance**: 500 m
- **Walking**: 6 min
- **Biking**: 2 min
- **Driving**: < 1 min

### Scenario 2: Medium Distance (5 km)
- **Distance**: 5.00 km
- **Walking**: 1h
- **Biking**: 20 min
- **Driving**: 8 min

### Scenario 3: Far Shop (20 km)
- **Distance**: 20.00 km
- **Walking**: 4h
- **Biking**: 1h 20m
- **Driving**: 30 min

## Speed Assumptions

### Walking (5 km/h)
- Comfortable walking pace
- Accounts for stops at crossings
- Suitable for most people

### Biking (15 km/h)
- Moderate cycling speed
- City cycling with traffic
- Includes stops and slow zones

### Driving (40 km/h)
- City driving with traffic
- Accounts for signals and congestion
- Conservative estimate for urban areas

**Note**: Actual times may vary based on:
- Traffic conditions
- Road quality
- Weather
- Individual fitness level
- Route taken (actual vs straight-line)

## Future Enhancements

### Potential Improvements
1. **Real-time traffic data**: Integrate with Google Maps API for live traffic
2. **Route optimization**: Show actual route distance vs straight-line
3. **Public transport**: Add bus/metro travel time estimates
4. **Save favorite shops**: Remember frequently visited shops
5. **Delivery radius**: Show if shop delivers to customer's location
6. **Peak hours warning**: Alert about traffic during rush hours

### API Integration Ideas
- Google Maps Distance Matrix API (paid)
- OpenStreetMap routing
- Local transit APIs
- Weather API for condition-based estimates

## Benefits

### For Customers
✅ Know exactly how far the shop is
✅ Plan their visit better
✅ Choose between walking, biking, or driving
✅ Get direct navigation to shop
✅ Make informed decisions about delivery vs pickup

### For Shop Owners
✅ Attract nearby customers
✅ Show accessibility
✅ Encourage foot traffic
✅ Build trust with transparency
✅ Differentiate from competitors

## Testing

### Test Cases
1. ✅ Click "Calculate Distance" button
2. ✅ Allow location permission
3. ✅ Verify distance is displayed
4. ✅ Check all three travel times appear
5. ✅ Click "Open in Google Maps"
6. ✅ Verify Google Maps opens with correct route
7. ✅ Test with shop at various distances
8. ✅ Test location permission denial
9. ✅ Test with shop without coordinates

### Browser Testing
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

---

**This feature makes it easy for customers to plan their shopping trips and choose the most convenient transportation mode!** 🎯
