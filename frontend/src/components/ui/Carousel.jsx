import { useEffect, useRef, useState, useCallback, Children, cloneElement } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// interval: auto-slide speed in ms (e.g., 10000 for 10s)
// children: React components (the slides)
function Carousel({ children, autoSlideInterval = 10000 }) {
    const sliderRef = useRef(null);
    const intervalRef = useRef(null);

    // Seamless loop-er jonno children-ke clone kora hocche
    const originalChildren = Children.toArray(children);
    const loopedChildren = originalChildren.length > 0
        ? [
            cloneElement(originalChildren[originalChildren.length - 1], { key: 'clone-last' }),
            ...originalChildren.map((child, index) => cloneElement(child, { key: `original-${index}` })),
            cloneElement(originalChildren[0], { key: 'clone-first' })
        ]
        : [];

    const [currentIndex, setCurrentIndex] = useState(1);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    // Slide change korar function
    const changeSlide = useCallback((index) => {
        setIsTransitioning(true);
        setCurrentIndex(index);
    }, []);

    const goToNext = useCallback(() => changeSlide(currentIndex + 1), [currentIndex, changeSlide]);
    const goToPrev = useCallback(() => changeSlide(currentIndex - 1), [currentIndex, changeSlide]);

    // Auto-slide logic
    useEffect(() => {
        if (!isHovered && loopedChildren.length > 1 && autoSlideInterval > 0) {
            intervalRef.current = setInterval(goToNext, autoSlideInterval);
        }
        return () => clearInterval(intervalRef.current);
    }, [isHovered, loopedChildren.length, goToNext, autoSlideInterval]);

    // Seamless loop handle korar function
    const handleTransitionEnd = () => {
        if (currentIndex === 0) {
            setIsTransitioning(false);
            setCurrentIndex(loopedChildren.length - 2);
        }
        if (currentIndex === loopedChildren.length - 1) {
            setIsTransitioning(false);
            setCurrentIndex(1);
        }
    };

    return (
        <div
            className="relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="overflow-hidden">
                <div
                    ref={sliderRef}
                    className="flex"
                    style={{
                        transform: `translateX(calc(-${currentIndex * 100}%))`,
                        transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none',
                    }}
                    onTransitionEnd={handleTransitionEnd}
                >
                    {loopedChildren.map((child, index) => (
                        <div key={index} className="flex-shrink-0 w-full p-4">
                            {child}
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Buttons */}
            <button onClick={goToPrev} className="absolute top-1/2 -translate-y-1/2 -left-4 z-20 p-3 rounded-full bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm shadow-lg hover:scale-110 transition-all opacity-0 group-hover:opacity-100 group-hover:left-4"><ChevronLeft /></button>
            <button onClick={goToNext} className="absolute top-1/2 -translate-y-1/2 -right-4 z-20 p-3 rounded-full bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm shadow-lg hover:scale-110 transition-all opacity-0 group-hover:opacity-100 group-hover:right-4"><ChevronRight /></button>
        </div>
    );
}

export default Carousel;
