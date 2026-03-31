from flask import Blueprint, request, jsonify
import math

distance_bp = Blueprint('distance', __name__)

@distance_bp.route('', methods=['GET'])
def calculate_distance():
    lat1 = request.args.get('lat1')
    lon1 = request.args.get('lon1')
    lat2 = request.args.get('lat2')
    lon2 = request.args.get('lon2')

    if not all([lat1, lon1, lat2, lon2]):
        return jsonify({'message': 'lat1, lon1, lat2, lon2 are required'}), 400

    lat1, lon1, lat2, lon2 = map(float, [lat1, lon1, lat2, lon2])
    R = 6371
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = math.sin(d_lat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon/2)**2
    dist = R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

    return jsonify({'distance': round(dist, 2)}), 200
