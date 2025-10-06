import chromadb
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Tuple
from ..core.errors import ChromaDBError
from ..core.logging import get_logger

logger = get_logger(__name__)


class ChromaService:
    """Service for ChromaDB vector database operations"""

    def __init__(self, persist_path: str = "chroma_db"):
        try:
            self.client = chromadb.PersistentClient(path=persist_path)
            self.collection = self.client.get_or_create_collection("knowledge_base")
            self.embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("ChromaDB service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB: {e}")
            raise ChromaDBError(f"ChromaDB initialization failed: {str(e)}")

    def search_similar_content(
        self, query: str, top_k: int = 5, distance_threshold: float = 1.5
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Search for similar content using semantic search

        Returns:
            Tuple of (relevant_content, sources)
        """
        try:
            # Generate embedding for the query
            query_embedding = self.embedding_model.encode([query])[0]

            # Search in ChromaDB
            results = self.collection.query(
                query_embeddings=[query_embedding.tolist()],
                n_results=top_k * 2,  # Get more results to filter better ones
                include=["metadatas", "documents", "distances"],
            )

            relevant_content = []
            sources = []

            # Filter and collect relevant content
            for i, (document, metadata, distance) in enumerate(
                zip(
                    results["documents"][0],
                    results["metadatas"][0],
                    results["distances"][0],
                )
            ):
                if distance < distance_threshold:
                    title = metadata.get("title", "Untitled")
                    post_id = metadata.get("post_id", "")

                    relevant_content.append(
                        {
                            "title": title,
                            "content": document,
                            "distance": distance,
                            "metadata": metadata,
                        }
                    )

                    sources.append(
                        {
                            "title": title,
                            "type": "blog",
                            "url": f"/posts/{post_id}" if post_id else "/",
                            "snippet": document[:200] + "..."
                            if len(document) > 200
                            else document,
                        }
                    )

            return relevant_content[:top_k], sources[:top_k]

        except Exception as e:
            logger.error(f"ChromaDB search error: {e}")
            raise ChromaDBError(f"Search operation failed: {str(e)}")

    def add_document(self, document: str, metadata: Dict[str, Any], doc_id: str = None):
        """Add a document to the ChromaDB collection"""
        try:
            embedding = self.embedding_model.encode([document])[0]

            self.collection.add(
                embeddings=[embedding.tolist()],
                documents=[document],
                metadatas=[metadata],
                ids=[doc_id or f"doc_{len(self.collection.get())}"],
            )

            logger.info(f"Document added to ChromaDB: {doc_id}")

        except Exception as e:
            logger.error(f"Failed to add document to ChromaDB: {e}")
            raise ChromaDBError(f"Document addition failed: {str(e)}")

    def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about the ChromaDB collection"""
        try:
            collection_data = self.collection.get()
            return {
                "total_documents": len(collection_data["documents"]),
                "collection_name": self.collection.name,
            }
        except Exception as e:
            logger.error(f"Failed to get collection stats: {e}")
            return {"total_documents": 0, "collection_name": "unknown"}


# Global instance
chroma_service = ChromaService()
