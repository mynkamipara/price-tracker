import axios from 'axios';
import { config } from 'src/config';

export const fetchPrices = async (slug: Array<String>, convert: string) => {
    const slug_params = slug.join(',');
    const response = await axios.get(
        `${config.external.coin_market_base_url}cryptocurrency/quotes/latest?slug=${slug_params}&convert=${convert}`,
        {
            headers: {
                'X-CMC_PRO_API_KEY': config.external.coin_market_api_key
            }
        });
    return response.data.data;
}