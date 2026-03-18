import fs from "fs";

async function run() {
  const clientId = "1a7498ee9af34887b58291a19629412a";
  const clientSecret = "5c05d2de49b5438b9f63ecbe7a8ff4fe";
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  console.log("Fetching token...");
  const res = await fetch("https://oauth.fatsecret.com/connect/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: "grant_type=client_credentials&scope=basic",
  });
  
  const tokenData = await res.json();
  const token = tokenData.access_token;
  console.log("Token:", token ? "OK" : "Error");

  const url = new URL("https://platform.fatsecret.com/rest/server.api");
  url.searchParams.set("method", "foods.autocomplete");
  url.searchParams.set("expression", "chick");
  url.searchParams.set("max_results", "6");
  url.searchParams.set("format", "json");

  console.log("Fetching autocomplete...");
  const searchRes = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  const searchData = await searchRes.json();
  console.log("Raw Response:");
  console.log(JSON.stringify(searchData, null, 2));
}

run().catch(console.error);
