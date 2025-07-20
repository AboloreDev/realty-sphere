import axios from "axios";
import { BAD_REQUEST, NOT_FOUND } from "../constants/httpStatus";
import appAssert from "../utils/appAssert";
import { catchAsyncError } from "../utils/catchAsyncErrors";

export const handleLocationFetch = catchAsyncError(async (req, res) => {
  const { query } = req.query;
  if (!query) {
    appAssert(false, BAD_REQUEST, "Query is required");
  }

  const response = await axios.get(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      String(query)
    )}&format=json&limit=1`,
    {
      headers: {
        // Nominatim requires a User-Agent identifying your app
        "User-Agent": "Nestora/1.0 (alabiabolore4@gmail.com)",
      },
    }
  );

  const data = response.data;
  if (data.length === 0) {
    appAssert(false, NOT_FOUND, "Location not found");
  }

  const { lat, lon } = data[0];
  return res.status(200).json({
    success: true,
    data: {
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
    },
  });
});
