import { useLoaderData, Link } from 'react-router';
import { Image } from '@shopify/hydrogen';
import SlideShow from '~/components/SlideShow';
import CollectionSlider from '~/components/CollectionSlider';
import FeaturedCollection from '~/components/FeaturedCollection';
import Banner from '~/components/Banner';
import HowToUse from '~/components/HowToUse';
import MainBlogs from '~/components/MainBlogs';
import banner_img from '../assets/banner_img.webp';
import banner_img_2 from '../assets/ciseco_img_with_text_1.webp';
import TrendingProducts from '~/components/TrendingProductComponent';
import Testimonial from '~/components/Testimonial';
import AllCollection from '~/components/AllCollection';
import ProductShowcase from '~/components/Product-with-images';

/** Loader */
export async function loader({ context }) {
  const [
    collectionsRes,
    featuredRes,
    blogsRes,
    trendingRes,
    expertRes
  ] = await Promise.all([
    context.storefront.query(COLLECTION_QUERY, {
      variables: { first: 8 },
    }),
    context.storefront.query(FEATURED_COLLECTION_QUERY, {
      variables: { handle: "new-arrivals", first: 8 },
    }),
    context.storefront.query(LATEST_BLOGS_QUERY, {
      variables: { language: "EN", blogHandle: "news" },
    }),
    context.storefront.query(TRENDING_PRODUCTS_QUERY, {
      variables: { first: 250 },
    }),
    context.storefront.query(EXPERT_CHOSEN_PRODUCTS_QUERY, {
      variables: { first: 20 },
    }),
  ]);

  const collections = collectionsRes?.collections || null;
  const featuredCollection = featuredRes?.collection || null;
  const latestBlogs = blogsRes?.blog?.articles?.nodes || [];
  const trendingProducts = trendingRes?.products?.nodes || [];
  const expertChosenProducts =
    expertRes?.shop?.metafield?.references?.nodes || [];

  return {
    collections,
    featuredCollection,
    latestBlogs,
    trendingProducts,
    expertChosenProducts,
  };
}

/** Homepage */
export default function Homepage() {
  const { collections, featuredCollection, latestBlogs, trendingProducts, expertChosenProducts } = useLoaderData();
  const handleClick = () => alert("Button clicked!");
  
  return (
    <div className="home sections">
      <SlideShow />
      {collections?.nodes && <CollectionSlider collections={collections.nodes} />}
      {featuredCollection && <FeaturedCollection collection={featuredCollection} />}
      <HowToUse />

      <Banner
        heading="Earn free money with Ciseco"
        description="With Ciseco you will get a freeship & savings combo, etc."
        buttonText="Discover more"
        imageUrl={banner_img_2}
        imageAlt="Kid with skateboard"
        onButtonClick={handleClick}
        imagePosition="right"
        background_color="white"
        buttonText_2="Saving combo"
      />
        <AllCollection collections={collections?.nodes}/>
        <ProductShowcase products={expertChosenProducts}/>
      <Banner
        heading="Special offer in kids products"
        description="Fashion is a form of self-expression and autonomy at a particular period and place."
        buttonText="Discover more"
        imageUrl={banner_img}
        imageAlt="Kid with skateboard"
        onButtonClick={handleClick}
        imagePosition="left"
        background_color="yellow"
      />
      <TrendingProducts  products={trendingProducts} />
      {latestBlogs.length > 0 && <MainBlogs blogs={latestBlogs} />}
      <Testimonial/>
    </div>
  );
}

/* --- GraphQL Queries --- */

const COLLECTION_QUERY = `#graphql
  fragment Collection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
    products(first: 250) {
      nodes {
        id
      }
    }   
  }

  query HomeStoreCollections($first: Int!) {
    collections(first: $first, sortKey: TITLE) {
      nodes {
        ...Collection
      }
    }
  }
`;

const FEATURED_COLLECTION_QUERY = `#graphql
  query CollectionDetails(
    $handle: String!,
    $first: Int!,
    $country: CountryCode,
    $language: LanguageCode
  )
  @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      title
      products(first: $first, sortKey: TITLE, reverse: true) {
        nodes {
          id
          title
          handle
          featuredImage {
            url
            altText
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          options {
            name
            optionValues {
              name
              swatch {
                color
                image {
                  previewImage {
                    url
                  }
                }
              }
            }
          }
          variants(first: 10) {
            nodes {
              id
              title
              availableForSale
              selectedOptions {
                name
                value
              }
              image {
                url
                altText
              }
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
`;

// Latest Blogs Query
const LATEST_BLOGS_QUERY = `#graphql
  query LatestBlogs(
    $language: LanguageCode
    $blogHandle: String!
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      title
      handle
      seo {
        title
        description
      }
      articles(first: 4) {
        nodes {
          ...ArticleItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          startCursor
          endCursor
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

const TRENDING_PRODUCTS_QUERY = `#graphql
  query StoreProducts($first: Int!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: $first, sortKey: UPDATED_AT) {
      nodes {
        id
        title
        handle
        tags
        description
        featuredImage {
          id
          url
          altText
          width
          height
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }  
        }
        options {
          name
          optionValues {
            name
            swatch {
              color
              image {
                previewImage {
                  url
                }
              }
            }
          }
        }
        variants(first: 10) {
          nodes {
            id
            title
            availableForSale
            selectedOptions {
              name
              value
            }
            image {
              url
              altText
            }
            price {
              amount
              currencyCode
            }
          }
        } 
      }
    }
  }
`;

const EXPERT_CHOSEN_PRODUCTS_QUERY = `#graphql
  query ExpertChosenProducts($first: Int!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    shop {
      metafield(namespace: "custom", key: "product_chosen_by_expert") {
        references(first: $first) {
          nodes {
            ... on Product {
              id
              title
              handle
              tags
              description
              availableForSale
              featuredImage {
                id
                url
                altText
                width
                height
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
                maxVariantPrice {
                  amount
                  currencyCode
                }
              }
              options {
                name
                optionValues {
                  name
                  swatch {
                    color
                    image {
                      previewImage {
                        url
                      }
                    }
                  }
                }
              }
              images(first: 10) {
                nodes {
                  url
                  altText
                  width
                  height
                }
              }
              variants(first: 10) {
                nodes {
                  id
                  title
                  availableForSale
                  selectedOptions {
                    name
                    value
                  }
                  image {
                    url
                    altText
                  }
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

