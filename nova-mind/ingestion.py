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

    def chunk_text(self, text: str, max_words: int = 150, overlap_words: int = 30) -> List[str]:
        """
        Enhanced semantic chunking that preserves meaning and context
        """
        # First, clean and normalize the text
        text = self.clean_and_normalize_text(text)
        
        # Try semantic chunking first (by paragraphs/sections)
        semantic_chunks = self.semantic_chunk(text, max_words)
        
        if semantic_chunks:
            # Add overlapping context between chunks for better retrieval
            return self.add_overlap_to_chunks(semantic_chunks, overlap_words)
        
        # Fallback to sentence-based chunking if semantic chunking fails
        return self.sentence_based_chunk(text, max_words, overlap_words)
    
    def clean_and_normalize_text(self, text: str) -> str:
        """Clean and normalize text for better chunking"""
        import re
        
        # Remove excessive whitespace but preserve paragraph breaks
        text = re.sub(r'\n\s*\n', '\n\n', text)  # Normalize paragraph breaks
        text = re.sub(r' +', ' ', text)  # Remove multiple spaces
        text = text.strip()
        
        return text
    
    def semantic_chunk(self, text: str, max_words: int) -> List[str]:
        """
        Chunk by semantic boundaries (headers, paragraphs, lists)
        """
        import re
        
        chunks = []
        
        # Split by clear semantic boundaries (paragraph boundaries)
        # Using paragraph breaks as primary semantic separators
        paragraph_splits = re.split(r'\n\s*\n', text)
        
        current_chunk = ""
        
        for paragraph in paragraph_splits:
            paragraph = paragraph.strip()
            if not paragraph:
                continue
            
            # Check if adding this paragraph would exceed max_words
            test_chunk = f"{current_chunk}\n\n{paragraph}".strip()
            
            if len(test_chunk.split()) <= max_words:
                current_chunk = test_chunk
            else:
                # Save current chunk if it has content
                if current_chunk.strip():
                    chunks.append(current_chunk.strip())
                
                # Start new chunk with current paragraph
                # If paragraph itself is too long, split it further
                if len(paragraph.split()) > max_words:
                    sub_chunks = self.sentence_based_chunk(paragraph, max_words, 0)
                    chunks.extend(sub_chunks)
                    current_chunk = ""
                else:
                    current_chunk = paragraph
        
        # Don't forget the last chunk
        if current_chunk.strip():
            chunks.append(current_chunk.strip())
        
        return chunks
    
    def sentence_based_chunk(self, text: str, max_words: int, overlap_words: int) -> List[str]:
        """
        Fallback chunking that respects sentence boundaries
        """
        import re
        
        # Split into sentences (handles common abbreviations)
        sentence_pattern = r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\!|\?)\s+'
        sentences = re.split(sentence_pattern, text)
        
        chunks = []
        current_chunk = ""
        
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
                
            # Test if adding this sentence would exceed limit
            test_chunk = f"{current_chunk} {sentence}".strip()
            
            if len(test_chunk.split()) <= max_words:
                current_chunk = test_chunk
            else:
                # Save current chunk
                if current_chunk.strip():
                    chunks.append(current_chunk.strip())
                
                # Start new chunk with current sentence
                # If sentence is too long, split by clauses or force split
                if len(sentence.split()) > max_words:
                    # Split long sentence by clauses (comma, semicolon, etc.)
                    clause_parts = re.split(r'[,;]', sentence)
                    sub_chunk = ""
                    
                    for part in clause_parts:
                        test_sub = f"{sub_chunk}, {part}".strip(', ')
                        if len(test_sub.split()) <= max_words:
                            sub_chunk = test_sub
                        else:
                            if sub_chunk:
                                chunks.append(sub_chunk)
                            sub_chunk = part.strip()
                    
                    if sub_chunk:
                        current_chunk = sub_chunk
                else:
                    current_chunk = sentence
        
        # Add final chunk
        if current_chunk.strip():
            chunks.append(current_chunk.strip())
        
        # Add overlap if requested
        if overlap_words > 0 and len(chunks) > 1:
            return self.add_overlap_to_chunks(chunks, overlap_words)
        
        return chunks
    
    def add_overlap_to_chunks(self, chunks: List[str], overlap_words: int) -> List[str]:
        """
        Add overlapping context between chunks for better retrieval
        """
        if len(chunks) <= 1 or overlap_words <= 0:
            return chunks
        
        overlapped_chunks = []
        
        for i, chunk in enumerate(chunks):
            enhanced_chunk = chunk
            
            # Add context from previous chunk
            if i > 0:
                prev_words = chunks[i-1].split()
                if len(prev_words) > overlap_words:
                    prev_context = " ".join(prev_words[-overlap_words:])
                    enhanced_chunk = f"...{prev_context} | {enhanced_chunk}"
            
            # Add context from next chunk  
            if i < len(chunks) - 1:
                next_words = chunks[i+1].split()
                if len(next_words) > overlap_words:
                    next_context = " ".join(next_words[:overlap_words])
                    enhanced_chunk = f"{enhanced_chunk} | {next_context}..."
            
            overlapped_chunks.append(enhanced_chunk)
        
        return overlapped_chunks

    def ingest_blog_posts(self) -> int:
        """Enhanced ingestion with better chunk processing"""
        print("\n📖 Ingesting Blog Posts with Enhanced Chunking...")

        try:
            # Connect to database
            conn = mysql.connector.connect(**DB_CONFIG)
            cursor = conn.cursor(dictionary=True)

            # Fetch posts with complete metadata including author information
            cursor.execute("""
                SELECT p.post_id, p.title, p.content, p.category, p.img, 
                       p.createdTimestamp, u.fullname as author, p.likes
                FROM posts p 
                LEFT JOIN users u ON p.user_id = u.id 
                WHERE p.isDeleted=0 AND p.content IS NOT NULL AND p.content != ''
                ORDER BY p.post_id
            """)
            posts = cursor.fetchall()

            total_chunks = 0
            skipped_posts = 0

            for post_idx, post in enumerate(posts):
                print(f"Processing post {post_idx + 1}/{len(posts)}: {post['title'][:50]}...")
                
                # Enhanced HTML cleaning
                clean_content = self.enhanced_content_extraction(post["content"])
                
                if len(clean_content.strip()) < 100:  # Skip very short posts
                    print(f"⚠️ Skipping short post: {post['title']}")
                    skipped_posts += 1
                    continue

                # Create enhanced chunks with better parameters
                chunks = self.chunk_text(clean_content, max_words=120, overlap_words=20)

                # Format date for better readability
                date_str = (
                    post["createdTimestamp"].strftime("%Y-%m-%d")
                    if post["createdTimestamp"]
                    else ""
                )

                # Create enhanced content for better embeddings
                for i, chunk in enumerate(chunks):
                    if len(chunk.strip()) < 30:  # Skip very short chunks
                        continue

                    # Create context-enhanced content for embedding
                    enhanced_content = self.create_enhanced_content(
                        chunk, post["title"], post["category"], i, len(chunks)
                    )

                    # Create embedding from enhanced content
                    embedding = self.model.encode([enhanced_content])[0].tolist()

                    # Generate unique, meaningful ID
                    chunk_id = f"blog_{post['post_id']}_chunk_{i:03d}"

                    # Add to ChromaDB with enhanced metadata
                    self.collection.add(
                        embeddings=[embedding],
                        documents=[chunk],  # Store original chunk, not enhanced version
                        ids=[chunk_id],
                        metadatas=[
                            {
                                "source": "blog",
                                "title": post["title"],
                                "category": post["category"] or "General",
                                "author": post["author"] or "Unknown",
                                "date": date_str,
                                "img": post["img"] or "",
                                "post_id": str(post["post_id"]),
                                "type": "blog_post",
                                "chunk_index": i,
                                "total_chunks": len(chunks),
                                "chunk_type": self.classify_chunk_type(chunk),
                                "word_count": len(chunk.split()),
                                "likes": post.get("likes", 0),
                                "post_length": len(clean_content.split()),
                                "has_overlap": "..." in chunk,  # Indicates overlapping context
                            }
                        ],
                    )
                    total_chunks += 1

            conn.close()
            print(f"✅ Ingested {total_chunks} enhanced chunks from {len(posts) - skipped_posts} posts")
            print(f"⚠️ Skipped {skipped_posts} posts (too short or empty)")
            return total_chunks

        except Exception as e:
            print(f"❌ Blog ingestion failed: {str(e)}")
            import traceback
            traceback.print_exc()
            return 0
    
    def enhanced_content_extraction(self, html_content: str) -> str:
        """Enhanced HTML content extraction with better text processing"""
        soup = BeautifulSoup(html_content, "html.parser")
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Get text with better formatting preservation
        text = soup.get_text(separator=" ", strip=True)
        
        # Clean up common HTML artifacts
        import re
        text = re.sub(r'\s+', ' ', text)  # Normalize whitespace
        text = re.sub(r'&[a-zA-Z0-9#]+;', '', text)  # Remove HTML entities
        text = text.strip()
        
        return text
    
    def create_enhanced_content(self, chunk: str, title: str, category: str, 
                               chunk_index: int, total_chunks: int) -> str:
        """Create context-enhanced content for better embeddings"""
        # Add title and category context to improve semantic understanding
        enhanced = f"Title: {title}\nCategory: {category}\n\n{chunk}"
        
        # Add position context for multi-chunk posts
        if total_chunks > 1:
            position = "beginning" if chunk_index == 0 else ("end" if chunk_index == total_chunks - 1 else "middle")
            enhanced = f"[{position} of article] {enhanced}"
        
        return enhanced
    
    def classify_chunk_type(self, chunk: str) -> str:
        """Classify the type of content in the chunk"""
        chunk_lower = chunk.lower()
        
        if any(word in chunk_lower for word in ['introduction', 'overview', 'summary']):
            return 'introduction'
        elif any(word in chunk_lower for word in ['conclusion', 'summary', 'final', 'end']):
            return 'conclusion'  
        elif any(word in chunk_lower for word in ['step', 'first', 'second', 'then', 'next']):
            return 'instructional'
        elif chunk.count('?') > 1:
            return 'faq'
        elif len([word for word in chunk.split() if word.isupper()]) > 3:
            return 'technical'
        else:
            return 'content'

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
