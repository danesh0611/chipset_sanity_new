import { NextRequest, NextResponse } from "next/server";
import { sanityFetch } from "@/sanity/lib/sanityFetch";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const article = await sanityFetch({
      query: `*[_type == "articles" && _id == $id][0]{
        _id,
        title,
        description,
        author,
        readTime,
        tags,
        content[] {
          ...,
          "imageUrl": asset->url,
          asset-> {
            _id,
            url
          }
        },
        mainImage {
          asset-> {
            _id,
            url
          }
        }
      }`,
      params: { id },
      revalidate: 0,
    });

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}
