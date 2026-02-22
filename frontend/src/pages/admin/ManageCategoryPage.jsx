import { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Layers, LoaderCircle, Trash2, Edit } from 'lucide-react';
import { createNewCategory, fetchAllCategoriesForAdmin, clearCategoryError, updateCategory, deleteCategory } from '../../redux/features/categories/categoriesSlice.js';

// Reusable Form Field Component
const FormField = ({ label, name, type = 'text', as = 'input', placeholder = '', isSelect = false, children = null, className = "" }) => (
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
        <ErrorMessage name={name} component="div" className="text-error-500 text-xs mt-1" />
    </div>
);

// Form validation schema
const CategorySchema = Yup.object().shape({
    name: Yup.string().required('Category name is required'),
    slug: Yup.string().required('Slug is required').matches(/^[a-z0-9-]+$/, 'Slug must be lowercase with no spaces (e.g., tech-summit)'),
    description: Yup.string().required('Description is required'),
    imageUrl: Yup.string().url('Must be a valid URL').required('Image URL is required'),
    status: Yup.string().oneOf(['active', 'inactive']).required('Status is required'),
});

function ManageCategoryPage() {
    const dispatch = useDispatch();
    const { items: categories, status, error } = useSelector((state) => state.categories) || {};

    // Page load holei shob category fetch kora hocche
    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchAllCategoriesForAdmin());
        }
    }, [status, dispatch]);

    // Error handling
    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearCategoryError());
        }
    }, [error, dispatch]);

    const [selectedCategory, setSelectedCategory] = useState(null);

    const handleCreateOrUpdateCategory = (values, { setSubmitting, resetForm }) => {
        if (selectedCategory) {
            dispatch(updateCategory({ id: selectedCategory._id, categoryData: values }))
                .unwrap()
                .then(() => {
                    toast.success('Category updated successfully!');
                    resetForm();
                    setSelectedCategory(null);
                })
                .catch(() => { })
                .finally(() => setSubmitting(false));
            return;
        }

        dispatch(createNewCategory(values))
            .unwrap()
            .then(() => {
                toast.success('Category created successfully!');
                resetForm();
            })
            .catch(() => { })
            .finally(() => setSubmitting(false));
    };

    const handleDeleteCategory = (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            dispatch(deleteCategory(id))
                .unwrap()
                .then(() => toast.success('Category deleted successfully!'))
                .catch(() => { });
        }
    };

    const handleEditClick = (cat) => {
        setSelectedCategory(cat);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setSelectedCategory(null);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold font-heading text-neutral-900 dark:text-neutral-50 mb-8">
                Manage Categories
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- Create Category Form --- */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold font-heading text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
                                <Layers size={24} />
                                {selectedCategory ? 'Edit Category' : 'Create New Category'}
                            </h2>
                            {selectedCategory && (
                                <button onClick={handleCancelEdit} className="text-sm text-neutral-500 hover:text-neutral-700 underline">
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                        <Formik
                            enableReinitialize
                            initialValues={{
                                name: selectedCategory?.name || '',
                                slug: selectedCategory?.slug || '',
                                description: selectedCategory?.description || '',
                                imageUrl: selectedCategory?.imageUrl || '',
                                status: selectedCategory?.status || 'active',
                            }}
                            validationSchema={CategorySchema}
                            onSubmit={handleCreateOrUpdateCategory}
                        >
                            {({ isSubmitting }) => (
                                <Form className="space-y-4">
                                    <FormField label="Category Name" name="name" />
                                    <FormField label="Slug" name="slug" placeholder="e.g., music-concert" />
                                    <FormField label="Description" name="description" as="textarea" />
                                    <FormField label="Image URL" name="imageUrl" placeholder="https://..." />
                                    <FormField label="Status" name="status" as="select" isSelect>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </FormField>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                                    >
                                        {isSubmitting ? <LoaderCircle className="animate-spin" /> : selectedCategory ? 'Update Category' : 'Create Category'}
                                    </button>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>

                {/* --- Category List --- */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold font-heading text-neutral-800 dark:text-neutral-100 mb-6">
                            Existing Categories
                        </h2>
                        <div className="space-y-4">
                            {status === 'loading' && categories.length === 0 && (
                                <div className="flex justify-center py-10"><LoaderCircle className="animate-spin text-primary-500" /></div>
                            )}
                            {categories.length === 0 && status !== 'loading' && (
                                <div className="text-center py-10 text-neutral-500">
                                    <p>No categories found.</p>
                                </div>
                            )}
                            {categories.length > 0 && (
                                <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                    {categories.map(cat => (
                                        <li key={cat._id} className="py-4 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <img src={cat.imageUrl} alt={cat.name} className="h-10 w-10 rounded-full object-cover" />
                                                <div>
                                                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                                                        {cat.name}
                                                        <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${cat.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-800'}`}>
                                                            {cat.status}
                                                        </span>
                                                    </p>
                                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{cat.slug}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEditClick(cat)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors">
                                                    <Edit size={18} />
                                                </button>
                                                <button onClick={() => handleDeleteCategory(cat._id)} className="p-2 text-error-500 hover:bg-error-500/10 rounded-full transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ManageCategoryPage;