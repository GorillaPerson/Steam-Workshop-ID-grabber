// This Script is old and works but is slow and Does all accepted IDs with no sorting 

function scrapeSteamWorkshop() {
  const baseUrl = "https://steamcommunity.com/workshop/browse/?appid=252490&browsesort=accepted&section=mtxitems&browsefilter=accepted&p=";
  const ids = new Set(); // Use a Set to store unique IDs
  let page = 1;

  // Create a new Google Sheet
  const spreadsheet = SpreadsheetApp.create("Steam Workshop IDs");
  const sheet = spreadsheet.getActiveSheet();
  sheet.appendRow(["Unique IDs"]); // Add header

  while (true) {
    const url = baseUrl + page;

    try {
      // Fetch the webpage content
      const response = UrlFetchApp.fetch(url);
      const html = response.getContentText();

      // Extract IDs using regex matching the sharedfile_ pattern
      const regex = /id="sharedfile_(\d+)"/g; // Match the ID format
      let match;
      let foundNewIds = false; // Flag to check if new IDs are found

      // Check for matches
      while ((match = regex.exec(html)) !== null) {
        if (ids.add(match[1])) { // Add the numeric part of the ID to the Set
          foundNewIds = true; // New ID found
        }
      }

      // If no new IDs were found, we can assume we've reached the end
      if (!foundNewIds) {
        Logger.log("No new IDs found on page " + page + ". Stopping the scrape.");
        break;
      }

      // Log progress
      Logger.log(`Page ${page}: Found ${ids.size} unique IDs so far.`);
      page++; // Increment to the next page

    } catch (error) {
      Logger.log("Error fetching data from page " + page + ": " + error.message);
      break; // Exit the loop on error
    }
  }

  // Convert Set back to an array for writing to the sheet
  const uniqueIds = Array.from(ids);

  // Write unique IDs to the sheet
  if (uniqueIds.length === 0) {
    Logger.log("No IDs found after scraping.");
    sheet.appendRow(["No IDs found."]);
  } else {
    uniqueIds.forEach(id => {
      sheet.appendRow([id]); // Append each ID in a new row
    });
  }

  // Get the URL of the new spreadsheet
  const sheetUrl = spreadsheet.getUrl();

  // Output the link to the Google Sheet
  Logger.log(`IDs have been written to the Google Sheet: ${sheetUrl}`);
  
  // Return the URL for further use if needed
  return sheetUrl;
}
