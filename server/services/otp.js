// Simple in-memory OTP store (in production, use Redis or database)
const otpStore = new Map();

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP with expiration (5 minutes)
const storeOTP = (identifier, otp) => {
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  otpStore.set(identifier, {
    otp,
    expiresAt,
    attempts: 0
  });
  
  // Clean up expired OTPs
  setTimeout(() => {
    otpStore.delete(identifier);
  }, 5 * 60 * 1000);
};

// Verify OTP
const verifyOTP = (identifier, otp) => {
  const stored = otpStore.get(identifier);
  
  if (!stored) {
    return { valid: false, message: 'OTP not found or expired' };
  }
  
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(identifier);
    return { valid: false, message: 'OTP has expired' };
  }
  
  if (stored.attempts >= 5) {
    otpStore.delete(identifier);
    return { valid: false, message: 'Too many attempts. Please request a new OTP' };
  }
  
  stored.attempts++;
  
  if (stored.otp !== otp) {
    return { valid: false, message: 'Invalid OTP' };
  }
  
  // OTP verified successfully
  otpStore.delete(identifier);
  return { valid: true, message: 'OTP verified successfully' };
};

// Get OTP for identifier (for testing/development)
const getOTP = (identifier) => {
  const stored = otpStore.get(identifier);
  return stored ? stored.otp : null;
};

// Simulate sending OTP via SMS/Email
// In production, integrate with SMS gateway (Twilio, AWS SNS) or Email service (SendGrid, AWS SES)
const sendOTP = async (identifier, otp, method = 'sms') => {
  // Simulate sending delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In development, log the OTP to console
  console.log(`\n📱 OTP for ${identifier}: ${otp} (Valid for 5 minutes)\n`);
  
  // In production, implement actual SMS/Email sending here
  // Example:
  // if (method === 'sms') {
  //   await sendSMS(identifier, `Your OTP is: ${otp}`);
  // } else {
  //   await sendEmail(identifier, 'Your OTP', `Your OTP is: ${otp}`);
  // }
  
  return { success: true, message: `OTP sent to ${identifier}` };
};

module.exports = {
  generateOTP,
  storeOTP,
  verifyOTP,
  getOTP,
  sendOTP
};

