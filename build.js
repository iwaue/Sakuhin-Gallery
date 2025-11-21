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

    // 安全に Title を取得
    const title =
      props.Title?.title?.[0]?.plain_text || "No Title";

    // 安全に Date を取得
    const date =
      props.Date?.date?.start || "";

    // 安全に Description を取得
    const description =
      props.Description?.rich_text?.[0]?.plain_text || "";

    // Notion image プロパティの file/external 両対応
    let image = "";
    const fileObj = props.Image?.files?.[0];
    if (fileObj) {
      if (fileObj.file?.url) {
        image = fileObj.file.url;
      } else if (fileObj.external?.url) {
        image = fileObj.external.url;
      }
    }

    return { title, date, description, image };
  });

  // public ディレクトリへ JSON を出力
  fs.writeFileSync("./public/works.json", JSON.stringify(works, null, 2));
}

main().catch(err => {
  console.error("Build error:", err);
  process.exit(1);
});
