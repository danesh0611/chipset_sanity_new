"use client";

import React, { useState, useEffect } from "react";
import { Upload, X, Plus, Loader, Trash2, GripVertical, ArrowLeft } from "lucide-react";

interface ArticleImage {
  id: string;
  file?: File;
  preview: string;
  caption: string;
}

interface EditFormData {
  _id: string;
  title: string;
  description: string;
  author: string;
  readTime: number;
  tags: string[];
  images: ArticleImage[];
  mainImageId: string;
}

interface EditArticleFormProps {
  articleId: string;
  onBack: () => void;
  onSuccess: () => void;
}

const EditArticleForm: React.FC<EditArticleFormProps> = ({ articleId, onBack, onSuccess }) => {
  const [formData, setFormData] = useState<EditFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const [newTag, setNewTag] = useState("");
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const scrollIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const imagesContainerRef = React.useRef<HTMLDivElement>(null);

  // Fetch article data
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/articles/${articleId}`);
        if (!response.ok) throw new Error("Failed to fetch article");
        
        const article = await response.json();
        
        // Extract images from content
        const images: ArticleImage[] = [];
        if (article.content) {
          article.content.forEach((block: any, index: number) => {
            if (block._type === "image") {
              images.push({
                id: `img_${index}`,
                preview: block.asset?.url || "",
                caption: block.caption || "",
              });
            }
          });
        }

        setFormData({
          _id: article._id,
          title: article.title || "",
          description: article.description || "",
          author: article.author || "",
          readTime: article.readTime || 5,
          tags: article.tags || [],
          images,
          mainImageId: images[0]?.id || "",
        });
      } catch (error) {
        setMessage({ type: "error", text: "Failed to load article" });
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (!formData) return;
    const updatedImages = [...formData.images];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);
    setFormData({ ...formData, images: updatedImages });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggedItem) return;

      const scrollThreshold = 150;
      const scrollAmount = 20;

      // Check if mouse is near top of viewport
      if (e.clientY < scrollThreshold) {
        window.scrollBy(0, -scrollAmount);
      }
      // Check if mouse is near bottom of viewport
      else if (window.innerHeight - e.clientY < scrollThreshold) {
        window.scrollBy(0, scrollAmount);
      }
    };

    if (draggedItem) {
      document.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [draggedItem]);

  const removeImage = (id: string) => {
    if (!formData) return;
    const updatedImages = formData.images.filter((img) => img.id !== id);
    setFormData({
      ...formData,
      images: updatedImages,
      mainImageId:
        formData.mainImageId === id && updatedImages.length > 0
          ? updatedImages[0].id
          : "",
    });
  };

  const addTag = () => {
    if (!formData) return;
    if (newTag.trim() && formData.tags.length < 5) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const removeTag = (index: number) => {
    if (!formData) return;
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index),
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImage: ArticleImage = {
          id: `new_${Date.now()}_${Math.random()}`,
          file,
          preview: event.target?.result as string,
          caption: "",
        };

        setFormData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            images: [...prev.images, newImage],
            mainImageId: prev.mainImageId || newImage.id,
          };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setSaving(true);
    setMessage(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("articleId", formData._id);
      uploadFormData.append("title", formData.title);
      uploadFormData.append("description", formData.description);
      uploadFormData.append("author", formData.author);
      uploadFormData.append("readTime", formData.readTime.toString());
      uploadFormData.append("tags", JSON.stringify(formData.tags));
      uploadFormData.append("mainImageId", formData.mainImageId);
      uploadFormData.append("imageOrder", JSON.stringify(formData.images.map((img) => img.id)));

      // Add new images
      formData.images.forEach((img) => {
        if (img.file) {
          uploadFormData.append("images", img.file);
          uploadFormData.append(`caption_${img.id}`, img.caption);
        }
      });

      const response = await fetch("/api/articles/edit", {
        method: "PUT",
        body: uploadFormData,
      });

      if (!response.ok) throw new Error("Failed to update article");

      setMessage({ type: "success", text: "Article updated successfully!" });
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update article",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin text-blue-600 mr-2" size={32} />
        <span className="text-gray-600">Loading article...</span>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        Failed to load article
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Edit Article</h2>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Article Details</h3>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              maxLength={200}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/200
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Author
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Read Time (min)
              </label>
              <input
                type="number"
                value={formData.readTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    readTime: parseInt(e.target.value) || 5,
                  })
                }
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Tags</h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTag()}
              placeholder="Add a tag (max 5)"
              disabled={formData.tags.length >= 5}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <button
              type="button"
              onClick={addTag}
              disabled={formData.tags.length >= 5}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition flex items-center gap-2"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, idx) => (
              <span
                key={idx}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(idx)}
                  className="text-blue-800 hover:text-blue-900"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Images */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Images</h3>

          {/* Upload Area */}
          <div className="mb-6 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="mx-auto mb-3 text-gray-400" size={32} />
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Click to add more images
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 10MB each
              </p>
            </label>
          </div>

          {/* Images Grid */}
          {formData.images.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-3">
                Drag images to rearrange • {formData.images.length} image(s)
              </p>
              <div 
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                ref={imagesContainerRef}
              >
                {formData.images.map((img, index) => (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={(e) => {
                      setDraggedItem(img.id);
                      // Create a custom drag image
                      const dragImage = new Image();
                      dragImage.src = img.preview;
                      e.dataTransfer.setDragImage(dragImage, 50, 50);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={() => {
                      const draggedIndex = formData.images.findIndex(
                        (i) => i.id === draggedItem
                      );
                      if (draggedIndex !== -1 && draggedIndex !== index) {
                        moveImage(draggedIndex, index);
                      }
                      setDraggedItem(null);
                    }}
                    onDragEnd={() => setDraggedItem(null)}
                    className={`border-2 rounded-lg overflow-hidden transition cursor-move ${
                      draggedItem === img.id
                        ? "border-blue-400 shadow-2xl bg-white z-50 relative"
                        : formData.mainImageId === img.id
                        ? "border-blue-600 shadow-lg"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {/* Image Preview */}
                    <div className="relative w-full h-40 bg-gray-100">
                      <div className="absolute top-2 left-2 bg-gray-800 bg-opacity-70 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                        <GripVertical size={14} />
                        #{index + 1}
                      </div>
                      <img
                        src={img.preview}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                      {formData.mainImageId === img.id && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Main
                        </div>
                      )}
                    </div>

                    {/* Caption & Actions */}
                    <div className="p-4 space-y-3">
                      <textarea
                        defaultValue={img.caption}
                        onChange={(e) => {
                          const updatedImages = formData.images.map((i) =>
                            i.id === img.id ? { ...i, caption: e.target.value } : i
                          );
                          setFormData({ ...formData, images: updatedImages });
                        }}
                        placeholder="Image caption"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, mainImageId: img.id })
                          }
                          className={`flex-1 px-3 py-2 rounded text-sm font-semibold transition ${
                            formData.mainImageId === img.id
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {formData.mainImageId === img.id ? "Main" : "Set Main"}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(img.id)}
                          className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm font-semibold transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader size={20} className="animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditArticleForm;
