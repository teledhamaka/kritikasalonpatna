// app/components/CategoryGrid.tsx - SERVER COMPONENT
import Image from 'next/image';
import Link from 'next/link';

const categories = [
  { name: 'Makeup', icon: '/icons/makeup.svg', count: 25, href: '/makeup' },
  { name: 'Hair', icon: '/icons/hair.svg', count: 20, href: '/hair' },
  { name: 'Skin', icon: '/icons/skin.svg', count: 15, href: '/skin' },
  { name: 'Nails', icon: '/icons/nails.svg', count: 10, href: '/nails' },
  { name: 'Bridal', icon: '/icons/bridal.svg', count: 12, href: '/bridal' },
  { name: 'All', icon: '/icons/all.svg', count: 72, href: '/services' },
];

const CategoryGrid = () => {
  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
        Browse by Category
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={category.href}
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-center group"
          >
            <div className="w-12 h-12 mx-auto mb-3 relative">
              <div className="w-full h-full bg-pink-50 rounded-full flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                <div className="text-pink-600 text-xl">
                  {category.name === 'Makeup' && '💄'}
                  {category.name === 'Hair' && '💇'}
                  {category.name === 'Skin' && '✨'}
                  {category.name === 'Nails' && '💅'}
                  {category.name === 'Bridal' && '👰'}
                  {category.name === 'All' && '🌟'}
                </div>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
            <p className="text-sm text-gray-500">{category.count} services</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;