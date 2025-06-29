import re
from typing import Optional

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_password(password: str) -> bool:
    """Validate password strength"""
    if len(password) < 8:
        return False
    return True

def validate_phone(phone: str) -> bool:
    """Validate phone number format"""
    # Remove all non-digit characters
    digits_only = re.sub(r'\D', '', phone)
    return len(digits_only) >= 10

def validate_url(url: str) -> bool:
    """Validate URL format"""
    pattern = r'^https?://(?:[-\w.])+(?:[:\d]+)?(?:/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?$'
    return bool(re.match(pattern, url))

def sanitize_input(text: str) -> str:
    """Sanitize user input"""
    if not text:
        return ""
    # Remove potentially dangerous characters
    return re.sub(r'[<>"\']', '', text.strip())

def validate_salary_range(min_salary: float, max_salary: float) -> bool:
    """Validate salary range"""
    if min_salary < 0 or max_salary < 0:
        return False
    if min_salary > max_salary:
        return False
    return True

def validate_date_range(start_date, end_date) -> bool:
    """Validate date range"""
    if not start_date or not end_date:
        return False
    if start_date > end_date:
        return False
    return True 