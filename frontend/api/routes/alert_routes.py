from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from database import db
from models.models import Alert
from models.user import User
import uuid, math

alert_bp = Blueprint('alerts', __name__)

def get_optional_user():
    try:
        verify_jwt_in_request(optional=True)
        uid = get_jwt_identity()
        if uid:
            return User.query.get(int(uid))
    except Exception:
        pass
    return None

@alert_bp.route('', methods=['GET'])
def get_alerts():
    alerts = Alert.query.order_by(Alert.created_at.desc()).limit(100).all()
    return jsonify([a.to_dict() for a in alerts]), 200

@alert_bp.route('', methods=['POST'])
def create_alert():
    current_user = get_optional_user()
    data = request.get_json()
    alert = Alert(
        id=str(uuid.uuid4()),
        title=data.get('title'),
        description=data.get('description'),
        type=data.get('type'),
        location=data.get('location'),
        latitude=float(data['latitude']) if data.get('latitude') else None,
        longitude=float(data['longitude']) if data.get('longitude') else None,
        image_url=data.get('imageUrl'),
        user_id=current_user.id if current_user and not data.get('anonymous') else None,
        anonymous=bool(data.get('anonymous', False)),
        ip_address=request.remote_addr or '',
        verified=False
    )
    db.session.add(alert)
    db.session.commit()
    
    # Broadcast via Socket.io
    from database import socketio
    alert_dict = alert.to_dict()
    # If the user created it and isn't anonymous, attach user name.
    if current_user and not alert.anonymous:
        alert_dict['userName'] = current_user.full_name
    elif alert.anonymous:
        alert_dict['userName'] = 'Anonymous'
    else:
        alert_dict['userName'] = 'Guest'
        
    socketio.emit('new_alert', alert_dict)
    
    return jsonify(alert_dict), 201

@alert_bp.route('/<alert_id>/verify', methods=['PUT'])
@jwt_required()
def verify_alert(alert_id):
    admin_id = int(get_jwt_identity())
    admin = User.query.get(admin_id)
    if not admin or admin.role != 'ADMIN':
        return jsonify({'message': 'Not authorized'}), 403
    alert = Alert.query.get(alert_id)
    if not alert:
        return jsonify({'message': 'Alert not found'}), 404
    alert.verified = True
    db.session.commit()
    return jsonify(alert.to_dict()), 200

@alert_bp.route('/nearby', methods=['GET'])
def get_nearby_alerts():
    lat = request.args.get('lat')
    lng = request.args.get('lng')
    radius = float(request.args.get('radius', 10))

    if not lat or not lng:
        return jsonify({'message': 'lat and lng required'}), 400

    lat, lng = float(lat), float(lng)
    alerts = Alert.query.all()
    result = []
    for a in alerts:
        if a.latitude and a.longitude:
            d_lat = math.radians(a.latitude - lat)
            d_lon = math.radians(a.longitude - lng)
            ha = math.sin(d_lat/2)**2 + math.cos(math.radians(lat)) * math.cos(math.radians(a.latitude)) * math.sin(d_lon/2)**2
            dist = 6371 * 2 * math.atan2(math.sqrt(ha), math.sqrt(1-ha))
            if dist <= radius:
                d = a.to_dict()
                d['distance'] = round(dist, 2)
                result.append(d)
    result.sort(key=lambda x: x.get('distance', 0))
    return jsonify(result), 200
