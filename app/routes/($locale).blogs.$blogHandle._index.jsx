import {Link, useLoaderData} from 'react-router';
import {Image, getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [{title: `Hydrogen | ${data?.blog.title ?? ''} blog`}];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context, request, params}) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 10,
  });

  if (!params.blogHandle) {
    throw new Response(`blog not found`, {status: 404});
  }

  const [{blog}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        blogHandle: params.blogHandle,
        ...paginationVariables,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!blog?.articles) {
    throw new Response('Not found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.blogHandle, data: blog});

  return {blog};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Blog() {
  /** @type {LoaderReturnData} */
  const {blog} = useLoaderData();
  const {articles} = blog;

  return (
    <div className="page-news pt-16 lg:pt-24 pb-20 lg:pb-28 xl:pb-32 space-y-20 sm:space-y-24 lg:space-y-28">
      <div className='container'>
      <div className='flex flex-col justify-center items-center'>
        <div className='max-w-screen-sm text-center'>
      <h1 className='block text-2xl !m-0 sm:text-3xl lg:text-4xl font-semibold capitalize'>{blog.title}</h1>
        </div>
        <div className='block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-400 mt-3 lg:mt-5'>
          <Link className='hover:text-slate-900 hover:underline' to={'/'}>Home</Link>
          <span className="text-xs mx-1 sm:mx-1.5">/</span>
          <span className='underline'>{blog.title}</span>
        </div>
      </div>
      <hr className="mt-16 border border-gray-200 "></hr>
      <div className="blog-grid">
        <PaginatedResourceSection resourcesClassName={'mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3'} connection={articles}>
          {({node: article, index}) => (
            <ArticleItem
              article={article}
              key={article.id}
              loading={index < 2 ? 'eager' : 'lazy'}
            />
          )}
        </PaginatedResourceSection>
      </div>
    </div>
    </div>
  );
}

/**
 * @param {{
 *   article: ArticleItemFragment;
 *   loading?: HTMLImageElement['loading'];
 * }}
 */
function ArticleItem({article, loading}) {
  const publishedAt = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(article.publishedAt));

  return (
    <div className="flex flex-col items-start justify-between ">
      <Link to={`/blogs/${article.blog.handle}/${article.handle}`} className="flex flex-col h-full">
        {article.image && (
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4">
            <Image
              alt={article.image.altText || article.title}
              aspectRatio="4/3"
              data={article.image}
              loading={loading}
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className=" bg-gray-100 object-cover w-full h-full hover:opacity-80 transition-opacity"
            />
          </div>
        )}
        
        <div className="flex flex-col flex-grow">
          <div className="flex items-center gap-3 mb-3 text-sm">
            <div className='mt-8 flex flex-wrap items-center gap-2 sm:gap-x-4 text-xs'>
            <time className="text-gray-600">{publishedAt}</time>
            {article.tags && article.tags.length > 0 && (
              <>
                <span className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600">{article.tags}</span>
              </>
            )}
            </div>
          </div>
          
          <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
            {article.title}
          </h3>
          
          {article.content && (
            <p className="!mt-5 line-clamp-3 text-sm leading-6 text-gray-600">
              {article.content}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}


// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blog(
    $language: LanguageCode
    $blogHandle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      title
      handle
      seo {
        title
        description
      }
      articles(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ArticleItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          hasNextPage
          endCursor
          startCursor
        }

      }
    }
  }
  fragment ArticleItem on Article {
    author: authorV2 {
      name
    }
    contentHtml
    handle
    id
    image {
      id
      altText
      url
      width
      height
    }
    publishedAt
    title
    content
    tags
    blog {
      handle
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').ArticleItemFragment} ArticleItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
