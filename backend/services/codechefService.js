import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Fetch CodeChef user data via web scraping.
 * CodeChef has no official public API, so we scrape the profile page.
 *
 * @param {string} username - CodeChef username
 * @returns {object} Aggregated CodeChef data
 */
export async function fetchCodeChefData(username) {
  const profileUrl = `https://www.codechef.com/users/${username}`;

  try {
    const res = await axios.get(profileUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(res.data);

    // Extract rating
    const ratingText = $('.rating-number').first().text().trim();
    const rating = parseInt(ratingText, 10) || 0;

    // Extract star level from rating-star class or header
    const starElement = $('.rating-star span');
    const starText = starElement.text().trim();
    const stars = (starText.match(/★/g) || []).length || 0;

    // Extract highest rating
    const highestRatingText = $('.rating-header small')
      .text()
      .replace(/[^0-9]/g, '');
    const highestRating = parseInt(highestRatingText, 10) || rating;

    // Extract global/country rank
    const ranks = {};
    $('.rating-ranks ul li').each((_, el) => {
      const label = $(el).find('strong').text().trim().toLowerCase();
      const value = $(el).find('a').text().trim().replace(/[^0-9]/g, '');
      if (label.includes('global')) ranks.global = parseInt(value, 10) || null;
      if (label.includes('country')) ranks.country = parseInt(value, 10) || null;
    });

    // Extract total problems solved from the profile section
    const problemsSolvedSection = $('section.rating-data-section.problems-solved');
    let totalProblemsSolved = 0;
    problemsSolvedSection.find('h5').each((_, el) => {
      const text = $(el).text().trim();
      const match = text.match(/\((\d+)\)/);
      if (match) {
        totalProblemsSolved += parseInt(match[1], 10);
      }
    });

    return {
      username,
      rating,
      highestRating,
      stars,
      globalRank: ranks.global || null,
      countryRank: ranks.country || null,
      totalProblemsSolved,
    };
  } catch (error) {
    console.error(`CodeChef fetch error for ${username}:`, error.message);
    throw new Error(`Failed to fetch CodeChef data: ${error.message}`);
  }
}
