"use client";

import React, { useState, useEffect } from "react";
import { Upload, X, Plus, Loader, Trash2, GripVertical, Edit2 } from "lucide-react";
import Image from "next/image";
import EditArticleForm from "./EditArticleForm";

interface ArticleImage {
  id: string;
  file: File;
  preview: string;
  caption: string;
}

interface FormData {
  title: string;
  description: string;
  author: string;
  readTime: number;
  date: string;
  tags: string[];
  images: ArticleImage[];
  mainImageId: string;
}

interface Article {
  _id: string;
  title: string;
  author: string;
  published: boolean;
  slug: string;
}

const AddArticleForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    author: "",
    readTime: 5,
    date: new Date().toISOString().split('T')[0],
    tags: [],
    images: [],
    mainImageId: "",
  });

  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  
  // Delete article states
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteSection, setShowDeleteSection] = useState(false);

  // Edit article states
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(true);

  // Fetch articles for delete section
  const fetchArticles = async () => {
    setLoadingArticles(true);
    try {
      const response = await fetch("/api/articles");
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoadingArticles(false);
    }
  };

  // Delete article handler
  const handleDeleteArticle = async (articleId: string, articleTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${articleTitle}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(articleId);
    try {
      const response = await fetch("/api/articles/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: `Article "${articleTitle}" deleted successfully!` });
        setArticles((prev) => prev.filter((a) => a._id !== articleId));
      } else {
        throw new Error("Failed to delete article");
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete article" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImage: ArticleImage = {
          id: Date.now().toString(),
          file,
          preview: event.target?.result as string,
          caption: "",
        };

        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, newImage],
          mainImageId: prev.mainImageId || newImage.id,
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    setFormData((prev) => {
      const updatedImages = prev.images.filter((img) => img.id !== id);
      return {
        ...prev,
        images: updatedImages,
        mainImageId:
          prev.mainImageId === id && updatedImages.length > 0
            ? updatedImages[0].id
            : "",
      };
    });
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    setFormData((prev) => {
      const updatedImages = [...prev.images];
      const [movedImage] = updatedImages.splice(fromIndex, 1);
      updatedImages.splice(toIndex, 0, movedImage);
      return {
        ...prev,
        images: updatedImages,
      };
    });
  };

  const updateImageCaption = (id: string, caption: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img) =>
        img.id === id ? { ...img, caption } : img
      ),
    }));
  };

  const addTag = () => {
    if (newTag.trim() && formData.tags.length < 5) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (!formData.title || !formData.description || formData.images.length === 0) {
        throw new Error("Please fill all required fields and upload at least one image");
      }

      // Create FormData for multipart upload
      const uploadFormData = new FormData();
      uploadFormData.append("title", formData.title);
      uploadFormData.append("description", formData.description);
      uploadFormData.append("author", formData.author);
      uploadFormData.append("readTime", formData.readTime.toString());
      uploadFormData.append("date", formData.date);
      uploadFormData.append("tags", JSON.stringify(formData.tags));
      uploadFormData.append("mainImageId", formData.mainImageId);

      // Add images and their captions
      formData.images.forEach((img) => {
        uploadFormData.append("images", img.file);
        uploadFormData.append(`caption_${img.id}`, img.caption);
      });

      const response = await fetch("/api/articles/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload article");
      }

      setMessage({
        type: "success",
        text: "Article uploaded successfully! Check Sanity Studio to publish it.",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        author: "",
        readTime: 5,
        date: new Date().toISOString().split('T')[0],
        tags: [],
        images: [],
        mainImageId: "",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Add New Article</h1>
          <p className="text-gray-600">Create an image-based tech article</p>
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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Basic Information</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Article Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter article title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description (max 200 chars)"
                maxLength={200}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/200
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Author *
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                placeholder="Author name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Read Time (minutes)
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Publish Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    date: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Tags</h2>
            <div className="flex gap-2 mb-4">
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
                Add
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

          {/* Image Upload */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Article Images *</h2>

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
                  Click to upload images
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB each
                </p>
              </label>
            </div>

            {/* Images Grid */}
            {formData.images.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Uploaded Images ({formData.images.length})
                </h3>
                <p className="text-sm text-gray-500 mb-4">Drag images to rearrange order</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.images.map((img, index) => (
                    <div
                      key={img.id}
                      draggable
                      onDragStart={() => setDraggedItem(img.id)}
                      onDragOver={(e) => e.preventDefault()}
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
                          ? "opacity-50 border-blue-400"
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
                            Main Image
                          </div>
                        )}
                      </div>

                      {/* Caption & Actions */}
                      <div className="p-4 space-y-3">
                        <textarea
                          value={img.caption}
                          onChange={(e) =>
                            updateImageCaption(img.id, e.target.value)
                          }
                          placeholder="Image caption/description"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                mainImageId: img.id,
                              })
                            }
                            className={`flex-1 px-3 py-2 rounded text-sm font-semibold transition ${
                              formData.mainImageId === img.id
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {formData.mainImageId === img.id
                              ? "Main Image"
                              : "Set as Main"}
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

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || formData.images.length === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Create Article
                </>
              )}
            </button>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-4 text-sm text-gray-700">
            <p className="font-semibold mb-2">ℹ️ Note:</p>
            <p>
              Your article will be created as a draft in Sanity Studio. Visit your Sanity
              dashboard to review and publish it.
            </p>
          </div>
        </form>

        {/* Delete Articles Section */}
        <div className="mt-12 bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Manage Articles</h2>
            <button
              type="button"
              onClick={() => {
                setShowDeleteSection(!showDeleteSection);
                if (!showDeleteSection && articles.length === 0) {
                  fetchArticles();
                }
              }}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold transition flex items-center gap-2"
            >
              <Trash2 size={18} />
              {showDeleteSection ? "Hide" : "Delete Articles"}
            </button>
          </div>

          {showDeleteSection && (
            <div className="mt-4">
              {loadingArticles ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="animate-spin text-gray-400" size={32} />
                  <span className="ml-2 text-gray-500">Loading articles...</span>
                </div>
              ) : articles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No articles found
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 mb-4">
                    Click the delete button to remove an article. This action cannot be undone.
                  </p>
                  {articles.map((article) => (
                    <div
                      key={article._id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-800">{article.title}</h3>
                        <p className="text-sm text-gray-500">
                          by {article.author} • {article.published ? "Published" : "Draft"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingArticleId(article._id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center gap-2"
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteArticle(article._id, article.title)}
                          disabled={deletingId === article._id}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-semibold transition flex items-center gap-2"
                        >
                          {deletingId === article._id ? (
                            <>
                              <Loader size={16} className="animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 size={16} />
                              Delete
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Edit Article Modal */}
        {editingArticleId && (
          <div className="mt-12">
            <EditArticleForm
              articleId={editingArticleId}
              onBack={() => {
                setEditingArticleId(null);
                fetchArticles();
              }}
              onSuccess={() => {
                setEditingArticleId(null);
                fetchArticles();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AddArticleForm;
