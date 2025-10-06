import mysql.connector
from typing import Optional
from ..config import config
from ..core.errors import DatabaseConnectionError
from ..core.logging import get_logger

logger = get_logger(__name__)


def get_db_connection():
    """Get MySQL database connection"""
    try:
        connection = mysql.connector.connect(
            host=config.DB_HOST,
            user=config.DB_USER,
            password=config.DB_PASSWORD,
            database=config.DB_NAME,
        )
        return connection
    except mysql.connector.Error as e:
        logger.error(f"Database connection error: {e}")
        raise DatabaseConnectionError(f"Failed to connect to database: {str(e)}")


def search_blog_posts(query: str, limit: int = 5):
    """Search blog posts using basic text matching and return formatted results"""
    connection = get_db_connection()
    if not connection:
        return []

    try:
        cursor = connection.cursor(dictionary=True)

        # Search in title, content, and categories
        search_query = """
        SELECT p.post_id, p.title, p.content, p.category, p.img, p.createdTimestamp as date, u.fullname as username 
        FROM posts p 
        JOIN users u ON p.uid = u.user_id
        WHERE p.title LIKE %s OR p.content LIKE %s OR p.category LIKE %s
        ORDER BY p.createdTimestamp DESC
        LIMIT %s
        """

        search_term = f"%{query}%"
        cursor.execute(search_query, (search_term, search_term, search_term, limit))
        results = cursor.fetchall()

        formatted_results = []
        for result in results:
            formatted_results.append(
                {
                    "title": result["title"],
                    "type": "blog",
                    "url": f"/posts/{result['post_id']}",
                    "snippet": result["content"][:200] + "..."
                    if len(result["content"]) > 200
                    else result["content"],
                    "metadata": {
                        "author": result["username"],
                        "category": result["category"],
                        "date": str(result["date"]),
                        "post_id": result["post_id"],
                    },
                }
            )

        return formatted_results

    except Exception as e:
        logger.error(f"Error searching blog posts: {e}")
        return []
    finally:
        if connection:
            connection.close()


def get_blog_analytics():
    """Get blog analytics like trending posts, popular categories"""
    connection = get_db_connection()
    if not connection:
        return {}

    try:
        cursor = connection.cursor(dictionary=True)

        # Get trending posts (most liked in last 30 days)
        trending_query = """
        SELECT p.post_id, p.title, p.category, COUNT(pl.like_id) as likes
        FROM posts p
        LEFT JOIN post_likes pl ON p.post_id = pl.post_id
        WHERE p.createdTimestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY p.post_id, p.title, p.category
        ORDER BY likes DESC
        LIMIT 5
        """

        cursor.execute(trending_query)
        trending_posts = cursor.fetchall()

        # Get popular categories
        category_query = """
        SELECT category, COUNT(*) as post_count
        FROM posts 
        WHERE createdTimestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY category
        ORDER BY post_count DESC
        LIMIT 5
        """

        cursor.execute(category_query)
        popular_categories = cursor.fetchall()

        return {
            "trending_posts": trending_posts,
            "popular_categories": popular_categories,
        }

    except Exception as e:
        logger.error(f"Error getting blog analytics: {e}")
        return {}
    finally:
        if connection:
            connection.close()
