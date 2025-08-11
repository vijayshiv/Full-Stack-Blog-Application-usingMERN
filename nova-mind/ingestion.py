#!/usr/bin/env python3
"""
Simplified Nova-Mind Data Ingestion System
All-in-one script for ingesting data from multiple sources into ChromaDB
"""

import logging
import mysql.connector
import requests
import wikipediaapi as wikipedia
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
COLLECTION_NAME = "nova_knowledge_base"

# Database configuration (you can modify these)
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "root",
    "database": "blogapp",
}


class NovaIngestion:
    """Simplified ingestion system for Nova-Mind RAG"""

    def __init__(self):
        """Initialize the ingestion system"""
        print("🚀 Initializing Nova-Mind Ingestion System...")

        # Initialize embedding model
        self.model = SentenceTransformer(MODEL_NAME)

        # Initialize ChromaDB
        self.client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
        self.collection = self.client.get_or_create_collection(name=COLLECTION_NAME)

        # Initialize Wikipedia API
        self.wiki = wikipedia.Wikipedia(
            language="en", user_agent="NovaRAG/1.0 (https://example.com/contact)"
        )

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
                                "type": "blog_post",
                            }
                        ],
                    )
                    total_chunks += 1

            conn.close()
            print(f"✅ Ingested {total_chunks} blog post chunks")
            return total_chunks

        except Exception as e:
            print(f"❌ Blog ingestion failed: {str(e)}")
            return 0

    def ingest_wikipedia(self, topics: List[str], max_articles: int = 2) -> int:
        """Ingest Wikipedia articles"""
        print(f"\n🌐 Ingesting Wikipedia articles for {len(topics)} topics...")

        total_chunks = 0

        for topic in topics:
            try:
                # Get Wikipedia page
                page = self.wiki.page(topic)
                if not page.exists():
                    print(f"⚠️ Wikipedia page not found: {topic}")
                    continue

                # Create chunks
                chunks = self.chunk_text(page.text)

                for i, chunk in enumerate(chunks):
                    if len(chunk.strip()) < 50:
                        continue

                    # Create embedding
                    embedding = self.model.encode([chunk])[0].tolist()

                    # Add to ChromaDB
                    self.collection.add(
                        embeddings=[embedding],
                        documents=[chunk],
                        ids=[f"wiki_{topic.replace(' ', '_')}_{i}"],
                        metadatas=[
                            {
                                "source": "wikipedia",
                                "title": page.title,
                                "topic": topic,
                                "type": "encyclopedia",
                            }
                        ],
                    )
                    total_chunks += 1

                print(f"   ✅ {page.title}: {len(chunks)} chunks")

            except Exception as e:
                print(f"   ❌ Failed to ingest {topic}: {str(e)}")
                continue

        print(f"✅ Ingested {total_chunks} Wikipedia chunks")
        return total_chunks

    def ingest_stackoverflow(self, tags: List[str], max_questions: int = 20) -> int:
        """Ingest Stack Overflow questions"""
        print(f"\n💬 Ingesting Stack Overflow Q&A for {len(tags)} tags...")

        total_chunks = 0

        for tag in tags:
            try:
                # Fetch questions from Stack Exchange API
                url = "https://api.stackexchange.com/2.3/questions"
                params = {
                    "order": "desc",
                    "sort": "votes",
                    "tagged": tag,
                    "site": "stackoverflow",
                    "pagesize": max_questions,
                    "filter": "withbody",
                }

                response = requests.get(url, params=params)
                response.raise_for_status()
                data = response.json()

                for question in data.get("items", []):
                    # Clean HTML content
                    soup = BeautifulSoup(question.get("body", ""), "html.parser")
                    clean_body = soup.get_text(separator=" ", strip=True)

                    # Combine title and body
                    full_text = f"Q: {question['title']}\n\n{clean_body}"

                    # Create chunks
                    chunks = self.chunk_text(full_text)

                    for i, chunk in enumerate(chunks):
                        if len(chunk.strip()) < 50:
                            continue

                        # Create embedding
                        embedding = self.model.encode([chunk])[0].tolist()

                        # Add to ChromaDB
                        self.collection.add(
                            embeddings=[embedding],
                            documents=[chunk],
                            ids=[f"so_{question['question_id']}_{i}"],
                            metadatas=[
                                {
                                    "source": "stackoverflow",
                                    "title": question["title"],
                                    "tags": tag,
                                    "score": question.get("score", 0),
                                    "type": "qa",
                                }
                            ],
                        )
                        total_chunks += 1

                print(f"   ✅ {tag}: {len(data.get('items', []))} questions")

            except Exception as e:
                print(f"   ❌ Failed to ingest {tag}: {str(e)}")
                continue

        print(f"✅ Ingested {total_chunks} Stack Overflow chunks")
        return total_chunks

    def get_stats(self) -> Dict[str, Any]:
        """Get collection statistics"""
        try:
            count = self.collection.count()

            # Get sample to check sources
            sample = self.collection.get(limit=min(100, count))
            sources = {}

            for metadata in sample["metadatas"]:
                source = metadata.get("source", "unknown")
                sources[source] = sources.get(source, 0) + 1

            return {"total_documents": count, "sources": sources}
        except Exception as e:
            print(f"⚠️ Could not retrieve stats: {str(e)}")
            return {"total_documents": 0, "sources": {}}

    def run_full_ingestion(self) -> bool:
        """Run complete ingestion from all sources"""
        print("🚀 Starting Complete Data Ingestion")
        print("=" * 60)

        total_ingested = 0
        failed_sources = []

        # 1. Blog Posts
        try:
            blog_count = self.ingest_blog_posts()
            total_ingested += blog_count
        except Exception as e:
            failed_sources.append(f"Blog Posts: {str(e)}")

        # 2. Wikipedia
        try:
            wiki_topics = [
                "Python programming language",
                "JavaScript",
                "Web development",
                "Machine learning",
                "Artificial intelligence",
                "React (JavaScript library)",
                "Node.js",
                "Database",
                "API",
                "Software engineering",
            ]
            wiki_count = self.ingest_wikipedia(wiki_topics)
            total_ingested += wiki_count
        except Exception as e:
            failed_sources.append(f"Wikipedia: {str(e)}")

        # 3. Stack Overflow
        try:
            so_tags = [
                "python",
                "javascript",
                "react",
                "nodejs",
                "web-development",
                "api",
                "database",
            ]
            so_count = self.ingest_stackoverflow(so_tags)
            total_ingested += so_count
        except Exception as e:
            failed_sources.append(f"Stack Overflow: {str(e)}")

        # Summary
        print("\n" + "=" * 60)
        print("📊 INGESTION SUMMARY")
        print("=" * 60)
        print(f"✅ Total chunks ingested: {total_ingested}")

        if failed_sources:
            print(f"❌ Failed sources ({len(failed_sources)}):")
            for source in failed_sources:
                print(f"   • {source}")
        else:
            print("🎉 All sources completed successfully!")

        # Final stats
        stats = self.get_stats()
        print("\n📈 Knowledge Base Statistics:")
        print(f"   Total documents: {stats['total_documents']}")
        for source, count in stats["sources"].items():
            print(f"   {source}: {count} documents")

        return len(failed_sources) == 0


def main():
    """Main function"""
    try:
        ingester = NovaIngestion()
        success = ingester.run_full_ingestion()
        exit(0 if success else 1)

    except Exception as e:
        print(f"❌ Critical error: {str(e)}")
        exit(1)


if __name__ == "__main__":
    main()
