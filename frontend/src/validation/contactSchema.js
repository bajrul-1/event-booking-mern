import * as Yup from 'yup';

const contactValidationSchema = Yup.object({
    name: Yup.string()
        .min(3, 'Name must be at least 3 characters')
        .matches(/^[a-zA-Z ]*$/, 'Name can only contain letters and spaces')
        .required('Name is required'),
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    subject: Yup.string()
        .required('Subject is required'),
    message: Yup.string()
        .min(10, 'Message must be at least 10 characters')
        .required('Message is required'),
});

export default contactValidationSchema;