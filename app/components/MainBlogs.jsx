import {Image} from '@shopify/hydrogen';
import { Link } from 'react-router';

// Main Blog Card Component
function BlogCard({blog, featured = false}) {
  return (
    <article className={`group cursor-pointer ${featured ? 'col-span-1 md:col-span-2 lg:col-span-1' : ''}`}>
        <Link to={blog.handle}>
      <div className="flex flex-col h-auto">
        <div className="relative w-full h-[50%] overflow-hidden rounded-3xl mb-4 aspect-[4/3] bg-gray-200">
          <Image
            data={{
              url: blog.image,
              altText: blog.title,
            }}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          />
        </div>

        <div className="flex flex-col flex-grow">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-600 transition-colors line-clamp-2">
            {blog.title}
          </h3>

          <p className="text-gray-600 text-sm md:text-base mb-4 line-clamp-2 flex-grow">
            {blog.content
                ? blog.content.split(' ').slice(0, 10).join(' ') + (blog.content.split(' ').length > 10 ? '...' : '')
                : ''}
            </p>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <time dateTime={blog.date}>{blog.date}</time>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-700 font-medium">
              {blog.category}
            </span>
          </div>
        </div>
      </div>
      </Link>
    </article>
  );
}

// Featured Blog Card (larger, left side)
function FeaturedBlogCard({blog}) {
  return (
    <Link to={blog.handle}>
    <article className="group cursor-pointer">
      <div className="flex flex-col h-max-content">
        <div className="relative overflow-hidden rounded-3xl mb-6 aspect-[16/10] bg-gray-200">
          <Image
            data={{
              url: blog.image,
              altText: blog.title,
            }}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 66vw, 100vw"
          />
        </div>

        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 group-hover:text-gray-600 transition-colors">
          {blog.title}
        </h2>

        <p className="text-gray-600 text-base md:text-lg mb-6 line-clamp-3">
          {blog.description}
        </p>

        <div className="flex items-center gap-4 text-sm md:text-base text-gray-500 mt-auto">
          <time dateTime={blog.date}>{blog.date}</time>
          <span className="px-4 py-1.5 bg-gray-100 rounded-full text-gray-700 font-medium">
            {blog.category}
          </span>
        </div>
      </div>
    </article>
    </Link>
  );
}

// Main Blogs Component
export default function MainBlogs({blogs = []}) {
  if (!blogs || blogs.length === 0) {
    return null;
  }

  return (
    <div className=" bg-slate-100">
        <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16'>
      {/* Header */}
      <header className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
          The latest news.
          <span className="text-gray-400">From the Ciseco blog</span>
        </h1>
      </header>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
        {/* Featured Blog - Left Side (First Blog) */}
        <div className="lg:col-span-2">
          <FeaturedBlogCard blog={blogs[0]} />
        </div>

        {/* Side Blogs - Right Side (Next 3 Blogs) */}
        <div className="lg:col-span-1 flex flex-col gap-6 md:gap-8">
          {blogs.slice(1, 4).map((blog, index) => (
            <BlogCard key={blog.id || index} blog={blog} />
          ))}
        </div>
      </div>

      {/* Additional Blogs Grid (if more than 4 blogs) */}
      {blogs.length > 4 && (
        <div className="mt-10 md:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {blogs.slice(4).map((blog, index) => (
            <BlogCard key={blog.id || index} blog={blog} />
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
