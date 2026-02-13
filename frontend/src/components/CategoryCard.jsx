import { NavLink } from "react-router-dom";

function CategoryCard({ category }) {
    if (!category) return null;

    return (
        <NavLink
            to={`/events/category/${category.slug}`}
            className="block"
        >
            <div className="relative aspect-video rounded-2xl shadow-lg overflow-hidden">
                <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative z-10 flex h-full items-center justify-center p-4">
                    <h3 className="text-3xl font-bold font-alt text-white text-center shadow-lg">
                        {category.name}
                    </h3>
                </div>
            </div>
        </NavLink>
    );
}

export default CategoryCard;