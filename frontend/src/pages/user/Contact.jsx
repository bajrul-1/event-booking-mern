import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Phone, Mail, MapPin, Send, LoaderCircle, Clock, User, FileText, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import contactValidationSchema from '../../validation/contactSchema';
import { toast } from 'react-toastify';
import axios from 'axios';
import { motion } from 'framer-motion';

function Contact() {
    const { user } = useUser();
    const [cooldown, setCooldown] = useState(0);

    // Initialize/Check Cooldown on Mount
    useEffect(() => {
        if (user) {
            setCooldown(0);
            localStorage.removeItem('contactNextAllowedTime');
            return;
        }

        const nextAllowedTime = localStorage.getItem('contactNextAllowedTime');
        if (nextAllowedTime) {
            const remaining = Math.ceil((parseInt(nextAllowedTime) - Date.now()) / 1000);
            if (remaining > 0) {
                setCooldown(remaining);
            } else {
                localStorage.removeItem('contactNextAllowedTime');
            }
        }
    }, []);

    // Countdown Timer Logic
    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown((prev) => {
                    if (prev <= 1) {
                        localStorage.removeItem('contactNextAllowedTime');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cooldown]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    const initialValues = {
        name: user ? `${user.firstName} ${user.lastName}`.trim() : '',
        email: user ? user.primaryEmailAddress?.emailAddress : '',
        subject: '',
        message: '',
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        if (cooldown > 0) return;

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/contact`, {
                ...values,
                userId: user?.id
            });

            if (response.data.success) {
                toast.success(response.data.message);
                resetForm();

                // Set 5 minute cooldown ONLY for non-logged-in users
                if (!user) {
                    const cooldownSeconds = 300;
                    setCooldown(cooldownSeconds);
                    localStorage.setItem('contactNextAllowedTime', Date.now() + (cooldownSeconds * 1000));
                }
            }
        } catch (error) {
            if (error.response && error.response.status === 429) {
                const remaining = error.response.data.remainingTime;
                toast.error(error.response.data.message);

                if (!user) {
                    setCooldown(remaining);
                    localStorage.setItem('contactNextAllowedTime', Date.now() + (remaining * 1000));
                }
            } else {
                toast.error(error.response?.data?.message || "Failed to send message. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            {/* Hero Section */}
            <section className="relative py-20 bg-white dark:bg-neutral-900 border-b dark:border-neutral-800">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-bold font-heading text-neutral-900 dark:text-neutral-50">
                            Get In <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">Touch</span>
                        </h1>
                        <p className="mt-4 text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                            We'd love to hear from you. Whether you have a question about events, pricing, or anything else, our team is ready to answer all your questions.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 md:py-24 max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">

                    {/* Left: Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="space-y-10"
                    >
                        <div>
                            <h2 className="text-3xl font-bold font-heading text-neutral-800 dark:text-neutral-100">Contact Information</h2>
                            <p className="mt-3 text-lg text-neutral-600 dark:text-neutral-400">
                                Fill up the form and our Team will get back to you within 24 hours.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <ContactInfoCard
                                icon={Phone}
                                title="Call Us"
                                content="+91 62954 45049"
                                link="tel:+916295445049"
                            />
                            <ContactInfoCard
                                icon={Mail}
                                title="Email Us"
                                content="support@eventbooking.com"
                                link="mailto:support@eventbooking.com"
                            />
                            <ContactInfoCard
                                icon={MapPin}
                                title="Visit Us"
                                content="Bankura, West Bengal, India"
                                link="https://www.google.com/maps/search/?api=1&query=Bankura, West Bengal, India"
                            />
                        </div>
                    </motion.div>

                    {/* Right: Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-xl border border-neutral-100 dark:border-neutral-800"
                    >
                        <Formik
                            initialValues={initialValues}
                            validationSchema={contactValidationSchema}
                            onSubmit={handleSubmit}
                            enableReinitialize
                        >
                            {({ isSubmitting }) => (
                                <Form className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputGroup name="name" label="Full Name" placeholder="Rahul Sharma" icon={User} />
                                        <InputGroup name="email" label="Email Address" placeholder="rahul@example.com" icon={Mail} type="email" />
                                    </div>
                                    <InputGroup name="subject" label="Subject" placeholder="How can we help?" icon={FileText} />

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Message</label>
                                        <div className="relative">
                                            <div className="absolute top-3 left-4 text-neutral-500 dark:text-neutral-400">
                                                <MessageSquare size={20} />
                                            </div>
                                            <Field
                                                as="textarea"
                                                name="message"
                                                rows="5"
                                                placeholder="Write your message..."
                                                className="w-full pl-12 pr-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                        <ErrorMessage name="message" component="div" className="text-error-500 text-sm mt-1 ml-1" />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting || cooldown > 0}
                                        className={`w-full flex items-center justify-center gap-2 px-6 py-4 font-bold text-lg rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${isSubmitting || cooldown > 0
                                            ? 'bg-neutral-300 dark:bg-neutral-700 cursor-not-allowed text-neutral-500 dark:text-neutral-400 shadow-none'
                                            : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-primary-500/30'
                                            }`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <LoaderCircle className="animate-spin" size={24} />
                                                Sending...
                                            </>
                                        ) : cooldown > 0 ? (
                                            <>
                                                <Clock size={24} />
                                                Wait {formatTime(cooldown)}
                                            </>
                                        ) : (
                                            <>
                                                <Send size={22} />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </Form>
                            )}
                        </Formik>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

// Helper Components
const ContactInfoCard = ({ icon: Icon, title, content, link }) => (
    <div className="flex items-center gap-5 p-4 rounded-xl hover:bg-white dark:hover:bg-neutral-800 hover:shadow-md transition-all duration-300 border border-transparent hover:border-neutral-100 dark:hover:border-neutral-700">
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-500 shrink-0">
            <Icon size={24} />
        </div>
        <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
            <a href={link} className="text-lg text-neutral-600 dark:text-neutral-400 hover:text-primary-500 transition-colors">
                {content}
            </a>
        </div>
    </div>
);

const InputGroup = ({ name, label, icon: Icon, type = "text", placeholder }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">{label}</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500 dark:text-neutral-400">
                <Icon size={20} />
            </div>
            <Field
                type={type}
                name={name}
                placeholder={placeholder}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
        </div>
        <ErrorMessage name={name} component="div" className="text-error-500 text-sm mt-1 ml-1" />
    </div>
);

export default Contact;
