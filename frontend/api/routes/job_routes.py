from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.models import JobVacancy
from models.shop import Shop
from models.user import User

job_bp = Blueprint('jobs', __name__)

@job_bp.route('', methods=['GET'])
def get_jobs():
    jobs = JobVacancy.query.filter_by(is_active=True).order_by(JobVacancy.created_at.desc()).all()
    return jsonify([j.to_dict() for j in jobs]), 200

@job_bp.route('', methods=['POST'])
@jwt_required()
def create_job():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    shop = Shop.query.filter_by(owner_id=user_id).first()
    if not shop:
        return jsonify({'message': 'No shop found'}), 404
    job = JobVacancy(
        shop_id=shop.id,
        title=data.get('title'),
        description=data.get('description'),
        salary=data.get('salary'),
        job_type=data.get('jobType'),
        requirements=data.get('requirements')
    )
    db.session.add(job)
    db.session.commit()
    return jsonify(job.to_dict()), 201

@job_bp.route('/<int:job_id>', methods=['PUT'])
@jwt_required()
def update_job(job_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    job = JobVacancy.query.get(job_id)
    if not job:
        return jsonify({'message': 'Job not found'}), 404
    if job.shop.owner_id != user_id and user.role != 'ADMIN':
        return jsonify({'message': 'Not authorized'}), 401
    data = request.get_json()
    for field in ['title', 'description', 'salary', 'requirements']:
        if field in data: setattr(job, field, data[field])
    if 'jobType' in data: job.job_type = data['jobType']
    if 'isActive' in data: job.is_active = bool(data['isActive'])
    db.session.commit()
    return jsonify(job.to_dict()), 200

@job_bp.route('/<int:job_id>', methods=['DELETE'])
@jwt_required()
def delete_job(job_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    job = JobVacancy.query.get(job_id)
    if not job:
        return jsonify({'message': 'Job not found'}), 404
    if job.shop.owner_id != user_id and user.role != 'ADMIN':
        return jsonify({'message': 'Not authorized'}), 401
    db.session.delete(job)
    db.session.commit()
    return jsonify({'message': 'Job removed'}), 200
