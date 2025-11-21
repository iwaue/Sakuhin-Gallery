import { Client } from "@notionhq/client";
import fs from "fs";

const notion = new Client({ auth: process.env.NOTION_KEY });
const databaseId = process.env.NOTION_DB_ID;

async function main() {
  const result = await notion.databases.query({
    database_id: databaseId
  });

  const works = result.results.map(page => {
    return {
      title: page.properties.Title.title[0]?.plain_text || "No Title",
      date: page.properties.Date.date?.start || "",
      description: page.properties.Description.rich_text[0]?.plain_text || "",
      image: page.properties.Image.files[0]?.file?.url || ""
    };
  });

  fs.writeFileSync("./public/works.json", JSON.stringify(works, null, 2));
}

main();
