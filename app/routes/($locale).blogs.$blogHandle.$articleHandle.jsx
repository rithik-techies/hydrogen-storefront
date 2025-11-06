import {useLoaderData, Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import Button from '../components/Button';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [{title: `Hydrogen | ${data?.article.title ?? ''} article`}];
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
  const {blogHandle, articleHandle} = params;

  if (!articleHandle || !blogHandle) {
    throw new Response('Not found', {status: 404});
  }

  const [{blog}] = await Promise.all([
    context.storefront.query(ARTICLE_QUERY, {
      variables: {blogHandle, articleHandle},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!blog?.articleByHandle) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(
    request,
    {
      handle: articleHandle,
      data: blog.articleByHandle,
    },
    {
      handle: blogHandle,
      data: blog,
    },
  );
    const article = blog.articleByHandle;

   const relatedArticles = await getRelatedArticles(context, blogHandle, articleHandle, article.tags);

  return {article, relatedArticles};
}

async function getRelatedArticles(context, blogHandle, currentHandle, tags) {
  if (!tags?.length) return [];

  const {blog} = await context.storefront.query(RELATED_ARTICLES_QUERY, {
    variables: {blogHandle, first: 5},
  });

  if (!blog?.articles?.nodes?.length) return [];

  // Filter articles that share tags and exclude the current one
  return blog.articles.nodes.filter(
    (a) => a.handle !== currentHandle && a.tags.some((t) => tags.includes(t))
  );
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

export default function Article() {
  /** @type {LoaderReturnData} */
  const {article, relatedArticles} = useLoaderData();
  const {title, image, contentHtml, author, tags} = article;

  const publishedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt));

   const getAuthorInitial = (name) => {
    if (!name || typeof name !== 'string') return '';
    return name.trim().charAt(0).toUpperCase();
  };

  const getReadTime = (contentHtml) => {
    const wordsPerMinute = 200;
    const wordCount = contentHtml.split(/\s+/).length;
    const readTimeMinutes = Math.ceil(wordCount / wordsPerMinute);
    return readTimeMinutes;
  } 

  const readTime = getReadTime(contentHtml)
  const authorInitial = getAuthorInitial(author?.name)

  return (
    <div className="article container nc-PageSingle pt-8 lg:pt-16 pb-16 lg:pb-20 space-y-20 sm:space-y-24">
      <div className='max-w-screen-md !my-0 mx-auto space-y-5'>
        <div className="flex flex-wrap gap-2">
          <span className="nc-Badge inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium text-xs forced-colors:outline bg-sky-500/15 text-sky-800 group-data-[hover]:bg-sky-500/25 dark:bg-sky-500/10 dark:text-sky-300 dark:group-data-[hover]:bg-sky-500/20">{tags}</span></div>
      <h1 className='!my-2 text-neutral-900 font-semibold text-3xl md:text-4xl md:!leading-[120%] lg:text-4xl dark:text-neutral-100 max-w-4xl '>
        {title}
        </h1>
       <div class="w-full border-b border-neutral-100 dark:border-neutral-800"></div>

        <div className="nc-PostMeta2 flex items-center flex-wrap text-neutral-700 text-left dark:text-neutral-200 text-sm leading-none flex-shrink-0">
      <div className="wil-avatar relative flex-shrink-0 bg-[rgb(48,195,158)] inline-flex items-center justify-center text-neutral-100 uppercase font-semibold shadow-inner rounded-full w-8 h-8 sm:h-11 sm:w-11  flex-shrink-0">
        <span className="wil-avatar__name">{authorInitial}</span>
      </div>
        <div className="ml-3">
          <div className="flex items-center">
            <div className="block font-semibold">{author?.name}</div>
          </div>
          <div className="text-xs mt-[6px]">
            <span className="text-neutral-700 dark:text-neutral-300"><time dateTime={article.publishedAt}>{publishedDate}</time></span>
            <span className="mx-2 font-semibold">·</span>
            <span className="text-neutral-700 dark:text-neutral-300">{readTime} min read</span>
            </div>
            </div>
           </div>
        </div>
        <div className='my-10 sm:my-12'>
      {image && <Image data={image} className='w-full rounded-xl' sizes="90vw" loading="eager" />}
      </div>
      <div
        dangerouslySetInnerHTML={{__html: contentHtml}}
        className="article max-w-screen-md  my-2 mx-auto space-y-5 font-lg prose prose-sm sm:prose lg:prose-lg dark:prose-invert"
      />
      <div className='flex justify-center mt-10 sm:mt-15 '>
      <Button  size="md" children={`Back to News`} link={`/blogs/news`} className= {`relative h-auto inline-flex items-center justify-center rounded-full transition-colors text-sm sm:text-base font-medium py-3 px-4 lg:py-3.5 lg:px-7  !bg-white !text-slate-700 !hover:bg-gray-100  border !border-slate-300 !dark:border-slate-700  !focus:outline-none !focus:ring-2 !focus:ring-offset-2 !focus:ring-primary-600 dark:focus:ring-offset-0`}/>
    </div>

     {relatedArticles?.length > 0 && (
        <div className="mt-16">
          <div className='nc-Section-Heading relative flex flex-col sm:flex-row sm:items-end justify-between mb-10 lg:mb-12'>
          <h2 className="text-2xl md:text-3xl font-semibold">Related Articles</h2>
          </div>
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {relatedArticles.map((a) => (
             <ArticleItem key={a.handle} article={a}/>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog#field-blog-articlebyhandle
const ARTICLE_QUERY = `#graphql
  query Article(
    $articleHandle: String!
    $blogHandle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    blog(handle: $blogHandle) {
      handle
      articleByHandle(handle: $articleHandle) {
        handle
        title
        tags
        contentHtml
        publishedAt
        author: authorV2 {
          name
        }
        image {
          id
          altText
          url
          width
          height
        }
        seo {
          description
          title
        }
      }
    }
  }
`;

const RELATED_ARTICLES_QUERY = `#graphql
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
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
