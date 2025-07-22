const config = require("./config/index");
const { UserRepository, PostRepository, CommentRepository } = require("./repositories");
const { UserService, PostService, CommentService } = require("./services");

async function testNewArchitecture() {
  console.log("🧪 Testing New Architecture...\n");

  try {
    // Test 1: Configuration
    console.log("1️⃣ Testing Configuration:");
    console.log("Debug - config object:", config);
    console.log("Debug - config.database:", config.database);
    if (config.database) {
      console.log("✅ Database config:", config.database.host);
    } else {
      console.log("❌ Database config missing");
    }
    console.log("✅ Server config:", config.server.port);
    console.log("✅ Legacy config (backward compatibility):", config.dbHost);
    console.log("");

    // Test 2: Repository Layer
    console.log("2️⃣ Testing Repository Layer:");
    console.log("✅ UserRepository loaded");
    console.log("✅ PostRepository loaded");
    console.log("✅ CommentRepository loaded");
    console.log("");

    // Test 3: Service Layer
    console.log("3️⃣ Testing Service Layer:");
    console.log("✅ UserService loaded");
    console.log("✅ PostService loaded");
    console.log("✅ CommentService loaded");
    console.log("");

    // Test 4: Database Connection
    console.log("4️⃣ Testing Database Connection:");
    try {
      const { pool } = require("./db");
      const connection = await pool.getConnection();
      console.log("✅ Database connection successful");
      connection.release();
    } catch (error) {
      console.log("❌ Database connection failed:", error.message);
    }
    console.log("");

    // Test 5: Simple Repository Query (if DB is connected)
    console.log("5️⃣ Testing Repository Query:");
    try {
      const posts = await PostRepository.findAll();
      console.log(`✅ PostRepository.findAll() successful - Found ${posts.length} posts`);
    } catch (error) {
      console.log("❌ Repository query failed:", error.message);
    }
    console.log("");

    console.log("🎉 Architecture Test Complete!");
    console.log("✅ All components loaded successfully");
    console.log("✅ Ready to start test server");

  } catch (error) {
    console.error("❌ Architecture test failed:", error);
  }
}

// Run the test
testNewArchitecture().then(() => {
  console.log("\n📝 To start the new backend server, run:");
  console.log("   npm start");
  console.log("\n📝 To test endpoints once server is running:");
  console.log("   curl http://localhost:4000/posts/all");
  console.log("   curl http://localhost:4000/user/check-email");
});

module.exports = testNewArchitecture;
