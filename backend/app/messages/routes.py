from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db, socketio
from app.models.user import User
from app.models.job import Job
from app.models.message import Message, Conversation
from datetime import datetime

messages_bp = Blueprint('messages', __name__)

@messages_bp.route('/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    """Get all conversations for current user"""
    try:
        current_user_id = get_jwt_identity()
        
        conversations = Conversation.query.filter(
            (Conversation.participant1_id == current_user_id) |
            (Conversation.participant2_id == current_user_id)
        ).filter(Conversation.is_active == True).order_by(Conversation.last_message_at.desc()).all()
        
        return jsonify({
            'conversations': [conv.to_dict() for conv in conversations]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/conversations/<conversation_id>/messages', methods=['GET'])
@jwt_required()
def get_messages(conversation_id):
    """Get messages in a conversation"""
    try:
        current_user_id = get_jwt_identity()
        conversation = Conversation.query.get(conversation_id)
        
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404
        
        # Check if user is part of this conversation
        if conversation.participant1_id != current_user_id and conversation.participant2_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        messages = Message.query.filter_by(conversation_id=conversation_id).order_by(
            Message.created_at.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)
        
        # Mark messages as read
        unread_messages = Message.query.filter_by(
            conversation_id=conversation_id,
            recipient_id=current_user_id,
            is_read=False
        ).all()
        
        for msg in unread_messages:
            msg.mark_as_read()
        
        return jsonify({
            'messages': [msg.to_dict() for msg in messages.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': messages.total,
                'pages': messages.pages,
                'has_next': messages.has_next,
                'has_prev': messages.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/conversations', methods=['POST'])
@jwt_required()
def create_conversation():
    """Create a new conversation"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data.get('participant_id'):
            return jsonify({'error': 'Participant ID is required'}), 400
        
        # Check if conversation already exists
        existing_conversation = Conversation.query.filter(
            ((Conversation.participant1_id == current_user_id) & 
             (Conversation.participant2_id == data['participant_id'])) |
            ((Conversation.participant1_id == data['participant_id']) & 
             (Conversation.participant2_id == current_user_id))
        ).first()
        
        if existing_conversation:
            return jsonify({
                'message': 'Conversation already exists',
                'conversation': existing_conversation.to_dict()
            }), 200
        
        conversation = Conversation(
            participant1_id=current_user_id,
            participant2_id=data['participant_id'],
            job_id=data.get('job_id'),
            subject=data.get('subject')
        )
        
        db.session.add(conversation)
        db.session.commit()
        
        return jsonify({
            'message': 'Conversation created successfully',
            'conversation': conversation.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/conversations/<conversation_id>/messages', methods=['POST'])
@jwt_required()
def send_message(conversation_id):
    """Send a message in a conversation"""
    try:
        current_user_id = get_jwt_identity()
        conversation = Conversation.query.get(conversation_id)
        
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404
        
        # Check if user is part of this conversation
        if conversation.participant1_id != current_user_id and conversation.participant2_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        if not data.get('content'):
            return jsonify({'error': 'Message content is required'}), 400
        
        # Determine recipient
        recipient_id = conversation.participant2_id if conversation.participant1_id == current_user_id else conversation.participant1_id
        
        message = Message(
            conversation_id=conversation_id,
            sender_id=current_user_id,
            recipient_id=recipient_id,
            content=data['content'],
            message_type=data.get('message_type', 'text'),
            attachment_url=data.get('attachment_url'),
            attachment_name=data.get('attachment_name'),
            attachment_size=data.get('attachment_size')
        )
        
        db.session.add(message)
        
        # Update conversation last message time
        conversation.last_message_at = datetime.utcnow()
        
        db.session.commit()
        
        # Emit socket event for real-time messaging
        socketio.emit('new_message', {
            'conversation_id': conversation_id,
            'message': message.to_dict()
        }, room=conversation_id)
        
        return jsonify({
            'message': 'Message sent successfully',
            'message_data': message.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/messages/<message_id>/read', methods=['PUT'])
@jwt_required()
def mark_message_read(message_id):
    """Mark a message as read"""
    try:
        current_user_id = get_jwt_identity()
        message = Message.query.get(message_id)
        
        if not message:
            return jsonify({'error': 'Message not found'}), 404
        
        if message.recipient_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        message.mark_as_read()
        
        return jsonify({'message': 'Message marked as read'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/conversations/<conversation_id>', methods=['DELETE'])
@jwt_required()
def delete_conversation(conversation_id):
    """Delete a conversation"""
    try:
        current_user_id = get_jwt_identity()
        conversation = Conversation.query.get(conversation_id)
        
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404
        
        # Check if user is part of this conversation
        if conversation.participant1_id != current_user_id and conversation.participant2_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        conversation.is_active = False
        db.session.commit()
        
        return jsonify({'message': 'Conversation deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    """Get count of unread messages"""
    try:
        current_user_id = get_jwt_identity()
        
        unread_count = Message.query.filter_by(
            recipient_id=current_user_id,
            is_read=False
        ).count()
        
        return jsonify({'unread_count': unread_count}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 