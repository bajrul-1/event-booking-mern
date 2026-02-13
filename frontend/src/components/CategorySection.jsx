import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllCategories } from '../redux/features/categories/categoriesSlice.js';
import { LoaderCircle, Sparkles } from 'lucide-react';
import CategoryCard from './CategoryCard.jsx';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

function CategorySection() {
    const dispatch = useDispatch();
    const { items: categories = [], status = 'idle' } = useSelector(state => state.categories) || {};

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchAllCategories());
        }
    }, [status, dispatch]);

    if (status === 'loading') {
        return <div className="flex justify-center items-center py-20 bg-neutral-950"><LoaderCircle size={48} className="animate-spin text-primary-500" /></div>;
    }
    if (status === 'succeeded' && categories.length === 0) {
        return null;
    }

    return (
        <section className="py-24 bg-neutral-950 relative overflow-hidden">
            {/* --- Animated Background Elements --- */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[-10%] w-96 h-96 bg-primary-600/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[20%] right-[-10%] w-96 h-96 bg-secondary-600/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4">
                        <Sparkles size={14} className="text-secondary-400" />
                        <span className="text-xs font-bold tracking-wider uppercase text-neutral-300">Explore Interests</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold font-heading text-white">
                        Browse by <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">Category</span>
                    </h2>
                    <p className="mt-6 text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                        Find the perfect event for you by exploring our popular categories.
                    </p>
                </div>

                <div className="px-4">
                    <Swiper
                        modules={[Autoplay, Navigation]}
                        centeredSlides={false}
                        breakpoints={{
                            320: { slidesPerView: 1.2, spaceBetween: 16 },
                            480: { slidesPerView: 2.2, spaceBetween: 20 },
                            768: { slidesPerView: 3.2, spaceBetween: 24 },
                            1024: { slidesPerView: 4.5, spaceBetween: 24 },
                            1280: { slidesPerView: 5, spaceBetween: 30 },
                        }}
                        loop={true}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}
                        grabCursor={true}
                        className="!pb-12 !px-4"
                    >
                        {categories.map((category) => (
                            <SwiperSlide key={category._id?.$oid || category._id} className="h-auto">
                                <div className="h-full transform transition-all duration-300 hover:-translate-y-2">
                                    <CategoryCard category={category} />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    );
}

export default CategorySection;

