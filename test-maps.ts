import { Client } from '@googlemaps/google-maps-services-js';
import * as dotenv from 'dotenv';
dotenv.config();

const client = new Client({});
const API_KEY = process.env.GOOGLE_API_KEY || '';

async function test() {
  console.log('Testing with API KEY:', API_KEY.substring(0, 8) + '...');
  try {
    const res = await client.textSearch({
      params: {
        query: 'Design Agencies in London',
        key: API_KEY,
      },
    });
    console.log('Results count:', res.data.results.length);
    console.log(res.data.results[0]);
  } catch (error: any) {
    console.error('API Error:', error.response ? error.response.data : error.message);
  }
}
test();
