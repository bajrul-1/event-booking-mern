import { useEffect, useState } from "react";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { LoaderCircle, ArrowLeft, Plus, Trash2, Upload, Image } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createNewEvent, updateEvent, fetchEventById, fetchOrganizerEventById } from "../../redux/features/events/eventsSlice.js";
import { fetchAllCategories } from "../../redux/features/categories/categoriesSlice.js";
import { fetchAllOrganizers } from "../../redux/features/organizer/organizerSlice.js";

// Validation Schema (Update imageUrl validation to be optional if editing or handle file)
// We'll relax imageUrl validation because in edit mode it might be pre-filled, or user might upload a file.
// Actually, for file upload, we validat file presence manually or via Yup mixed.
// For now let's keep it simple: required if not editing? Or just use mixed.
const EventSchema = Yup.object().shape({
    title: Yup.string().required("Title is required"),
    description: Yup.string().required("Description is required"),
    date: Yup.date().required("Date is required"), // Removed past date check for editing flexibility
    location: Yup.string().required("Location is required"),
    // imageUrl: Yup.string().required("Image is required"), // We will handle this manually or rely on existing value
    category: Yup.string().required("Category is required"),
    status: Yup.string().oneOf(['unleashed', 'published', 'cancelled']).required("Status is required"), // Added cancelled
    organizer: Yup.string(),
    guests: Yup.array().of(
        Yup.object().shape({
            name: Yup.string().required("Guest name required"),
            title: Yup.string(),
            imageUrl: Yup.string(),
        })
    ),
    ticketTiers: Yup.array().of(
        Yup.object().shape({
            name: Yup.string().required("Tier name is required"),
            price: Yup.number().min(0).required("Price is required"),
            totalQuantity: Yup.number().min(1).required("Quantity is required"),
            access: Yup.string().oneOf(['public', 'admin_only', 'admin_organizer_only']).required("Access is required"),
        })
    ),
});

const FormField = ({ label, name, type = "text", as = "input", placeholder = "", isSelect = false, children = null, className = "" }) => (
    <div className={`flex flex-col ${className}`}>
        <label htmlFor={name} className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{label}</label>
        <Field
            as={as}
            type={type}
            id={name}
            name={name}
            placeholder={placeholder}
            className="border rounded-md px-3 py-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border-neutral-300 dark:border-neutral-600 focus:border-primary-500 focus:ring-primary-500"
        >
            {isSelect ? children : null}
        </Field>
        <div className="h-4 mt-1">
            <ErrorMessage name={name} component="div" className="text-error-500 text-xs" />
        </div>
    </div>
);

function CreateEventPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { eventId } = useParams();
    const isEditMode = !!eventId;

    // Local state for image preview
    const [imagePreview, setImagePreview] = useState(null);

    const { createStatus, currentEvent, status: eventStatus } = useSelector((state) => state.events);
    const { items: categories, status: categoryStatus } = useSelector((state) => state.categories);
    const { organizer: loggedInUser } = useSelector((state) => state.organizerAuth) || {};
    const { items: organizersList, status: organizerListStatus } = useSelector((state) => state.organizers) || {};
    const isAdmin = loggedInUser?.role === "admin";

    useEffect(() => {
        if (categoryStatus === "idle") dispatch(fetchAllCategories());
        if (isAdmin && organizerListStatus === "idle") dispatch(fetchAllOrganizers());

        if (isEditMode) {
            // FIX: Using fetchOrganizerEventById instead of fetchEventById to access non-published events
            dispatch(fetchOrganizerEventById(eventId));
        }
    }, [categoryStatus, organizerListStatus, isAdmin, dispatch, isEditMode, eventId]);

    // Update preview when currentEvent loads
    useEffect(() => {
        if (isEditMode && currentEvent?.imageUrl) {
            const imgUrl = currentEvent.imageUrl;
            setImagePreview(imgUrl.startsWith('http') ? imgUrl : `${import.meta.env.VITE_API_URL}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`);
        }
    }, [isEditMode, currentEvent]);

    const handleSubmit = (values, { setSubmitting }) => {
        if (isAdmin && !values.organizer) values.organizer = loggedInUser._id;

        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('description', values.description);
        formData.append('date', values.date);
        formData.append('location', values.location);
        formData.append('category', values.category);
        formData.append('status', values.status);
        if (values.organizer) formData.append('organizer', values.organizer);

        // Append complex objects as JSON strings
        formData.append('ticketTiers', JSON.stringify(values.ticketTiers));
        formData.append('guests', JSON.stringify(values.guests));

        if (values.eventImage instanceof File) {
            formData.append('eventImage', values.eventImage);
        } else if (values.imageUrl) {
            formData.append('imageUrl', values.imageUrl); // Keep existing URL if no new file
        }

        if (isEditMode) {
            dispatch(updateEvent({ eventId, eventData: formData }))
                .unwrap()
                .then(() => {
                    toast.success("Event Updated Successfully!");
                    navigate("/organizer/dashboard/events");
                })
                .catch((err) => toast.error(err))
                .finally(() => setSubmitting(false));
        } else {
            dispatch(createNewEvent(formData))
                .unwrap()
                .then(() => {
                    toast.success("Event Created Successfully!");
                    navigate("/organizer/dashboard/events");
                })
                .catch((err) => toast.error(err))
                .finally(() => setSubmitting(false));
        }
    };

    if (isEditMode && eventStatus === 'loading') {
        return <div className="flex justify-center py-20"><LoaderCircle className="animate-spin text-primary-500" size={40} /></div>;
    }

    return (
        <div className="space-y-8 pb-20">
            <Link to="/organizer/dashboard/events" className="inline-flex items-center gap-2 text-primary-500 font-semibold hover:underline">
                <ArrowLeft size={18} /> Back to Manage Events
            </Link>

            <h1 className="text-3xl font-bold font-heading text-neutral-900 dark:text-neutral-100">
                {isEditMode ? 'Edit Event' : 'Create New Event'}
            </h1>

            <Formik
                enableReinitialize
                initialValues={{
                    title: currentEvent?.title || "",
                    description: currentEvent?.description || "",
                    date: currentEvent?.date ? new Date(currentEvent.date).toISOString().slice(0, 16) : "", // Format for datetime-local
                    location: currentEvent?.location || "",
                    imageUrl: currentEvent?.imageUrl || "",
                    eventImage: null, // New field for file
                    category: currentEvent?.category?._id || currentEvent?.category || "",
                    status: currentEvent?.status || "unleashed",
                    organizer: currentEvent?.organizer?._id || currentEvent?.organizer || "",
                    guests: currentEvent?.guests || [{ name: "", title: "", imageUrl: "" }],
                    ticketTiers: currentEvent?.ticketTiers || [
                        { name: "General", price: 100, totalQuantity: 100, access: "public" },
                        { name: "VIP", price: 500, totalQuantity: 50, access: "admin_organizer_only" },
                    ],
                }}
                validationSchema={EventSchema}
                onSubmit={handleSubmit}
            >
                {({ values, setFieldValue }) => (
                    <Form className="space-y-10">
                        <section className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg">
                            <h2 className="text-xl font-semibold mb-6 text-neutral-900 dark:text-neutral-100">Basic Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                <FormField label="Event Title" name="title" className="md:col-span-2" />
                                <FormField label="Description" name="description" as="textarea" className="md:col-span-2" />
                                {isAdmin && (
                                    <FormField label="Assign Organizer" name="organizer" as="select" isSelect>
                                        <option value="">Assign Me</option>
                                        {organizersList?.map((org) => (
                                            <option key={org._id} value={org._id}>{org.name.firstName} {org.name.lastName}</option>
                                        ))}
                                    </FormField>
                                )}
                                <FormField label="Category" name="category" as="select" isSelect>
                                    <option value="">Select category</option>
                                    {categories?.map((cat) => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </FormField>
                                <FormField label="Date & Time" name="date" type="datetime-local" />
                                <FormField label="Location" name="location" />
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Event Image</label>
                                    <div className="relative w-full h-64 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 mb-2">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full text-neutral-400">
                                                <Image size={48} />
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
                                                        setImagePreview(reader.result);
                                                    };
                                                    reader.readAsDataURL(file);
                                                    setFieldValue("eventImage", file);
                                                }
                                            }}
                                            className="hidden"
                                            id="eventImageInput"
                                        />
                                        <label
                                            htmlFor="eventImageInput"
                                            className="absolute bottom-4 right-4 cursor-pointer inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                                        >
                                            <Upload className="mr-2 h-4 w-4" /> {imagePreview ? 'Change Image' : 'Upload Image'}
                                        </label>
                                    </div>
                                    <p className="text-xs text-neutral-500">Supported formats: JPG, PNG, GIF. Max size: 10MB.</p>
                                </div>

                                <FormField label="Status" name="status" as="select" isSelect>
                                    <option value="unleashed">Unleashed (Hidden)</option>
                                    <option value="published">Published (Visible)</option>
                                </FormField>
                            </div>
                        </section>

                        <section className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg">
                            <h2 className="text-xl font-semibold mb-6 text-neutral-900 dark:text-neutral-100">Ticket Tiers</h2>
                            <FieldArray name="ticketTiers">
                                {({ push, remove }) => (
                                    <div className="space-y-4">
                                        {values.ticketTiers.map((tier, index) => (
                                            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-x-6 gap-y-2 border p-4 rounded-lg dark:border-neutral-700 items-start">
                                                <FormField label="Name" name={`ticketTiers.${index}.name`} />
                                                <FormField label="Price" name={`ticketTiers.${index}.price`} type="number" />
                                                <FormField label="Quantity" name={`ticketTiers.${index}.totalQuantity`} type="number" />
                                                <FormField label="Access" name={`ticketTiers.${index}.access`} as="select" isSelect>
                                                    <option value="public">Public</option>
                                                    <option value="admin_only">Admin Only</option>
                                                    <option value="admin_organizer_only">Admin + Organizer</option>
                                                </FormField>
                                                <button type="button" onClick={() => remove(index)} className="p-2 text-error-500 hover:bg-error-500/10 rounded-full transition-colors mt-6">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => push({ name: "", price: 0, totalQuantity: 10, access: "public" })} className="flex items-center gap-2 text-primary-500 font-semibold">
                                            <Plus size={18} /> Add Ticket Tier
                                        </button>
                                    </div>
                                )}
                            </FieldArray>
                        </section>

                        <section className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg">
                            <h2 className="text-xl font-semibold mb-6 text-neutral-900 dark:text-neutral-100">Guests (Optional)</h2>
                            <FieldArray name="guests">
                                {({ push, remove }) => (
                                    <div className="space-y-4">
                                        {values.guests.map((guest, index) => (
                                            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-2 border p-4 rounded-lg dark:border-neutral-700 items-start">
                                                <FormField label="Guest Name" name={`guests.${index}.name`} />
                                                <FormField label="Title/Role" name={`guests.${index}.title`} />
                                                <FormField label="Image URL" name={`guests.${index}.imageUrl`} />
                                                <button type="button" onClick={() => remove(index)} className="p-2 text-error-500 hover:bg-error-500/10 rounded-full transition-colors mt-6">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => push({ name: "", title: "", imageUrl: "" })} className="flex items-center gap-2 text-primary-500 font-semibold">
                                            <Plus size={18} /> Add Guest
                                        </button>
                                    </div>
                                )}
                            </FieldArray>
                        </section>

                        <button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50" disabled={createStatus === "loading"}>
                            {createStatus === "loading" ? <LoaderCircle className="animate-spin" size={20} /> : "Create Event"}
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
}

export default CreateEventPage;