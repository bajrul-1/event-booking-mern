import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

// --- THE FIX IS HERE ---
// 'profileSchema'-ke function-er baire, shobar upore ana hoyeche
const profileSchema = Yup.object().shape({
    phone: Yup.string()
        .matches(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number.')
        .required('Phone number is required.'),
    dob: Yup.date()
        .max(new Date(), 'Date of birth cannot be in the future.')
        .required('Date of birth is required.'),
});

function CompleteProfile() {
    const navigate = useNavigate();
    const location = useLocation();
    const { getToken } = useAuth();
    const { user } = useUser();

    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (values, { setSubmitting }) => {
        const toastId = toast.loading("Saving your profile, please wait...");

        try {
            const token = await getToken();
            await axios.post(`${import.meta.env.VITE_API_URL}/api/users/complete-profile`, values, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (user) {
                await user.reload();
            }

            toast.update(toastId, {
                render: "Your profile has been saved successfully!",
                type: "success",
                isLoading: false,
                autoClose: 3000
            });

            navigate(from, { replace: true });

        } catch (error) {
            console.error("Error saving profile:", error.response || error);
            const userFriendlyMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
            toast.update(toastId, {
                render: userFriendlyMessage,
                type: "error",
                isLoading: false,
                autoClose: 5000
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-950 p-4">
            <div className="w-full max-w-md bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold font-heading text-center text-neutral-800 dark:text-neutral-100">Complete Your Profile</h1>
                <p className="text-center text-neutral-600 dark:text-neutral-400 mt-2">
                    We need a few more details to get you started.
                </p>

                <Formik
                    initialValues={{ phone: '', dob: '' }}
                    validationSchema={profileSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form className="mt-8 space-y-6">
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Phone Number</label>
                                <Field
                                    type="tel"
                                    name="phone"
                                    className="mt-1 block w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <ErrorMessage name="phone" component="div" className="text-error-500 text-sm mt-1" />
                            </div>
                            <div>
                                <label htmlFor="dob" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Date of Birth</label>
                                <Field
                                    type="date"
                                    name="dob"
                                    className="mt-1 block w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <ErrorMessage name="dob" component="div" className="text-error-500 text-sm mt-1" />
                            </div>

                            <button type="submit" disabled={isSubmitting} className="w-full py-3 px-4 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-600 disabled:opacity-50">
                                {isSubmitting ? 'Saving...' : 'Save & Continue'}
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}

export default CompleteProfile;