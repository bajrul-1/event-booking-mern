import { Search, Ticket, PartyPopper, ArrowRight } from "lucide-react";

// This is the main section component
function HowItWorksSection() {
    const steps = [
        {
            icon: <Search size={32} className="text-white" />,
            step: "01",
            title: "Discover Events",
            description: "Browse through thousands of events from various categories to find what excites you the most.",
            color: "from-primary-500 to-primary-600"
        },
        {
            icon: <Ticket size={32} className="text-white" />,
            step: "02",
            title: "Book Your Ticket",
            description: "Select your desired event, choose your tickets, and complete the secure payment process.",
            color: "from-secondary-500 to-secondary-600"
        },
        {
            icon: <PartyPopper size={32} className="text-white" />,
            step: "03",
            title: "Enjoy the Show",
            description: "Receive your e-ticket instantly. Show up at the event, scan your ticket, and have a blast!",
            color: "from-green-500 to-green-600"
        },
    ];

    return (
        <section className="py-24 bg-neutral-900 border-t border-white/5 relative overflow-hidden">

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary-900/20 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4">
                        <span className="text-xs font-bold tracking-wider uppercase text-neutral-300">Easy Process</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold font-heading text-white">
                        How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">Works</span>
                    </h2>
                    <p className="mt-6 text-lg text-neutral-400 max-w-2xl mx-auto">
                        Getting your ticket is as easy as one, two, three. Follow these simple steps.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                    {/* Connecting Line (Desktop Only) */}
                    <div className="hidden md:block absolute top-12 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10"></div>

                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="relative flex flex-col items-center text-center group"
                        >
                            {/* Icon Container */}
                            <div className={`w-24 h-24 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-lg shadow-white/5 mb-8 relative z-10 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                                {step.icon}
                                <div className="absolute -top-3 -right-3 w-8 h-8 bg-neutral-900 text-white rounded-full flex items-center justify-center text-sm font-bold border-2 border-neutral-700">
                                    {step.step}
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold font-heading text-white mb-4 group-hover:text-primary-400 transition-colors">
                                {step.title}
                            </h3>
                            <p className="text-neutral-400 font-body leading-relaxed max-w-xs mx-auto">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default HowItWorksSection;
