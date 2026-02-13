import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    ArrowLeft, Mail, Phone, MapPin, Calendar,
    User, Shield, Activity, LoaderCircle
} from 'lucide-react';
import { fetchAllOrganizers } from '../../redux/features/organizer/organizerSlice';

const OrganizerProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Get organizer from Redux store
    const { items: organizers, status } = useSelector((state) => state.organizers);
    const [organizer, setOrganizer] = useState(null);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchAllOrganizers());
        }
    }, [status, dispatch]);

    useEffect(() => {
        if (organizers.length > 0) {
            const foundOrganizer = organizers.find(org => org._id === id);
            setOrganizer(foundOrganizer);
        }
    }, [organizers, id]);

    if (status === 'loading' || !organizer) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <LoaderCircle className="animate-spin text-primary-600" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-neutral-500 hover:text-primary-600 transition-colors"
            >
                <ArrowLeft size={20} />
                <span>Back to Organizers</span>
            </button>

            {/* Profile Header Card */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden relative">
                <div className="h-48 bg-neutral-200 dark:bg-neutral-700 relative">
                    {organizer.coverImage ? (
                        <img
                            src={`${import.meta.env.VITE_API_URL}${organizer.coverImage.startsWith('/') ? '' : '/'}${organizer.coverImage}`}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-primary-600 to-secondary-600"></div>
                    )}
                </div>
                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="flex items-end gap-6">
                            <div className="w-32 h-32 rounded-full bg-white dark:bg-neutral-800 p-1.5 shadow-lg overflow-hidden shrink-0">
                                {organizer.profileImage ? (
                                    <img
                                        src={`${import.meta.env.VITE_API_URL}${organizer.profileImage.startsWith('/') ? '' : '/'}${organizer.profileImage}`}
                                        alt={organizer.name?.firstName}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-4xl font-bold text-primary-600 dark:text-primary-400">
                                        {organizer.name?.firstName?.[0]}
                                    </div>
                                )}
                            </div>
                            <div className="mb-1">
                                <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-3">
                                    {organizer.name?.firstName} {organizer.name?.lastName}
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${organizer.status === 'active'
                                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                                        : 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-700 dark:text-neutral-400 dark:border-neutral-600'
                                        }`}>
                                        {organizer.status === 'active' ? 'Active Account' : 'Inactive'}
                                    </span>
                                </h1>
                                <p className="text-neutral-500 dark:text-neutral-400 flex items-center gap-2 mt-1">
                                    <Shield size={16} />
                                    Organizer Role
                                    <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-600"></span>
                                    Joined {new Date(organizer.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Left Column: Bio & Personal Info */}
                        <div className="md:col-span-2 space-y-8">
                            {/* Bio Section */}
                            <section>
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-3 flex items-center gap-2">
                                    <User size={20} className="text-primary-500" />
                                    About
                                </h3>
                                <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-neutral-700/30 p-4 rounded-xl border border-neutral-100 dark:border-neutral-700">
                                    {organizer.bio || "No bio information provided."}
                                </p>
                            </section>

                            {/* Personal Details Grid */}
                            <section>
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-4 flex items-center gap-2">
                                    <Activity size={20} className="text-secondary-500" />
                                    Personal Information
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 flex items-center gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-semibold tracking-wider">Date of Birth</p>
                                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                                {organizer.dob ? new Date(organizer.dob).toLocaleDateString() : 'Not Provided'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 flex items-center gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-semibold tracking-wider">Gender</p>
                                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 capitalize">
                                                {organizer.gender || 'Not Provided'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Right Column: Contact & Address */}
                        <div className="space-y-6">
                            <div className="bg-neutral-50 dark:bg-neutral-700/20 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-4">Contact Details</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Mail className="text-neutral-400 mt-1" size={18} />
                                        <div>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-semibold">Email Address</p>
                                            <p className="text-sm text-neutral-900 dark:text-neutral-200 break-all">{organizer.email}</p>
                                        </div>
                                    </div>
                                    <div className="w-full h-px bg-neutral-200 dark:bg-neutral-600"></div>
                                    <div className="flex items-start gap-3">
                                        <Phone className="text-neutral-400 mt-1" size={18} />
                                        <div>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-semibold">Phone Number</p>
                                            <p className="text-sm text-neutral-900 dark:text-neutral-200">{organizer.phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-neutral-50 dark:bg-neutral-700/20 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-4">Address</h3>
                                <div className="flex items-start gap-3">
                                    <MapPin className="text-error-500 mt-1" size={18} />
                                    <div>
                                        <p className="text-sm text-neutral-900 dark:text-neutral-200 leading-relaxed">
                                            {organizer.address?.street && <>{organizer.address.street}<br /></>}
                                            {organizer.address?.city && <>{organizer.address.city}, </>}
                                            {organizer.address?.state} {organizer.address?.zip}<br />
                                            {organizer.address?.country}
                                            {!organizer.address?.street && !organizer.address?.city && <span className="text-neutral-400 italic">No address provided</span>}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizerProfile;
