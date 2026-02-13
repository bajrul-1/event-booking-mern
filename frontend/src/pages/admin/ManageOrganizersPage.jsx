import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    UserPlus, LoaderCircle, Trash2, CheckCircle, XCircle,
    Edit, Eye, MoreVertical, Search, X, AlertTriangle, Calendar, Phone, MapPin, Upload, Image, Camera
} from 'lucide-react';
import {
    createNewOrganizer,
    fetchAllOrganizers,
    clearOrganizerError,
    updateOrganizerStatus,
    updateOrganizer,
    deleteOrganizer
} from '../../redux/features/organizer/organizerSlice.js';

// Validation Schemas
const OrganizerSchema = Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').when('isEdit', {
        is: false,
        then: (schema) => schema.required('Password is required'),
        otherwise: (schema) => schema.optional(),
    }),
    phone: Yup.string().optional(),
    gender: Yup.string().oneOf(['male', 'female', 'other'], 'Invalid gender').optional(),
    dob: Yup.date().optional(),
    address: Yup.object().shape({
        street: Yup.string().optional(),
        city: Yup.string().optional(),
        state: Yup.string().optional(),
        zip: Yup.string().optional(),
        country: Yup.string().optional(),
    }),
    bio: Yup.string().optional(),
});

function ManageOrganizersPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items: organizers, status, error } = useSelector((state) => state.organizers) || {};

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedOrganizer, setSelectedOrganizer] = useState(null);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit' | 'view'
    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const [coverImagePreview, setCoverImagePreview] = useState(null);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchAllOrganizers());
        }
    }, [status, dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearOrganizerError());
        }
    }, [error, dispatch]);

    const handleOpenCreateModal = () => {
        setSelectedOrganizer(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (organizer) => {
        setSelectedOrganizer(organizer);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (organizer) => {
        setSelectedOrganizer(organizer);
        setIsDeleteModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrganizer(null);
        setProfileImagePreview(null);
        setCoverImagePreview(null);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedOrganizer(null);
    };

    const handleSubmit = (values, { setSubmitting, resetForm }) => {
        const formData = new FormData();
        Object.keys(values).forEach(key => {
            if (key === 'address') {
                formData.append('address', JSON.stringify(values.address)); // Address needs to be stringified or appended individually
            } else if (key === 'profileImage' || key === 'coverImage') {
                if (values[key]) formData.append(key, values[key]);
            } else {
                formData.append(key, values[key]);
            }
        });

        // For backend logic that expects address fields individually, or simpler JSON parsing
        // Append address nested fields manually if backend expects flattened structure or parse it there
        // Current backend controller extracts address object directly. Multer doesn't parse nested objects in body automatically with FormData.
        // Quick fix: Backend updateOrganizer extracts `req.body.address`. 
        // With FormData, `req.body` will contain [Object null prototype].
        // Ideally we append `address[street]`, `address[city]`, etc.

        // Re-doing FormData appending for nested objects:
        const formDataFinal = new FormData();
        Object.keys(values).forEach(key => {
            if (key === 'address') {
                // Skip address here, handle below
            } else if (key === 'profileImage' || key === 'coverImage') {
                if (values[key]) formDataFinal.append(key, values[key]);
            } else {
                formDataFinal.append(key, values[key]);
            }
        });

        if (values.address) {
            formDataFinal.append('address[street]', values.address.street || '');
            formDataFinal.append('address[city]', values.address.city || '');
            formDataFinal.append('address[state]', values.address.state || '');
            formDataFinal.append('address[zip]', values.address.zip || '');
            formDataFinal.append('address[country]', values.address.country || '');
        }


        if (modalMode === 'create') {
            dispatch(createNewOrganizer(formDataFinal))
                .unwrap()
                .then((data) => {
                    toast.success(data.message || 'Organizer created successfully!');
                    closeModal();
                    resetForm();
                })
                .catch((err) => toast.error(err))
                .finally(() => setSubmitting(false));
        } else if (modalMode === 'edit') {
            const updateData = formDataFinal;
            // Password logic handled in backend if present in formData

            // Remove password if empty (FormData handles empty strings, backend checks if truthy)
            if (!values.password) {
                // cant remove from FormData easily, just rely on backend check
            }

            dispatch(updateOrganizer({ id: selectedOrganizer._id, organizerData: updateData }))
                .unwrap()
                .then(() => {
                    toast.success('Organizer updated successfully!');
                    closeModal();
                })
                .catch((err) => toast.error(err))
                .finally(() => setSubmitting(false));
        }
    };

    const handleDelete = () => {
        if (selectedOrganizer) {
            dispatch(deleteOrganizer(selectedOrganizer._id))
                .unwrap()
                .then(() => {
                    toast.success('Organizer deleted successfully');
                    closeDeleteModal();
                })
                .catch((err) => toast.error(err));
        }
    };

    const handleToggleStatus = (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        dispatch(updateOrganizerStatus({ id, status: newStatus }))
            .unwrap()
            .then(() => toast.success(`Organizer marked as ${newStatus}`))
            .catch((err) => toast.error(err));
    };

    const filteredOrganizers = organizers.filter(org =>
        org.name.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.name.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-heading text-neutral-900 dark:text-neutral-50">
                        Manage Organizers
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        View, add, edit, and manage platform organizers.
                    </p>
                </div>
                <button
                    onClick={handleOpenCreateModal}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium text-sm"
                >
                    <UserPlus size={18} />
                    Add Organizer
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700/50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-50 dark:bg-neutral-700/50 text-neutral-500 dark:text-neutral-400 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Organizer</th>
                                <th className="px-6 py-4">Contact Info</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Joined Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                            {status === 'loading' && (
                                <tr><td colSpan="5" className="text-center py-10"><LoaderCircle className="animate-spin h-8 w-8 mx-auto text-primary-500" /></td></tr>
                            )}
                            {status === 'succeeded' && filteredOrganizers.length === 0 && (
                                <tr><td colSpan="5" className="text-center py-10 text-neutral-500">No organizers found matching your search.</td></tr>
                            )}
                            {status === 'succeeded' && filteredOrganizers.map(org => (
                                <tr key={org._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold text-lg overflow-hidden shrink-0">
                                                {org.profileImage ? (
                                                    <img
                                                        src={`${import.meta.env.VITE_API_URL}${org.profileImage.startsWith('/') ? '' : '/'}${org.profileImage}`}
                                                        alt={org.name?.firstName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    org.name?.firstName?.[0] || 'U'
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                                                    {org.name?.firstName} {org.name?.lastName}
                                                </p>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400 hidden sm:block">{org.bio?.substring(0, 30)}{org.bio?.length > 30 && '...'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-300">
                                        <div className="flex flex-col gap-1">
                                            <span>{org.email}</span>
                                            {org.phone && <span className="text-xs text-neutral-500 flex items-center gap-1"><Phone size={10} /> {org.phone}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleStatus(org._id, org.status)}
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${org.status === 'inactive'
                                                ? 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700 hover:bg-neutral-200'
                                                : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 hover:bg-green-100'
                                                }`}>
                                            {org.status === 'inactive' ? 'Inactive' : 'Active'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-neutral-500">
                                        {new Date(org.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/organizer/dashboard/organizers/${org._id}`)}
                                                className="p-2 text-neutral-400 hover:text-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-900/20 rounded-lg transition-colors"
                                                title="View Profile"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleOpenEditModal(org)}
                                                className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleOpenDeleteModal(org)}
                                                className="p-2 text-neutral-400 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- Modals --- */}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-neutral-200 dark:border-neutral-800 animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="px-8 py-5 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-white dark:bg-neutral-900 z-10">
                            <div>
                                <h2 className="text-2xl font-bold font-heading text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                                    {modalMode === 'create' ? <UserPlus className="text-primary-600" size={24} /> : <Edit className="text-primary-600" size={24} />}
                                    {modalMode === 'create' ? 'Add New Organizer' : 'Edit Organizer Profile'}
                                </h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                    {modalMode === 'create' ? 'Fill in the information to register a new organizer.' : 'Update the organizer\'s personal and contact details.'}
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body - Scrollable */}
                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-neutral-50/50 dark:bg-neutral-900/50">
                            <Formik
                                initialValues={{
                                    firstName: selectedOrganizer?.name?.firstName || '',
                                    lastName: selectedOrganizer?.name?.lastName || '',
                                    email: selectedOrganizer?.email || '',
                                    password: '',
                                    phone: selectedOrganizer?.phone || '',
                                    gender: selectedOrganizer?.gender || '',
                                    dob: selectedOrganizer?.dob ? new Date(selectedOrganizer.dob).toISOString().split('T')[0] : '',
                                    bio: selectedOrganizer?.bio || '',
                                    address: {
                                        street: selectedOrganizer?.address?.street || '',
                                        city: selectedOrganizer?.address?.city || '',
                                        state: selectedOrganizer?.address?.state || '',
                                        zip: selectedOrganizer?.address?.zip || '',
                                        country: selectedOrganizer?.address?.country || '',
                                    },
                                    isEdit: modalMode === 'edit'
                                }}
                                validationSchema={OrganizerSchema}
                                onSubmit={handleSubmit}
                            >
                                {({ isSubmitting, setFieldValue, values }) => (
                                    <Form className="space-y-8">
                                        {/* Section: Profile & Cover Images */}
                                        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm">
                                            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4 flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-700 pb-2">
                                                <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                                                Profile & Cover Images
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Profile Image */}
                                                <div>
                                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 ml-1">Profile Image</label>
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 flex-shrink-0">
                                                            {profileImagePreview ? (
                                                                <img src={profileImagePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                                                            ) : selectedOrganizer?.profileImage ? (
                                                                <img src={`${import.meta.env.VITE_API_URL}${selectedOrganizer.profileImage.startsWith('/') ? '' : '/'}${selectedOrganizer.profileImage}`} alt="Current Profile" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="flex items-center justify-center w-full h-full text-neutral-400">
                                                                    <UserPlus size={24} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(event) => {
                                                                    const file = event.currentTarget.files[0];
                                                                    if (file) {
                                                                        const reader = new FileReader();
                                                                        reader.onloadend = () => {
                                                                            setProfileImagePreview(reader.result);
                                                                        };
                                                                        reader.readAsDataURL(file);
                                                                        setFieldValue("profileImage", file);
                                                                    }
                                                                }}
                                                                className="hidden"
                                                                id="profileImageInput"
                                                            />
                                                            <label
                                                                htmlFor="profileImageInput"
                                                                className="cursor-pointer inline-flex items-center px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-colors"
                                                            >
                                                                <Upload className="mr-2 h-4 w-4" /> Change
                                                            </label>
                                                            <p className="text-xs text-neutral-500 mt-1">JPG, GIF or PNG. 10MB max.</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Cover Image */}
                                                <div>
                                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 ml-1">Cover Image</label>
                                                    <div className="relative w-full h-32 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600">
                                                        {coverImagePreview ? (
                                                            <img src={coverImagePreview} alt="Cover Preview" className="w-full h-full object-cover" />
                                                        ) : selectedOrganizer?.coverImage ? (
                                                            <img src={`${import.meta.env.VITE_API_URL}${selectedOrganizer.coverImage.startsWith('/') ? '' : '/'}${selectedOrganizer.coverImage}`} alt="Current Cover" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="flex items-center justify-center w-full h-full text-neutral-400">
                                                                <Image size={32} />
                                                            </div>
                                                        )}
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(event) => {
                                                                const file = event.currentTarget.files[0];
                                                                if (file) {
                                                                    const reader = new FileReader();
                                                                    reader.onloadend = () => {
                                                                        setCoverImagePreview(reader.result);
                                                                    };
                                                                    reader.readAsDataURL(file);
                                                                    setFieldValue("coverImage", file);
                                                                }
                                                            }}
                                                            className="hidden"
                                                            id="coverImageInput"
                                                        />
                                                        <label
                                                            htmlFor="coverImageInput"
                                                            className="absolute bottom-2 right-2 cursor-pointer inline-flex items-center p-2 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-sm hover:bg-white dark:hover:bg-black text-neutral-800 dark:text-white shadow-sm transition-all"
                                                        >
                                                            <Camera size={16} />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section: Personal Information */}
                                        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm">
                                            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4 flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-700 pb-2">
                                                <span className="w-1 h-6 bg-primary-500 rounded-full"></span>
                                                Personal Information
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 ml-1">First Name <span className="text-error-500">*</span></label>
                                                    <Field type="text" name="firstName" className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" placeholder="e.g. John" />
                                                    <ErrorMessage name="firstName" component="div" className="text-error-500 text-xs mt-1 ml-1" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 ml-1">Last Name <span className="text-error-500">*</span></label>
                                                    <Field type="text" name="lastName" className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" placeholder="e.g. Doe" />
                                                    <ErrorMessage name="lastName" component="div" className="text-error-500 text-xs mt-1 ml-1" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 ml-1">Gender</label>
                                                    <div className="relative">
                                                        <Field as="select" name="gender" className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none">
                                                            <option value="">Select Gender</option>
                                                            <option value="male">Male</option>
                                                            <option value="female">Female</option>
                                                            <option value="other">Other</option>
                                                        </Field>
                                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-neutral-500">
                                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 ml-1">Date of Birth</label>
                                                    <div className="relative">
                                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                                                        <Field type="date" name="dob" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all custom-date-input" />
                                                    </div>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 ml-1">Bio</label>
                                                    <Field as="textarea" name="bio" rows="3" className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none" placeholder="Short description about the organizer..." />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section: Account & Contact */}
                                        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm">
                                            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4 flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-700 pb-2">
                                                <span className="w-1 h-6 bg-secondary-500 rounded-full"></span>
                                                Account & Contact
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 ml-1">Email Address <span className="text-error-500">*</span></label>
                                                    <Field type="email" name="email" className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" placeholder="organizer@example.com" />
                                                    <ErrorMessage name="email" component="div" className="text-error-500 text-xs mt-1 ml-1" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 ml-1">Phone Number</label>
                                                    <div className="relative">
                                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                                                        <Field type="text" name="phone" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" placeholder="+1 (555) 000-0000" />
                                                    </div>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 ml-1">
                                                        Password {modalMode === 'edit' && <span className="text-neutral-400 font-normal italic ml-2">(Limit to set new password only)</span>}
                                                        {modalMode === 'create' && <span className="text-error-500">*</span>}
                                                    </label>
                                                    <Field type="password" name="password" className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" placeholder="••••••••" />
                                                    <ErrorMessage name="password" component="div" className="text-error-500 text-xs mt-1 ml-1" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section: Address */}
                                        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm">
                                            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4 flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-700 pb-2">
                                                <span className="w-1 h-6 bg-accent-500 rounded-full"></span>
                                                Address Details
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 ml-1 uppercase tracking-wider">Street</label>
                                                        <div className="relative">
                                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                                                            <Field type="text" name="address.street" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" placeholder="123 Main St" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 ml-1 uppercase tracking-wider">City</label>
                                                        <Field type="text" name="address.city" className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" placeholder="New York" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 ml-1 uppercase tracking-wider">State</label>
                                                        <Field type="text" name="address.state" className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" placeholder="NY" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 ml-1 uppercase tracking-wider">Zip Code</label>
                                                        <Field type="text" name="address.zip" className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" placeholder="10001" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 ml-1 uppercase tracking-wider">Country</label>
                                                        <Field type="text" name="address.country" className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" placeholder="USA" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer Actions */}
                                        <div className="flex justify-end gap-4 pt-6 border-t border-neutral-200 dark:border-neutral-700 sticky bottom-0 bg-white dark:bg-neutral-900 z-10 p-4 -mx-4 -mb-4 mt-auto">
                                            <button
                                                type="button"
                                                onClick={closeModal}
                                                className="px-6 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all transform hover:scale-[1.02]"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="px-8 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 shadow-lg shadow-primary-600/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] flex items-center gap-2"
                                            >
                                                {isSubmitting && <LoaderCircle className="animate-spin" size={18} />}
                                                {modalMode === 'create' ? 'Create Account' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div >
                </div >
            )
            }

            {/* Delete Confirmation Modal */}
            {
                isDeleteModalOpen && selectedOrganizer && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
                            <div className="w-12 h-12 bg-error-100 dark:bg-error-900/30 text-error-600 dark:text-error-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Delete Organizer?</h3>
                            <p className="text-neutral-500 dark:text-neutral-400 mb-6">
                                Are you sure you want to delete <strong>{selectedOrganizer.name.firstName} {selectedOrganizer.name.lastName}</strong>? This action cannot be undone.
                            </p>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={closeDeleteModal}
                                    className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

export default ManageOrganizersPage;