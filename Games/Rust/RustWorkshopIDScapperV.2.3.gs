// This Dosent Sort by Item but still Scraps them into a sheet

function scrapeRustWorkshopDetails() {
  const mainUrl = 'https://steamcommunity.com/workshop/browse/?appid=252490&browsesort=accepted&section=mtxitems&browsefilter=accepted&p=1';
  const response = UrlFetchApp.fetch(mainUrl);
  const html = response.getContentText();
  const items = [];
  
  // Use regex to find all the URLs of the workshop items
  const itemUrlRegex = /<a href="(https:\/\/steamcommunity\.com\/sharedfiles\/filedetails\/\?id=\d+)&/g;
  let match;

  // Extract URLs and gather IDs
  while ((match = itemUrlRegex.exec(html)) !== null) {
    const itemUrl = match[1]; // Full URL
    const itemId = itemUrl.match(/id=(\d+)/)[1]; // Extract ID from URL

    // Fetch the item page to get the title and image URL
    const itemPageResponse = UrlFetchApp.fetch(itemUrl);
    const itemPageHtml = itemPageResponse.getContentText();
    
    // Extract the workshop item title using regex
    const titleMatch = itemPageHtml.match(/<title>(.*?)<\/title>/);
    const workshopItemTitle = titleMatch ? titleMatch[1] : "Title not found"; // Fallback if title is not found
    
    // Extract the image link using regex
    const imageMatch = itemPageHtml.match(/<img class="workshopItemPreview" src="([^"]*?)"/);
    const imageUrl = imageMatch ? imageMatch[1].replace(/\?.*$/, '') : "Image not found"; // Clean URL to remove query parameters if necessary

    // Store ID, title, and image URL
    items.push({ id: itemId, title: workshopItemTitle, imageUrl: imageUrl });
  }
  
  Logger.log(items); // Logs the IDs, titles, and image URLs to the Google Apps Script logger
  
  // Optionally, write the IDs, titles, and image URLs to a Google Sheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.clear(); // Clear existing content
  sheet.appendRow(["ID", "Title", "Image URL"]); // Set headers
  
  items.forEach(item => {
    sheet.appendRow([item.id, item.title, item.imageUrl]); // Write each ID, title, and image URL to the sheet
  });
}
