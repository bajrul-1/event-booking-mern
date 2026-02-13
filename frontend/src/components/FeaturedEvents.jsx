import EventCard from "./events/EventCard";
import { ArrowRight, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";

function FeaturedEvents({ events }) {
    if (!events || events.length === 0) {
        return null; // Don't show section if no events
    }

    return (
        <section className="py-24 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-white/5">
            <div className="max-w-7xl mx-auto px-6">

                {/* Section Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-wider">
                            <Sparkles size={12} />
                            <span>Editors Pick</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold font-heading text-neutral-900 dark:text-white leading-tight">
                            Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400">Experiences</span>
                        </h2>
                    </div>

                    <NavLink
                        to="/events"
                        className="group flex items-center gap-3 px-6 py-3 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-semibold hover:border-primary-500 hover:shadow-lg transition-all duration-300"
                    >
                        View All
                        <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-colors">
                            <ArrowRight size={14} />
                        </div>
                    </NavLink>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map((event, index) => (
                        <div key={event._id} className="group hover:-translate-y-2 transition-transform duration-500">
                            <EventCard event={event} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default FeaturedEvents;
