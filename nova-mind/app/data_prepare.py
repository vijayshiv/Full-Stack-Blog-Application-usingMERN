import mysql.connector
from sentence_transformers import SentenceTransformer
import chromadb
from bs4 import BeautifulSoup

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

# 2. Strip HTML from content
for post in posts:
    soup = BeautifulSoup(post["content"], "html.parser")
    post["plain_content"] = soup.get_text(separator=" ", strip=True)

# 3. Generate embeddings
model = SentenceTransformer("all-MiniLM-L6-v2")
contents = [post["plain_content"] for post in posts]
embeddings = model.encode(contents)

# 4. Store in ChromaDB
client = chromadb.PersistentClient(path="chroma_db")
collection = client.get_or_create_collection("blog_posts")

for post, embedding in zip(posts, embeddings):
    collection.add(
        embeddings=[embedding.tolist()],
        metadatas=[
            {
                "id": post["post_id"],
                "title": post["title"],
                "category": post["category"],
            }
        ],
        ids=[str(post["post_id"])],
    )

print("Embeddings stored in ChromaDB!")
