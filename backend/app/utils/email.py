from flask import current_app, render_template_string
from flask_mail import Message
from app import mail
import uuid

def send_verification_email(user):
    """Send email verification email"""
    try:
        # Generate verification token
        verification_token = str(uuid.uuid4())
        user.email_verification_token = verification_token
        user.save()
        
        # Create verification URL
        verification_url = f"{current_app.config.get('FRONTEND_URL', 'http://localhost:3000')}/verify-email/{verification_token}"
        
        # Email template
        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Verify Your Email</title>
        </head>
        <body>
            <h2>Welcome to HandmadeCareers!</h2>
            <p>Please verify your email address by clicking the link below:</p>
            <a href="{{ verification_url }}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Verify Email
            </a>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>{{ verification_url }}</p>
            <p>This link will expire in 24 hours.</p>
        </body>
        </html>
        """
        
        msg = Message(
            subject="Verify Your Email - HandmadeCareers",
            recipients=[user.email],
            html=render_template_string(html_template, verification_url=verification_url)
        )
        
        mail.send(msg)
        return True
        
    except Exception as e:
        print(f"Error sending verification email: {e}")
        return False

def send_password_reset_email(user, reset_token):
    """Send password reset email"""
    try:
        # Create reset URL
        reset_url = f"{current_app.config.get('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token={reset_token}"
        
        # Email template
        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Reset Your Password</title>
        </head>
        <body>
            <h2>Password Reset Request</h2>
            <p>You requested to reset your password. Click the link below to set a new password:</p>
            <a href="{{ reset_url }}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Reset Password
            </a>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>{{ reset_url }}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't request this, please ignore this email.</p>
        </body>
        </html>
        """
        
        msg = Message(
            subject="Reset Your Password - HandmadeCareers",
            recipients=[user.email],
            html=render_template_string(html_template, reset_url=reset_url)
        )
        
        mail.send(msg)
        return True
        
    except Exception as e:
        print(f"Error sending password reset email: {e}")
        return False

def send_application_notification(user, job_title, company_name):
    """Send notification when application is received"""
    try:
        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Application Received</title>
        </head>
        <body>
            <h2>Application Received</h2>
            <p>Your application for <strong>{{ job_title }}</strong> at <strong>{{ company_name }}</strong> has been received.</p>
            <p>We will review your application and get back to you soon.</p>
            <p>Thank you for your interest!</p>
        </body>
        </html>
        """
        
        msg = Message(
            subject=f"Application Received - {job_title}",
            recipients=[user.email],
            html=render_template_string(html_template, job_title=job_title, company_name=company_name)
        )
        
        mail.send(msg)
        return True
        
    except Exception as e:
        print(f"Error sending application notification: {e}")
        return False

def send_interview_invitation(user, job_title, company_name, interview_date, interview_location):
    """Send interview invitation email"""
    try:
        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Interview Invitation</title>
        </head>
        <body>
            <h2>Interview Invitation</h2>
            <p>Congratulations! You have been invited for an interview for <strong>{{ job_title }}</strong> at <strong>{{ company_name }}</strong>.</p>
            <p><strong>Interview Date:</strong> {{ interview_date }}</p>
            <p><strong>Location:</strong> {{ interview_location }}</p>
            <p>Please confirm your attendance and prepare for the interview.</p>
            <p>Good luck!</p>
        </body>
        </html>
        """
        
        msg = Message(
            subject=f"Interview Invitation - {job_title}",
            recipients=[user.email],
            html=render_template_string(html_template, 
                                      job_title=job_title, 
                                      company_name=company_name,
                                      interview_date=interview_date,
                                      interview_location=interview_location)
        )
        
        mail.send(msg)
        return True
        
    except Exception as e:
        print(f"Error sending interview invitation: {e}")
        return False 