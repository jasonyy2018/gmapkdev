import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client({});
const API_KEY = process.env.GOOGLE_API_KEY || "";

export const mapsService = {
  async searchPlaces(query: string, location?: string) {
    if (!API_KEY) {
      console.warn("Maps Service not available - missing API key.");
      return [];
    }

    try {
      const response = await client.placesNearby({
        params: {
          location: location ? await this.getCoordinates(location) : undefined,
          radius: 5000,
          keyword: query,
          key: API_KEY,
        },
      });

      // Alternatively, use Text Search if location is a string like "San Francisco"
      // Since the old Python code used `self.gmaps.places(query=...)`, that's a Text Search.
      
      const textSearchResponse = await client.textSearch({
        params: {
          query: location ? `${query} in ${location}` : query,
          key: API_KEY,
        },
      });

      const leads = [];
      for (const place of textSearchResponse.data.results) {
        const details = await this.getPlaceDetails(place.place_id!);
        leads.push({
          name: place.name,
          address: place.formatted_address,
          place_id: place.place_id,
          rating: place.rating,
          website: details.website,
          phone: details.formatted_phone_number || details.international_phone_number,
        });
      }
      return leads;
    } catch (error) {
      console.error("Error searching places:", error);
      return [];
    }
  },

  async getPlaceDetails(placeId: string) {
    try {
      const response = await client.placeDetails({
        params: {
          place_id: placeId,
          fields: ["name", "website", "formatted_phone_number", "international_phone_number"],
          key: API_KEY,
        },
      });
      return response.data.result || {};
    } catch (error) {
      console.error(`Error getting place details ${placeId}:`, error);
      return {};
    }
  },

  async getCoordinates(locationName: string) {
    try {
      const response = await client.geocode({
        params: {
          address: locationName,
          key: API_KEY,
        },
      });
      if (response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry.location;
        return `${lat},${lng}`;
      }
    } catch (error) {
      console.error("Error geocoding location:", error);
    }
    return undefined;
  },
};
