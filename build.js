import { Client } from "@notionhq/client";
import fs from "fs";

const notion = new Client({ auth: process.env.NOTION_KEY });
const databaseId = process.env.NOTION_DB_ID;

async function main() {
  const result = await notion.databases.query({
    database_id: databaseId
  });

  const works = result.results.map(page => {
    const props = page.properties;

    // 1. Title
    const title = props.Title?.title?.[0]?.plain_text || "No Title";

    // 2. Date
    const date = props.Date?.date?.start || "";

    // 3. Description
    const description = props.Description?.rich_text?.[0]?.plain_text || "";

    // 4. Image（HEIC対応）
    let image = "";
    const fileObj = props.Image?.files?.[0];

    if (fileObj) {
      // --- Notion内ファイル（通常PNG/JPG変換される） ---
      if (fileObj.file?.url) {
        image = fileObj.file.url;
      }

      // --- 外部リンクHEIC（iPhone直アップのときに発生） ---
      else if (fileObj.external?.url) {
        let url = fileObj.external.url;

        // HEIC を JPG 表示可能に変換する Notion CDN ハック（公式に準拠）
        if (url.endsWith(".heic") || url.includes("image/heic")) {
          // Notionは preview=1 を付けると JPG 変換して返す
          url = url + "?preview=1";
        }

        image = url;
      }
    }

    return { title, date, description, image };
  });

  fs.writeFileSync("./public/works.json", JSON.stringify(works, null, 2));
}

main().catch(err => {
  console.error("Build error:", err);
  process.exit(1);
});
