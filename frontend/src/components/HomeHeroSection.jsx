import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ArrowRight, Sparkles, Calendar, MapPin, Users } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

function HomeHeroSection() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [stats, setStats] = useState({ totalUsers: 0, totalEvents: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Using relative path assuming proxy is set up or full URL from env
                const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/users/stats`);
                if (response.data.success) {
                    setStats(response.data.stats);
                }
            } catch (error) {
                console.error("Failed to fetch stats:", error);
                // Fallback to 0 or leave as initial state
            }
        };
        fetchStats();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/events?search=${searchQuery}`);
    };

    return (
        <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-neutral-950 text-white pt-32 pb-20 lg:py-32">

            {/* --- Animated Background (Aurora Effect) --- */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-60 animate-blob"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-secondary-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-60 animate-blob animation-delay-4000"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            <div className="relative z-10 container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                {/* --- Left Column: Text Content --- */}
                <div className="text-center lg:text-left space-y-8 order-2 lg:order-1">

                    {/* Floating Badge */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
                    >
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary-500"></span>
                        </span>
                        <span className="text-xs font-bold tracking-widest text-neutral-300 uppercase">Live Events Near You</span>
                    </motion.div>

                    {/* Main Heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-5xl md:text-6xl lg:text-7xl font-bold font-heading leading-[1.1]"
                    >
                        Experience <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-purple-400 to-secondary-400">The Extraordinary</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg md:text-xl text-neutral-400 max-w-xl mx-auto lg:mx-0 font-light leading-relaxed"
                    >
                        From electric concerts to intimate workshops. Discover, book, and create memories that last a lifetime with the world's best event platform.
                    </motion.p>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="max-w-md mx-auto lg:mx-0"
                    >
                        <form onSubmit={handleSearch} className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                            <div className="relative flex items-center bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-full p-1.5 pl-6 shadow-2xl">
                                <Search className="text-neutral-400 mr-3" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search events..."
                                    className="w-full bg-transparent border-none text-white placeholder-neutral-500 focus:outline-none focus:ring-0 text-base"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:bg-neutral-200 transition-colors"
                                >
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        </form>
                    </motion.div>

                    {/* Organizer CTA Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start mt-8"
                    >
                        <span className="text-neutral-400 text-sm">Want to list your event?</span>
                        <button
                            onClick={() => navigate('/organizer')}
                            className="px-6 py-2.5 rounded-full border border-primary-500/30 bg-primary-500/10 hover:bg-primary-500 hover:text-white text-primary-400 text-sm font-semibold transition-all duration-300 shadow-lg shadow-primary-500/10 hover:shadow-primary-500/30"
                        >
                            Become an Organizer
                        </button>
                    </motion.div>

                    {/* Mini Stats */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-wrap justify-center lg:justify-start gap-8 pt-4"
                    >
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-neutral-800/50 rounded-lg text-primary-400"><Calendar size={20} /></div>
                            <div className="text-left"><p className="font-bold text-white text-lg">{stats.totalEvents}+</p><p className="text-xs text-neutral-500 uppercase">Events</p></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-neutral-800/50 rounded-lg text-secondary-400"><Users size={20} /></div>
                            <div className="text-left"><p className="font-bold text-white text-lg">{stats.totalUsers}+</p><p className="text-xs text-neutral-500 uppercase">Users</p></div>
                        </div>
                    </motion.div>
                </div>

                {/* --- Right Column: Image Composition --- */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="relative order-1 lg:order-2 flex justify-center lg:justify-end"
                >
                    <div className="relative w-full max-w-md aspect-square">
                        {/* Blob behind image */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary-600 to-secondary-600 rounded-[2rem] blur-2xl opacity-20 transform rotate-6 scale-105"></div>

                        {/* Main Image */}
                        <div className="absolute inset-0 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-neutral-900">
                            <img
                                src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop"
                                alt="Event Atmosphere"
                                className="w-full h-full object-cover opacity-80 hover:opacity-100 hover:scale-110 transition-all duration-700"
                            />
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80"></div>
                        </div>

                        {/* Floating Card 1 */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -left-6 bottom-20 p-4 bg-neutral-900/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl max-w-[200px]"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">Trending</p>
                                    <p className="text-xs text-neutral-400">{stats.trendingCategory || "Music Festivals"}</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Floating Card 2 */}
                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -right-6 top-20 p-4 bg-neutral-900/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-neutral-700 border-2 border-neutral-900"></div>
                                    ))}
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">+{stats.totalUsers > 0 ? stats.totalUsers : 124}</p>
                                    <p className="text-xs text-neutral-400">Joining</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export default HomeHeroSection;
