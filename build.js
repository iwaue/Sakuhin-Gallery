import { Client } from "@notionhq/client";
import fs from "fs";

const notion = new Client({ auth: process.env.NOTION_KEY });
const databaseId = process.env.NOTION_DB_ID;

async function main() {
  const result = await notion.databases.query({
    database_id: databaseId
  });

  const works = result.results.map(page => {
    const p = page.properties;

    // ---- Title ----
    const title =
      p.Title?.title?.[0]?.plain_text ||
      p.Name?.title?.[0]?.plain_text || 
      "No Title";

    // ---- Date ----
    const date = p.Date?.date?.start || "";

    // ---- Description ----
    const description =
      p.Description?.rich_text?.[0]?.plain_text ||
      "";

    // ---- Image (file / external 両対応 + HEICもそのままOK) ----
    let image = "";
    if (p.Image?.files?.length > 0) {
      const fileObj = p.Image.files[0];

      if (fileObj.type === "file") {
        image = fileObj.file.url; // Notion内部ストレージ
      } else if (fileObj.type === "external") {
        image = fileObj.external.url; // 外部URL
      }
    }

    return { title, date, description, image };
  });

  fs.writeFileSync("./public/works.json", JSON.stringify(works, null, 2));
  console.log("✅ works.json updated:", works.length, "items");
}

main().catch(console.error);
