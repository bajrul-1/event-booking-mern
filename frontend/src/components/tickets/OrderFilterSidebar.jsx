import { Filter } from 'lucide-react';

function OrderFilterSidebar({ filters, setFilters }) {

    const handleStatusChange = (e) => {
        const { name, checked } = e.target;
        setFilters(prev => ({
            ...prev,
            status: { ...prev.status, [name]: checked }
        }));
    };

    const handleTimeChange = (e) => {
        setFilters(prev => ({ ...prev, time: e.target.value }));
    };

    return (
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg h-fit sticky top-24">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                <Filter size={20} className="text-primary-500" />
                <h3 className="text-xl font-bold font-heading text-neutral-800 dark:text-neutral-100">Filters</h3>
            </div>

            {/* Filter by Status */}
            <div>
                <p className="font-semibold text-sm uppercase tracking-wider text-neutral-600 dark:text-neutral-400">ORDER STATUS</p>
                <div className="mt-4 space-y-3">
                    <Checkbox label="Successful" name="successful" checked={filters.status.successful} onChange={handleStatusChange} />
                    <Checkbox label="Failed" name="failed" checked={filters.status.failed} onChange={handleStatusChange} />
                    <Checkbox label="Pending" name="pending" checked={filters.status.pending} onChange={handleStatusChange} />
                </div>
            </div>

            {/* Filter by Time */}
            <div className="mt-8">
                <p className="font-semibold text-sm uppercase tracking-wider text-neutral-600 dark:text-neutral-400">ORDER TIME</p>
                <div className="mt-4 space-y-3">
                    <Radio label="Anytime" name="time" value="anytime" checked={filters.time === 'anytime'} onChange={handleTimeChange} />
                    <Radio label="Last 30 days" name="time" value="30days" checked={filters.time === '30days'} onChange={handleTimeChange} />
                    <Radio label="Last 6 months" name="time" value="6months" checked={filters.time === '6months'} onChange={handleTimeChange} />
                </div>
            </div>
        </div>
    );
}

// Helper components
const Checkbox = ({ label, ...props }) => (
    <label className="flex items-center gap-3 text-neutral-700 dark:text-neutral-200 cursor-pointer">
        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" {...props} />
        {label}
    </label>
);

const Radio = ({ label, ...props }) => (
    <label className="flex items-center gap-3 text-neutral-700 dark:text-neutral-200 cursor-pointer">
        <input type="radio" className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500" {...props} />
        {label}
    </label>
);

export default OrderFilterSidebar;

