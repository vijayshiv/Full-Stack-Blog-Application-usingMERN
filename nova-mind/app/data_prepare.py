import mysql.connector
from sentence_transformers import SentenceTransformer
import chromadb
from bs4 import BeautifulSoup


def chunk_text(text, max_length=100):
    words = text.split()
    return [
        " ".join(words[i : i + max_length]) for i in range(0, len(words), max_length)
    ]


# 1. Connect to MySQL and fetch posts
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root",
    database="blogapp",
)
cursor = conn.cursor(dictionary=True)
cursor.execute("SELECT post_id, title, content, category FROM posts WHERE isDeleted=0")
posts = cursor.fetchall()

# 2. Strip HTML and chunk content
all_chunks = []
for post in posts:
    soup = BeautifulSoup(post["content"], "html.parser")
    plain_content = soup.get_text(separator=" ", strip=True)
    chunks = chunk_text(plain_content, max_length=100)  # 100 words per chunk
    for idx, chunk in enumerate(chunks):
        all_chunks.append(
            {
                "post_id": post["post_id"],
                "title": post["title"],
                "category": post["category"],
                "chunk": chunk,
                "chunk_id": f"{post['post_id']}_{idx}",
            }
        )

# 3. Generate embeddings for all chunks
model = SentenceTransformer("all-MiniLM-L6-v2")
contents = [chunk["chunk"] for chunk in all_chunks]
embeddings = model.encode(contents)

# 4. Store in ChromaDB
client = chromadb.PersistentClient(path="chroma_db")
collection = client.get_or_create_collection("blog_posts")

for chunk, embedding in zip(all_chunks, embeddings):
    collection.add(
        embeddings=[embedding.tolist()],
        metadatas=[
            {
                "id": chunk["post_id"],
                "title": chunk["title"],
                "category": chunk["category"],
                "plain_content": chunk["chunk"],  # Store the chunk text for retrieval
                "chunk_id": chunk["chunk_id"],
            }
        ],
        ids=[chunk["chunk_id"]],
    )

print("Chunked embeddings stored in ChromaDB!")
