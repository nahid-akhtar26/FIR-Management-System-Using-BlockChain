const { body } = require('express-validator');

const submitFIRValidator = [
  body('complainantName').trim().notEmpty().withMessage('Complainant name is required'),
  body('complainantPhone').trim().notEmpty().withMessage('Phone number is required'),
  body('complainantEmail').isEmail().withMessage('Valid email is required'),
  body('complainantAddress').trim().notEmpty().withMessage('Address is required'),
  body('incidentDate').notEmpty().withMessage('Incident date is required'),
  body('incidentLocation').trim().notEmpty().withMessage('Incident location is required'),
  body('incidentDescription').trim().isLength({ min: 10 }).withMessage('Incident description should be at least 10 characters')
];

module.exports = {
  submitFIRValidator
};
