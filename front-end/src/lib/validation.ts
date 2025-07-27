// Validation utility functions

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface PasswordStrength {
  score: number;
  checks: {
    length: boolean;
    lowercase: boolean;
    uppercase: boolean;
    number: boolean;
    special: boolean;
  };
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  if (!email || !email.trim()) {
    return { isValid: false, message: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  // Additional checks for common email issues
  const normalizedEmail = email.trim().toLowerCase();
  
  // Check for common disposable email domains
  const disposableDomains = [
    'tempmail.com', '10minutemail.com', 'guerrillamail.com', 
    'mailinator.com', 'yopmail.com', 'throwaway.com'
  ];
  
  const domain = normalizedEmail.split('@')[1];
  if (disposableDomains.includes(domain)) {
    return { isValid: false, message: 'Please use a valid email address' };
  }

  return { isValid: true };
};

// Name validation
export const validateName = (name: string): ValidationResult => {
  if (!name || !name.trim()) {
    return { isValid: false, message: 'Name is required' };
  }

  const cleanedName = name.trim();
  
  if (cleanedName.length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters long' };
  }

  if (cleanedName.length > 50) {
    return { isValid: false, message: 'Name must be no more than 50 characters long' };
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(cleanedName)) {
    return { isValid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  // Check for excessive spaces
  if (cleanedName.includes('  ')) {
    return { isValid: false, message: 'Name cannot contain multiple consecutive spaces' };
  }

  return { isValid: true };
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }

  const strength = getPasswordStrength(password);
  
  if (strength.score < 3) {
    return { isValid: false, message: 'Password is too weak. Include lowercase, uppercase, numbers, and special characters' };
  }

  return { isValid: true };
};

// Password strength checker
export const getPasswordStrength = (password: string): PasswordStrength => {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  const score = Object.values(checks).filter(Boolean).length;

  return { score, checks };
};

// Confirm password validation
export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, message: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match' };
  }

  return { isValid: true };
};

// Location validation
export const validateLocation = (location: string): ValidationResult => {
  if (!location || !location.trim()) {
    return { isValid: true }; // Location is optional
  }

  const cleanedLocation = location.trim();
  
  if (cleanedLocation.length < 2) {
    return { isValid: false, message: 'Location must be at least 2 characters long' };
  }

  if (cleanedLocation.length > 100) {
    return { isValid: false, message: 'Location must be no more than 100 characters long' };
  }

  return { isValid: true };
};

// File validation
export const validateFile = (file: File | null): ValidationResult => {
  if (!file) {
    return { isValid: true }; // File is optional
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { isValid: false, message: 'File size must be less than 5MB' };
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, message: 'Please select an image file' };
  }

  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const fileName = file.name.toLowerCase();
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
  
  if (!hasValidExtension) {
    return { isValid: false, message: 'Please select a valid image file (JPG, PNG, GIF, or WebP)' };
  }

  return { isValid: true };
};

// Form validation helper
export const validateForm = (formData: Record<string, any>, validationRules: Record<string, (value: any) => ValidationResult>): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.keys(validationRules).forEach(field => {
    const value = formData[field];
    const validationResult = validationRules[field](value);
    
    if (!validationResult.isValid) {
      errors[field] = validationResult.message || `${field} is invalid`;
    }
  });

  return errors;
};

// Real-time validation helper
export const validateField = (
  field: string, 
  value: any, 
  validationRules: Record<string, (value: any) => ValidationResult>
): string | null => {
  const validator = validationRules[field];
  if (!validator) return null;

  const result = validator(value);
  return result.isValid ? null : result.message || null;
}; 