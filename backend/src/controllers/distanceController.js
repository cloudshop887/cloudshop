const { calculateDistance } = require('../utils/distance');

const calculateDistanceController = (req, res) => {
    const { userLat, userLng, shopLat, shopLng } = req.query;

    if (userLat === undefined || userLng === undefined || shopLat === undefined || shopLng === undefined) {
        return res.status(400).json({ message: 'Missing coordinates' });
    }

    const distance = calculateDistance(userLat, userLng, shopLat, shopLng);

    if (distance === Infinity) {
        return res.status(400).json({ message: 'Invalid coordinates provided' });
    }

    // Estimate time: Using a road buffer factor of 1.3 and avg city speed 35km/h
    const roadDistance = distance * 1.3;
    const timeMinutes = (roadDistance / 35) * 60;

    res.json({
        distance: parseFloat(distance.toFixed(2)),
        roadDistance: parseFloat(roadDistance.toFixed(2)),
        time: Math.ceil(timeMinutes),
        unit: 'km',
        timeUnit: 'minutes'
    });
};

module.exports = { calculateDistance: calculateDistanceController };
