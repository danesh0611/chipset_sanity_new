import { NextRequest, NextResponse } from "next/server";
import { createClient } from "next-sanity";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN!,
});

const MAX_CONCURRENT_UPLOADS = 3;
const RETRY_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY = 1000;

async function uploadWithRetry(image: File, attempt: number = 1): Promise<any> {
  try {
    const imageAsset = await client.assets.upload("image", image, {
      filename: image.name,
    });
    return imageAsset;
  } catch (error: any) {
    if (error?.statusCode === 429 && attempt < RETRY_ATTEMPTS) {
      const retryAfter = error?.response?.headers?.["retry-after"];
      const delayMs =
        (parseInt(retryAfter) || INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1)) *
        1000;

      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return uploadWithRetry(image, attempt + 1);
    }

    throw error;
  }
}

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

export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const articleId = formData.get("articleId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const author = formData.get("author") as string;
    const readTime = parseInt(formData.get("readTime") as string) || 5;
    const tags = JSON.parse((formData.get("tags") as string) || "[]");
    const imageOrder = JSON.parse((formData.get("imageOrder") as string) || "[]");

    // Get all files from FormData
    const files = formData.getAll("images") as File[];

    // Upload new images
    let uploadedImages: any[] = [];
    if (files.length > 0) {
      uploadedImages = await uploadImagesWithThrottling(files);
    }

    // Fetch current article
    const currentArticle = await client.fetch(
      `*[_type == "articles" && _id == $id][0]`,
      { id: articleId }
    );

    if (!currentArticle) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    // Build content array - all images in order
    const content: any[] = [];
    let uploadedIndex = 0;

    imageOrder.forEach((imgId: string) => {
      const caption = formData.get(`caption_${imgId}`) as string || "";

      if (imgId.startsWith("new_")) {
        // New uploaded image
        if (uploadedImages[uploadedIndex]) {
          content.push({
            _type: "image",
            asset: {
              _type: "reference",
              _ref: uploadedImages[uploadedIndex]._id,
            },
            caption,
          });
          uploadedIndex++;
        }
      } else {
        // Existing image - keep it with caption
        const existingImage = currentArticle.content?.find(
          (block: any) => block._type === "image"
        );
        if (existingImage) {
          content.push({
            ...existingImage,
            caption,
          });
        }
      }
    });

    // Update article
    const updatedArticle = await client
      .patch(articleId)
      .set({
        title,
        description,
        author,
        readTime,
        tags,
        content,
      })
      .commit();

    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error("Error updating article:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update article" },
      { status: 500 }
    );
  }
}
