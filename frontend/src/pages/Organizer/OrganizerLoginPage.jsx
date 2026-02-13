import { useUser, SignOutButton } from '@clerk/clerk-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useNavigate, Navigate } from 'react-router-dom';
import { LogIn, LogOut } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { loginOrganizer } from '../../redux/features/organizer/organizerAuthSlice';


const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

function OrganizerLoginPage() {
    const { isSignedIn, user } = useUser() || {};
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // useSelector-ke safe kora hoyeche. Jodi organizerAuth slice na thake, tahole crash na kore empty value debe.
    const { token } = useSelector((state) => state.organizerAuth || { token: null });

    const handleOrganizerLogin = (values, { setSubmitting }) => {

        dispatch(loginOrganizer(values))
            .unwrap()
            .then(() => {
                toast.success('Login successful!');
                navigate('/organizer/dashboard');
            })
            .catch((err) => {
                toast.error(err || 'Login failed. Please check your credentials.');
            })
            .finally(() => {
                setSubmitting(false);
            });
    };

    if (token) {
        return <Navigate to="/organizer/dashboard" replace />;
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-4"
        >
            <div className="relative z-10 w-full max-w-md">
                {isSignedIn ? (
                    <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl text-center text-white border border-white/20">
                        <h1 className="text-3xl font-bold font-heading">Access Denied</h1>
                        <p className="mt-2 text-neutral-200">
                            Hi {user?.firstName}, this portal is for organizers only. Please sign out to continue.
                        </p>
                        <div className="mt-6 flex justify-center">
                            <SignOutButton>
                                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-error-500 text-white font-semibold rounded-lg hover:bg-error-600 transition-colors">
                                    <LogOut size={18} />
                                    Sign Out
                                </button>
                            </SignOutButton>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold font-heading text-white">Organizer Portal</h1>
                            <p className="mt-2 text-neutral-200">Sign in to manage your events.</p>
                        </div>
                        <Formik
                            initialValues={{ email: '', password: '' }}
                            validationSchema={LoginSchema}
                            onSubmit={handleOrganizerLogin}
                        >
                            {({ isSubmitting }) => (
                                <Form className="space-y-6">
                                    <div>
                                        <Field
                                            type="email"
                                            name="email"
                                            placeholder="Email Address"
                                            className="w-full px-4 py-3 bg-white/20 text-white placeholder-neutral-300 rounded-lg border-2 border-transparent focus:border-primary-500 focus:bg-white/30 outline-none transition-all"
                                        />
                                        <ErrorMessage name="email" component="div" className="text-red-400 text-sm mt-1" />
                                    </div>
                                    <div>
                                        <Field
                                            type="password"
                                            name="password"
                                            placeholder="Password"
                                            className="w-full px-4 py-3 bg-white/20 text-white placeholder-neutral-300 rounded-lg border-2 border-transparent focus:border-primary-500 focus:bg-white/30 outline-none transition-all"
                                        />
                                        <ErrorMessage name="password" component="div" className="text-red-400 text-sm mt-1" />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                                    >
                                        <LogIn size={18} />
                                        {isSubmitting ? 'Signing In...' : 'Sign In'}
                                    </button>
                                </Form>
                            )}
                        </Formik>
                    </div>
                )}
            </div>
        </div>
    );
}

export default OrganizerLoginPage;

