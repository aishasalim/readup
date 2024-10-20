// services/BooksService.js
const axios = require('axios');

const GOOGLE_API_BASE_URL = 'https://www.googleapis.com/books/v1';
const GOOGLE_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

const API_BASE_URL = 'https://api.nytimes.com/svc/books/v3';
const API_KEY = process.env.NYT_BOOKS_API_KEY;

/**
 * Fetches the best sellers overview from the NYT Books API.
 * @returns {Object} The API response data.
 */
const getBestSellersOverview = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/lists/overview.json`, {
      params: {
        'api-key': API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error in getBestSellersOverview:', error.response?.data || error.message);
    throw error;
  }
};


/**
 * Searches for books using the Google Books API based on provided query parameters.
 * Accepts author, title, and isbn.
 * @param {Object} searchParams - The search parameters.
 * @param {string} [searchParams.author] - The author's name.
 * @param {string} [searchParams.title] - The book title.
 * @param {string} [searchParams.isbn] - The ISBN-13 of the book.
 * @returns {Object} The API response data.
 */
const searchBooksGoogle = async (searchParams) => {
  try {
    const { author, title, isbn } = searchParams;
    let query = '';

    if (title) {
      query += `intitle:${title}`;
    }

    if (author) {
      if (query) query += '+';
      query += `inauthor:${author}`;
    }

    if (isbn) {
      if (query) query += '+';
      query += `isbn:${isbn}`;
    }

    const response = await axios.get(`${GOOGLE_API_BASE_URL}/volumes`, {
      params: {
        q: query,
        key: GOOGLE_API_KEY,
        maxResults: 20, // Adjust as needed
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error in searchBooksGoogle:', error.response?.data || error.message);
    throw error;
  }
};

// services/BooksService.js (Add the transformation function)
const transformGoogleBooksResponse = (googleResponse) => {
  const nytResponse = {
    status: 'OK',
    num_results: googleResponse.totalItems,
    results: {
      bestsellers_date: '', // You can set this if needed
      published_date: '', // You can set this if needed
      lists: [
        {
          list_id: 1,
          list_name: 'Search Results',
          display_name: 'Search Results',
          updated: 'WEEKLY', // Or as appropriate
          books: googleResponse.items.map((item) => {
            const volumeInfo = item.volumeInfo || {};
            const industryIdentifiers = volumeInfo.industryIdentifiers || [];
            const isbn13 = industryIdentifiers.find(
              (id) => id.type === 'ISBN_13'
            )?.identifier || '';
            const authors = volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author';
            return {
              age_group: '',
              amazon_product_url: '', // Construct if possible
              article_chapter_link: '',
              author: authors,
              book_image: volumeInfo.imageLinks?.thumbnail || '',
              book_image_width: 0, // Not provided
              book_image_height: 0, // Not provided
              book_review_link: '',
              contributor: `by ${authors}`,
              contributor_note: '',
              created_date: new Date().toISOString(),
              description: volumeInfo.description || '',
              first_chapter_link: '',
              price: '',
              primary_isbn10: industryIdentifiers.find((id) => id.type === 'ISBN_10')?.identifier || '',
              primary_isbn13: isbn13,
              book_uri: item.selfLink || '',
              publisher: volumeInfo.publisher || '',
              rank: 0,
              rank_last_week: 0,
              sunday_review_link: '',
              title: volumeInfo.title || '',
              updated_date: new Date().toISOString(),
              weeks_on_list: 0,
              buy_links: [] // You can populate this if you have the data
            };
          }),
        },
      ],
    },
  };
  return nytResponse;
};

module.exports = {
  getBestSellersOverview,
  searchBooksGoogle,
  transformGoogleBooksResponse,
};
