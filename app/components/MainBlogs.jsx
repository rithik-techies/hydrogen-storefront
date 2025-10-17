import {Image} from '@shopify/hydrogen';
import { Link } from 'react-router';
import Button from './Button';

// Main Blog Card Component
function BlogCard({blog, featured = false}) {
  return (
    <article className={`group cursor-pointer ${featured ? 'col-span-1 md:col-span-2 lg:col-span-1' : ''}`}>
        <Link to={`blogs/news/${blog.handle}`}>
      <div className="grid grid-cols-2  gap-3 md:gap-5 w-full ">

        <div className="flex order-1 lg:order-2 flex-col flex-grow">
          <h3 className="text-xl inline-block md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-600 transition-colors line-clamp-2">
            {blog.title}
          </h3>

        <p className="text-gray-600 text-sm md:text-base mb-4 flex-grow">
            {blog.content.split(' ').slice(0, 10).join(' ') + '...'}
        </p>


          <div className="flex items-center gap-4 mt-4 md:text-base text-sm text-gray-500">
           <time dateTime={blog.publishedAt}>{new Date(blog.publishedAt).toDateString()}</time>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-700 font-medium">
              {blog.tag}
            </span>
          </div>
        </div>

         <div className="rounded-4xl justify-self-end overflow-hidden order-1 lg:order-2 w-full h-45 sm:w-60">
          <Image
            data={{
              url: blog.image.url,
              altText: blog.title,
            }}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          />
        </div>
      </div>
      </Link>
    </article>
  );
}

// Featured Blog Card (larger, left side)
function FeaturedBlogCard({blog}) {
  return (
    <Link to={`blogs/news/${blog.handle}`}>
    <article className="group cursor-pointer">
      <div className="group relative flex flex-col h-full">
        <div className="block flex-shrink-0 flex-grow relative w-full h-100 aspect-w-4 aspect-h-3 rounded-3xl overflow-hidden mb-8">
          <Image
            data={{
              url: blog.image.url,
              altText: blog.title,
            }}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 66vw, 100vw"
          />
        </div>

        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 group-hover:text-gray-600 transition-colors">
          {blog.title}
        </h2>

        <p className="text-gray-600 text-base md:text-lg mb-6 line-clamp-2">
          {blog.content}
        </p>

        <div className="flex items-center gap-4 mt-4 text-sm md:text-base text-gray-500 ">
         <time dateTime={blog.publishedAt}>{new Date(blog.publishedAt).toDateString()}</time>
          <span className="px-4 py-1.5 bg-gray-100  rounded-full text-gray-700 font-medium">
            {blog.tags}
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
    <div className=" bg-slate-100 rounded-4xl">
        <div className='w-full py-24 lg:py-32 max-w-7xl container mx-auto px-4 sm:px-6 lg:px-8'>
      {/* Header */}
      <header className="mb-8 md:mb-12">
        <h1 className="text-2xl sm:text-3xl !m-0 lg:text-4xl font-bold">
          The latest news.{' '}
          <span className="text-gray-400 text-2xl sm:text-3xl lg:text-4xl font-bold">From the Ciseco blog</span>
        </h1>
      </header>

      {/* Blog Grid */}
      <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
        {/* Featured Blog - Left Side (First Blog) */}
        <div className="lg:col-span-1">
          <FeaturedBlogCard blog={blogs[0]} />
        </div>

        {/* Side Blogs - Right Side (Next 3 Blogs) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
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
      <div className='flex justify-center mt-15 '>
      <Button  size="md" children={`Read more blogs`} link={`/blogs/news`} className= {`bg-white cursor-pointer border-slate-300 border-2 !text-black hover:bg-transparent`}/>
    </div>
    </div>
    </div>
  );
}
