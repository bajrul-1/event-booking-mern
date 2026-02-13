import { Star, StarHalf, Quote } from "lucide-react";

// Swiper.js library import kora hocche
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';


function TestimonialsSection() {
    // Total 6-ta data deya hoyeche jate loop-ta bhalo lage
    const testimonials = [
        {
            name: "Sarah L.",
            event: "Starlight Concert Series",
            avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop",
            rating: 5,
            quote: "Absolutely incredible experience! The entire process from booking to the event itself was seamless. The concert was magical.",
        },
        {
            name: "Michael B.",
            event: "Future of AI Conference",
            avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1887&auto=format&fit=crop",
            rating: 4.5,
            quote: "A very well-organized conference. The speakers were top-notch and the venue was excellent. Highly recommended!",
        },
        {
            name: "Jessica P.",
            event: "Modern Art Exhibition",
            avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop",
            rating: 5,
            quote: "I discovered this amazing art exhibition here and I'm so glad I did. The platform is user-friendly and the event exceeded all my expectations.",
        },
        {
            name: "David Chen",
            event: "Gourmet Food Festival",
            avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887&auto-format&fit=crop",
            rating: 4.5,
            quote: "A paradise for food lovers! The variety of stalls was amazing. Booking my entry through this platform was a breeze.",
        },
        {
            name: "Emily Carter",
            event: "Jaipur Literature Festival",
            avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1888&auto=format&fit=crop",
            rating: 5,
            quote: "The best literary festival I've ever attended. The app made it so easy to track schedules and book sessions. Fantastic experience overall.",
        },
        {
            name: "Alex Johnson",
            event: "Championship Soccer Match",
            avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop",
            rating: 5,
            quote: "The atmosphere was electric! Finding and booking the tickets on this site was super simple. I'll definitely be using it for future matches.",
        }
    ];

    // Helper function to render star ratings
    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 !== 0;
        const stars = [];
        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={`full-${i}`} size={18} className="text-secondary-400 fill-current" />);
        }
        if (halfStar) {
            stars.push(<StarHalf key="half" size={18} className="text-secondary-400 fill-current" />);
        }
        return stars;
    };

    return (
        <section className="py-24 bg-neutral-950 relative overflow-hidden">
            {/* --- Animated Background Elements --- */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
                <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-primary-600/10 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-secondary-600/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4">
                        <span className="text-xs font-bold tracking-wider uppercase text-neutral-300">Testimonials</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold font-heading text-white">
                        What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">Users Say</span>
                    </h2>
                    <p className="mt-6 text-lg text-neutral-400 max-w-2xl mx-auto">
                        Real stories from our amazing community of event-goers.
                    </p>
                </div>

                {/* --- THE SWIPER.JS SLIDER --- */}
                <Swiper
                    modules={[Autoplay, EffectCoverflow]}
                    effect={'coverflow'}
                    grabCursor={true}
                    centeredSlides={true}
                    loop={true}
                    breakpoints={{
                        320: { slidesPerView: 1 },
                        768: { slidesPerView: 3 },
                    }}
                    coverflowEffect={{
                        rotate: 0,
                        stretch: 0,
                        depth: 100,
                        modifier: 2.5,
                        slideShadows: false,
                    }}
                    autoplay={{
                        delay: 4000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    }}
                    className="!py-12"
                >
                    {testimonials.map((testimonial, index) => (
                        <SwiperSlide key={index}>
                            {({ isActive }) => (
                                <div
                                    className={`relative p-8 rounded-2xl flex flex-col h-full transition-all duration-500 border backdrop-blur-md ${isActive
                                        ? 'bg-white/10 border-white/20 shadow-2xl scale-110'
                                        : 'bg-white/5 border-white/5 shadow-lg scale-90 opacity-60 grayscale'
                                        }`}
                                >
                                    <Quote size={40} className="absolute top-6 left-6 text-primary-400/50" />

                                    <div className="flex-grow z-10 pt-4">
                                        <p className="text-neutral-200 font-body italic text-center text-lg leading-relaxed">
                                            "{testimonial.quote}"
                                        </p>
                                    </div>
                                    <div className="mt-8 flex flex-col items-center">
                                        <div className="p-1 rounded-full bg-gradient-to-tr from-primary-500 to-secondary-500">
                                            <img
                                                src={testimonial.avatarUrl}
                                                alt={testimonial.name}
                                                className="w-16 h-16 rounded-full object-cover border-4 border-neutral-900"
                                            />
                                        </div>
                                        <div className="text-center mt-4">
                                            <h4 className="text-xl font-bold font-heading text-white">
                                                {testimonial.name}
                                            </h4>
                                            <p className="text-sm text-primary-400 font-medium mb-1">
                                                {testimonial.event}
                                            </p>
                                            <div className="flex justify-center mt-2 gap-1">
                                                {renderStars(testimonial.rating)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
}

export default TestimonialsSection;

