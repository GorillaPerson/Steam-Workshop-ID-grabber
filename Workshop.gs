function scrapeSteamWorkshop() {
  // Define labels (tags) to search for
  const labels = ["Bandana", "Balaclava", "Beenie Hat", "Burlap Shoes", "Burlap Shirt", " Burlap Pants", " Burlap Headwrap", "Bucket Helmet", "Boonie Hat", "Cap", "Collared Shirt", "Coffee Can Helmet", "Deer Skull Mask", "Hide Skirt", "Hide Shirt", "Hide Pants", "Hide Shoes", "Hide Halterneck", "Hoodie", "Hide Poncho", "Leather Gloves", "Long TShirt", "Metal Chest Plate", " Metal Facemask", "Miner Hat", "Pants ", "Roadsign Vest", "Roadsign Pants", "Riot Helmet", "Snow Jacket", "Shorts", "Tank Top", "TShirt", "Vagabond Jacket", "Work Boots", "AK47", "Bolt Rifle", "Bone Club", "Bone Knife", "Crossbow", "Double Barrel Shotgun", "Eoka Pistol", "F1 Grenade", "Longsword", "Mp5", "Pump Shotgun", "Rock", "Salvaged Hammer", "Salvaged Icepick", "Satchel Charge", "Semi-Automatic Pistol", "Stone Hatchet", "Stone Pick Axe", "Sword", "Thompson", "Hammer", "Hatchet", "Pick Axe", "Revolver", "Rocket Launcher", "Semi-Automatic Rifle", "Waterpipe Shotgun", "Custom SMG", "Python", "LR300", "Combat Knife", "Armored Door", "Concrete Barricade", "Large Wood Box", "Reactive Target", "Sandbag Barricade", "Sleeping Bag", "Sheet Metal Door", "Water Purifier", "Wood Storage box", "Wooden Door", "Acoustic Guitar"]
; // Add more labels as needed

  // Define the base URL with placeholders for tags and pages
  const baseUrl = "https://steamcommunity.com/workshop/browse/?appid=252490&searchtext=&childpublishedfileid=0&browsesort=accepted&section=mtxitems&requiredtags%5B%5D={LABEL}&created_date_range_filter_start=0&created_date_range_filter_end=0&updated_date_range_filter_start=0&updated_date_range_filter_end=0&actualsort=accepted&p={PAGE}";

  // Create a new Google Sheet
  const spreadsheet = SpreadsheetApp.create("Steam Workshop IDs");
  const sheet = spreadsheet.getActiveSheet();

  // Loop through each label
  labels.forEach((label, index) => {
    const ids = new Set(); // Use a Set to store unique IDs
    let page = 1; // Start from page 1

    // Write the label as the header for the current column
    sheet.getRange(1, index + 1).setValue(label);

    while (true) {
      // Replace placeholders with actual label and page number
      const url = baseUrl.replace("{LABEL}", encodeURIComponent(label)).replace("{PAGE}", page);

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
        Logger.log(`Label ${label}, Page ${page}: Found ${ids.size} unique IDs so far.`);
        page++; // Increment to the next page

      } catch (error) {
        Logger.log("Error fetching data from page " + page + ": " + error.message);
        break; // Exit the loop on error
      }
    }

    // Convert Set back to an array for writing to the sheet
    const uniqueIds = Array.from(ids);

    // Write unique IDs to the sheet in the appropriate column
    if (uniqueIds.length === 0) {
      Logger.log("No IDs found for " + label);
      sheet.getRange(2, index + 1).setValue("No IDs found.");
    } else {
      uniqueIds.forEach((id, idIndex) => {
        sheet.getRange(idIndex + 2, index + 1).setValue(id); // Append each ID in a new row
      });
    }
  });

  // Get the URL of the new spreadsheet
  const sheetUrl = spreadsheet.getUrl();

  // Output the link to the Google Sheet
  Logger.log(`IDs have been written to the Google Sheet: ${sheetUrl}`);
  
  // Return the URL for further use if needed
  return sheetUrl;
}
