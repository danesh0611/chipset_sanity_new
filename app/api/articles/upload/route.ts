import { sanityFetch } from "@/sanity/lib/sanityFetch";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "next-sanity";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN!,
});

// Rate limiting constants
const MAX_CONCURRENT_UPLOADS = 3; // Conservative limit to stay well under Sanity's 25 limit
const RETRY_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Exponential backoff retry logic
async function uploadWithRetry(
  image: File,
  attempt: number = 1
): Promise<any> {
  try {
    const imageAsset = await client.assets.upload("image", image, {
      filename: image.name,
    });
    return imageAsset;
  } catch (error: any) {
    // Check if it's a rate limit error (429)
    if (error?.statusCode === 429 && attempt < RETRY_ATTEMPTS) {
      const retryAfter = error?.response?.headers?.["retry-after"];
      const delayMs =
        (parseInt(retryAfter) || INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1)) *
        1000;

      console.log(
        `Rate limited. Retrying ${image.name} after ${delayMs}ms (attempt ${attempt}/${RETRY_ATTEMPTS})`
      );

      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return uploadWithRetry(image, attempt + 1);
    }

    throw error;
  }
}

// Queue-based upload with concurrency control
async function uploadImagesWithThrottling(images: File[]): Promise<any[]> {
  const results: any[] = [];
  let activeUploads = 0;
  let currentIndex = 0;

  return new Promise((resolve, reject) => {
    function startNextUpload() {
      if (currentIndex >= images.length && activeUploads === 0) {
        resolve(results);
        return;
      }

      while (activeUploads < MAX_CONCURRENT_UPLOADS && currentIndex < images.length) {
        const imageIndex = currentIndex++;
        const image = images[imageIndex];

        activeUploads++;

        uploadWithRetry(image)
          .then((imageAsset) => {
            results[imageIndex] = imageAsset;
            activeUploads--;
            startNextUpload();
          })
          .catch((error) => {
            activeUploads--;
            reject(error);
          });
      }
    }

    startNextUpload();
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const author = formData.get("author") as string;
    const readTime = parseInt(formData.get("readTime") as string);
    const date = formData.get("date") as string;
    const tags = JSON.parse(formData.get("tags") as string);
    const mainImageId = formData.get("mainImageId") as string;

    // Get all images from formData
    const images = formData.getAll("images") as File[];

    // Upload images to Sanity with throttling and retry logic
    const uploadedImages = await uploadImagesWithThrottling(images);

    // Find main image
    const mainImage =
      uploadedImages.find((img) => img._id.includes(mainImageId)) ||
      uploadedImages[0];

    // Create content array with images
    const contentArray = uploadedImages.map((img, index) => ({
      _type: "image",
      _key: `content-${index}`,
      asset: {
        _type: "reference",
        _ref: img._id,
      },
      alt: title,
    }));

    // Create article document
    const article = await client.create({
      _type: "articles",
      title,
      slug: {
        _type: "slug",
        current: title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, ""),
      },
      description,
      author,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      readTime,
      mainImage: {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: mainImage._id,
        },
        alt: title,
      },
      content: contentArray,
      tags,
      published: false, // Default to unpublished, user can publish in Sanity Studio
    });

    return NextResponse.json(
      {
        success: true,
        articleId: article._id,
        message: "Article created successfully! Check Sanity Studio to publish.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading article:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}
