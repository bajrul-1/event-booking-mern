import { Target, Code, Cpu, Globe, Linkedin, Github, Mail } from 'lucide-react';

function About() {

    // --- Creator / Developer Profile ---
    const creator = {
        name: "Bajrul Middya",
        role: "Full Stack Developer",
        bio: "Passionate about building scalable web applications with the MERN stack. I love solving complex problems and creating user-friendly experiences.",
        // Placeholder: Replace with your actual photo or keep this generic avatar
        imageUrl: "https://res.cloudinary.com/doyqkbqki/image/upload/WhatsApp_Image_2026-02-17_at_9.23.51_PM_sbe3pz.jpg",
        socials: {
            linkedin: "https://www.linkedin.com/in/bajrul-middya-967491354/",
            github: "https://github.com/bajrul-1",
            email: "work.bajrul@gmail.com"
        }

    };

    const techStack = [
        { name: "MongoDB", icon: "🍃" },
        { name: "Express.js", icon: "🚂" },
        { name: "React.js", icon: "⚛️" },
        { name: "Node.js", icon: "🟢" },
        { name: "Tailwind CSS", icon: "🎨" },
        { name: "Redux Toolkit", icon: "🔄" }
    ];

    const features = [
        {
            icon: <Globe size={32} className="text-secondary-600 dark:text-secondary-400" />,
            title: "Pan-India Reach",
            description: "From the bustling streets of Mumbai to the serene ghats of Varanasi, we connect events across the nation.",
        },
        {
            icon: <Target size={32} className="text-primary-600 dark:text-primary-400" />,
            title: "Cultural Diversity",
            description: "Celebrating India's rich heritage - Music, Dance, Tech, and Food festivals all in one place.",
        },
        {
            icon: <Cpu size={32} className="text-purple-600 dark:text-purple-400" />,
            title: "Seamless Tech",
            description: "Powered by cutting-edge MERN stack technology for a glitch-free booking experience.",
        },
    ];

    return (
        <>
            <title>About Us - Our Mission & Team | EventBooking</title>
            <meta name="description" content="Discover the story behind EventBooking. We connect millions of hearts across India through seamless tech and unforgettable cultural experiences." />
            <meta name="keywords" content="about us, team, mission, event booking platform, Pan-India events" />

            <div className="bg-neutral-50 dark:bg-neutral-950 min-h-screen text-neutral-900 dark:text-white overflow-hidden transition-colors duration-300">

                {/* --- Background --- */}
                {/* Removed complex aurora/noise effects for a cleaner, consistent theme */}

                {/* --- Hero Section --- */}
                <section className="relative z-10 py-24 md:py-32 text-center px-6">
                    <h1 className="text-5xl md:text-7xl font-bold font-heading mb-6 tracking-tight text-neutral-900 dark:text-white">
                        Celebrating <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-purple-500 to-green-500 dark:from-orange-400 dark:via-white dark:to-green-400">India</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto font-light leading-relaxed">
                        Connecting millions of hearts through the joy of shared experiences. <br />
                        <span className="text-primary-600 dark:text-primary-400 font-medium">One Nation. One Platform. Limitless Memories.</span>
                    </p>
                </section>

                {/* --- Mission Section (Glassmorphism) --- */}
                <section className="relative z-10 py-16 px-6">
                    <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                            <img
                                // Replaced broken image with a working generic 'Holi Festival' or 'Celebration' image
                                src="https://media.istockphoto.com/id/1381030718/photo/barsana-holi-one-of-the-most-joyful-festival-of-india-this-is-birth-place-of-radha-lord.jpg?s=612x612&w=0&k=20&c=c0kcjHpSFJXg7F4D6s8Ez-7RWY3MjoIrwsiRQKScank="
                                alt="Indian Festival Crowd"
                                className="relative rounded-2xl shadow-2xl border border-neutral-200 dark:border-white/10 w-full object-cover h-[400px]"
                            />
                            <div className="absolute bottom-4 left-4 bg-white/80 dark:bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-neutral-200 dark:border-white/10">
                                <p className="text-xs text-neutral-800 dark:text-neutral-300 uppercase tracking-widest font-semibold">Built for Community</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <h2 className="text-4xl font-bold font-heading text-neutral-900 dark:text-white">
                                Why We <span className="text-secondary-600 dark:text-secondary-500">Exhibit</span>?
                            </h2>
                            <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed border-l-4 border-primary-500 pl-6">
                                "In a country of 1.4 billion dreams, every event is a celebration of life. Whether it's a tech summit in Bangalore or a Literature fest in Jaipur, our mission is to make discovery effortless."
                            </p>
                            <div className="grid grid-cols-1 gap-6">
                                {features.map((feature, index) => (
                                    <div key={index} className="flex items-start gap-4">
                                        <div className="p-3 bg-neutral-100 dark:bg-white/5 rounded-lg border border-neutral-200 dark:border-white/10">
                                            {feature.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{feature.title}</h3>
                                            <p className="text-sm text-neutral-600 dark:text-neutral-400">{feature.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- Developer Portfolio Section --- */}
                <section className="relative z-10 py-24 bg-neutral-100 dark:bg-neutral-900 mt-12 border-y border-neutral-200 dark:border-neutral-800">
                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <div className="inline-block mb-4 px-4 py-1 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300 text-sm font-semibold tracking-wide uppercase border border-primary-200 dark:border-primary-500/30">
                            The Mind Behind Code
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold font-heading mb-16 text-neutral-900 dark:text-white">
                            Meet the <span className="text-primary-600 dark:text-primary-500">Creator</span>
                        </h2>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                            {/* Profile Image (Circle with Glow) */}
                            <div className="relative">
                                <div className="absolute -inset-4 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full blur-lg opacity-30 dark:opacity-50 animate-pulse"></div>
                                <img
                                    src={creator.imageUrl}
                                    alt={creator.name}
                                    className="relative w-64 h-64 rounded-full object-cover border-4 border-white dark:border-neutral-900 shadow-2xl z-10"
                                />
                            </div>

                            {/* Bio & Skills */}
                            <div className="max-w-xl text-left space-y-6">
                                <div>
                                    <h3 className="text-3xl font-bold text-neutral-900 dark:text-white">{creator.name}</h3>
                                    <p className="text-xl text-primary-600 dark:text-primary-400 font-medium">{creator.role}</p>
                                </div>
                                <p className="text-neutral-700 dark:text-neutral-300 text-lg leading-relaxed">
                                    {creator.bio}
                                </p>

                                {/* Tech Stack Bubbles */}
                                <div>
                                    <p className="text-sm text-neutral-500 uppercase tracking-widest mb-3 font-semibold">Tech Stack Expertise</p>
                                    <div className="flex flex-wrap gap-3">
                                        {techStack.map((tech, idx) => (
                                            <span key={idx} className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-full border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-default">
                                                <span>{tech.icon}</span>
                                                <span className="font-medium text-sm">{tech.name}</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Social Links */}
                                <div className="flex gap-4 pt-4">
                                    <a href={creator.socials.linkedin} className="p-3 bg-neutral-100 dark:bg-white/5 rounded-full hover:bg-primary-600 hover:text-white transition-colors text-neutral-700 dark:text-white"><Linkedin size={20} /></a>
                                    <a href={creator.socials.github} className="p-3 bg-neutral-100 dark:bg-white/5 rounded-full hover:bg-neutral-800 hover:text-white dark:hover:bg-neutral-200 dark:hover:text-black transition-colors text-neutral-700 dark:text-white"><Github size={20} /></a>
                                    <button
                                        onClick={() => window.location.href = 'mailto:work.bajrul@gmail.com'}
                                        className="p-3 bg-neutral-100 dark:bg-white/5 rounded-full hover:bg-red-500 hover:text-white transition-colors text-neutral-700 dark:text-white"
                                    >
                                        <Mail size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer Quote */}
                <section className="relative z-10 py-20 text-center px-6">
                    <blockquote className="text-2xl md:text-3xl font-heading font-light text-neutral-500 dark:text-neutral-400 italic max-w-4xl mx-auto">
                        "Building technology that celebrates culture and brings people together."
                    </blockquote>
                </section>

            </div>
        </>
    );
}

export default About;
