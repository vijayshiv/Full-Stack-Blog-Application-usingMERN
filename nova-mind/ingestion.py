#!/usr/bin/env python3
"""
Blog-Only Nova-Mind Data Ingestion System
Simplified script for ingesting only blog posts into ChromaDB
"""

import logging
import mysql.connector
from bs4 import BeautifulSoup
from sentence_transformers import SentenceTransformer
import chromadb
from typing import Dict, List, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
CHROMA_DB_PATH = "./chroma_db"
MODEL_NAME = "all-MiniLM-L6-v2"
COLLECTION_NAME = "knowledge_base"  # Updated to match your existing collection name

# Database configuration (you can modify these)
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "root",
    "database": "blogapp",
}


class BlogIngestion:
    """Blog-only ingestion system for Nova-Mind RAG"""

    def __init__(self):
        """Initialize the ingestion system"""
        print("🚀 Initializing Blog-Only Ingestion System...")

        # Initialize embedding model
        self.model = SentenceTransformer(MODEL_NAME)

        # Initialize ChromaDB
        self.client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
        self.collection = self.client.get_or_create_collection(name=COLLECTION_NAME)

        print("✅ Initialization complete!")

    def chunk_text(self, text: str, max_words: int = 100) -> List[str]:
        """Split text into chunks"""
        words = text.split()
        return [
            " ".join(words[i : i + max_words]) for i in range(0, len(words), max_words)
        ]

    def ingest_blog_posts(self) -> int:
        """Ingest blog posts from MySQL database"""
        print("\n📖 Ingesting Blog Posts...")

        try:
            # Connect to database
            conn = mysql.connector.connect(**DB_CONFIG)
            cursor = conn.cursor(dictionary=True)

            # Fetch posts
            cursor.execute(
                "SELECT post_id, title, content, category FROM posts WHERE isDeleted=0"
            )
            posts = cursor.fetchall()

            total_chunks = 0

            for post in posts:
                # Clean HTML content
                soup = BeautifulSoup(post["content"], "html.parser")
                clean_content = soup.get_text(separator=" ", strip=True)

                # Create chunks
                chunks = self.chunk_text(clean_content)

                for i, chunk in enumerate(chunks):
                    if len(chunk.strip()) < 50:  # Skip very short chunks
                        continue

                    # Create embedding
                    embedding = self.model.encode([chunk])[0].tolist()

                    # Add to ChromaDB
                    self.collection.add(
                        embeddings=[embedding],
                        documents=[chunk],
                        ids=[f"blog_{post['post_id']}_{i}"],
                        metadatas=[
                            {
                                "source": "blog",
                                "title": post["title"],
                                "category": post["category"],
                                "post_id": post["post_id"],
                                "type": "blog_post",
                                "chunk_index": i,
                                "total_chunks": len(chunks),
                            }
                        ],
                    )
                    total_chunks += 1

            conn.close()
            print(
                f"✅ Ingested {total_chunks} blog post chunks from {len(posts)} posts"
            )
            return total_chunks

        except Exception as e:
            print(f"❌ Blog ingestion failed: {str(e)}")
            return 0

    def clear_existing_data(self):
        """Clear all existing data in the collection"""
        try:
            # Get all IDs
            all_data = self.collection.get()
            if all_data["ids"]:
                self.collection.delete(ids=all_data["ids"])
                print(f"🗑️ Cleared {len(all_data['ids'])} existing documents")
            else:
                print("📝 Collection is already empty")
        except Exception as e:
            print(f"⚠️ Could not clear existing data: {str(e)}")

    def get_stats(self) -> Dict[str, Any]:
        """Get collection statistics"""
        try:
            count = self.collection.count()

            # Get sample to check sources
            sample = self.collection.get(limit=min(100, count))
            sources = {}
            categories = {}

            for metadata in sample["metadatas"]:
                source = metadata.get("source", "unknown")
                category = metadata.get("category", "unknown")

                sources[source] = sources.get(source, 0) + 1
                categories[category] = categories.get(category, 0) + 1

            return {
                "total_documents": count,
                "sources": sources,
                "categories": categories,
            }
        except Exception as e:
            print(f"⚠️ Could not retrieve stats: {str(e)}")
            return {"total_documents": 0, "sources": {}, "categories": {}}

    def run_blog_ingestion(self, clear_first: bool = True) -> bool:
        """Run blog-only ingestion"""
        print("🚀 Starting Blog Data Ingestion")
        print("=" * 50)

        if clear_first:
            self.clear_existing_data()

        # Ingest blog posts
        try:
            blog_count = self.ingest_blog_posts()

            if blog_count == 0:
                print("⚠️ No blog posts were ingested!")
                return False

        except Exception as e:
            print(f"❌ Blog ingestion failed: {str(e)}")
            return False

        # Summary
        print("\n" + "=" * 50)
        print("📊 INGESTION SUMMARY")
        print("=" * 50)
        print(f"✅ Total chunks ingested: {blog_count}")

        # Final stats
        stats = self.get_stats()
        print("\n📈 Knowledge Base Statistics:")
        print(f"   Total documents: {stats['total_documents']}")

        if stats["categories"]:
            print("   Categories found:")
            for category, count in stats["categories"].items():
                print(f"     - {category}: {count} chunks")

        print("🎉 Blog ingestion completed successfully!")
        return True


def main():
    """Main function"""
    try:
        print("🤖 Nova Mind - Blog Knowledge Base Ingestion")
        print("=" * 50)

        ingester = BlogIngestion()
        success = ingester.run_blog_ingestion(clear_first=True)

        if success:
            print("\n✨ Knowledge base is ready for use!")
        else:
            print("\n❌ Ingestion failed!")

        exit(0 if success else 1)

    except Exception as e:
        print(f"❌ Critical error: {str(e)}")
        import traceback

        traceback.print_exc()
        exit(1)


if __name__ == "__main__":
    main()
