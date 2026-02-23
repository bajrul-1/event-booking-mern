import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Settings, Save, LoaderCircle, Globe, Mail, Phone, IndianRupee, Share2, FileText } from 'lucide-react';

const AdminSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        siteName: '',
        contactEmail: '',
        contactPhone: '',
        contactAddress: '',
        currency: 'INR',
        seoDescription: '',
        socialLinks: {
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: ''
        }
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/settings`);
            if (response.data.success && response.data.settings) {
                setSettings(response.data.settings);
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
            toast.error("Failed to load settings.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('social_')) {
            const socialPlatform = name.split('_')[1];
            setSettings(prev => ({
                ...prev,
                socialLinks: {
                    ...prev.socialLinks,
                    [socialPlatform]: value
                }
            }));
        } else {
            setSettings(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('organizerToken');
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/settings`, settings, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                toast.success("Settings updated successfully!");
                setSettings(response.data.settings);
            }
        } catch (error) {
            console.error("Error updating settings:", error);
            toast.error("Failed to update settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoaderCircle size={48} className="animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="flex justify-between items-center mb-6 border-b pb-4 dark:border-neutral-700">
                <h1 className="text-3xl font-bold font-heading text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                    <Settings className="text-primary-500" /> Site Settings
                </h1>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                    {saving ? <LoaderCircle size={18} className="animate-spin" /> : <Save size={18} />}
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* General Information */}
                <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                    <div className="bg-neutral-50 dark:bg-neutral-700/50 p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-2">
                        <Globe className="text-neutral-500" size={20} />
                        <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">General Information</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Site Name</label>
                            <input
                                type="text"
                                name="siteName"
                                value={settings.siteName || ''}
                                onChange={handleChange}
                                placeholder="EventBooking"
                                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-700 dark:text-neutral-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                                <IndianRupee size={14} /> Currency
                            </label>
                            <select
                                name="currency"
                                value={settings.currency || 'INR'}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-700 dark:text-neutral-200"
                            >
                                <option value="INR">INR (₹)</option>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                            </select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                                <FileText size={14} /> SEO Meta Description
                            </label>
                            <textarea
                                name="seoDescription"
                                value={settings.seoDescription || ''}
                                onChange={handleChange}
                                rows="3"
                                placeholder="A brief description of your platform for search engines..."
                                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-700 dark:text-neutral-200"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                    <div className="bg-neutral-50 dark:bg-neutral-700/50 p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-2">
                        <Mail className="text-neutral-500" size={20} />
                        <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">Contact Information</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Public Contact Email</label>
                            <input
                                type="email"
                                name="contactEmail"
                                value={settings.contactEmail || ''}
                                onChange={handleChange}
                                placeholder="support@eventbooking.com"
                                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-700 dark:text-neutral-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                                <Phone size={14} /> Contact Phone Number
                            </label>
                            <input
                                type="text"
                                name="contactPhone"
                                value={settings.contactPhone || ''}
                                onChange={handleChange}
                                placeholder="+91 98765 43210"
                                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-700 dark:text-neutral-200"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Office Address</label>
                            <input
                                type="text"
                                name="contactAddress"
                                value={settings.contactAddress || ''}
                                onChange={handleChange}
                                placeholder="Bankura, West Bengal, India"
                                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-700 dark:text-neutral-200"
                            />
                        </div>
                    </div>
                </div>

                {/* Social Links */}
                <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                    <div className="bg-neutral-50 dark:bg-neutral-700/50 p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-2">
                        <Share2 className="text-neutral-500" size={20} />
                        <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">Social Media Links</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Facebook URL</label>
                            <input
                                type="url"
                                name="social_facebook"
                                value={settings.socialLinks?.facebook || ''}
                                onChange={handleChange}
                                placeholder="https://facebook.com/yourpage"
                                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-700 dark:text-neutral-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Instagram URL</label>
                            <input
                                type="url"
                                name="social_instagram"
                                value={settings.socialLinks?.instagram || ''}
                                onChange={handleChange}
                                placeholder="https://instagram.com/yourhandle"
                                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-700 dark:text-neutral-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Twitter (X) URL</label>
                            <input
                                type="url"
                                name="social_twitter"
                                value={settings.socialLinks?.twitter || ''}
                                onChange={handleChange}
                                placeholder="https://twitter.com/yourhandle"
                                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-700 dark:text-neutral-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">LinkedIn URL</label>
                            <input
                                type="url"
                                name="social_linkedin"
                                value={settings.socialLinks?.linkedin || ''}
                                onChange={handleChange}
                                placeholder="https://linkedin.com/company/yourcompany"
                                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-700 dark:text-neutral-200"
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AdminSettings;
