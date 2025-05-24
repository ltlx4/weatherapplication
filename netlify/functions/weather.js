

exports.handler = async (event) => {
  try {
    console.log("Event:", event);

    const { city, type } = event.queryStringParameters;
    if (!city || !type) {
      throw new Error("Missing city or type parameter");
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      throw new Error("API key is missing from environment variables");
    }

    let url = "";
    if (type === "current") {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    } else if (type === "forecast") {
      url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
    } else {
      throw new Error("Invalid type");
    }

    const response = await fetch(url);
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
