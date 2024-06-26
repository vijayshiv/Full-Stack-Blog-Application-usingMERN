import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ScrollToTop from "./ScrollToTop"; // Import the ScrollToTop component
import Register from "./pages/Register";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Write from "./pages/Write";
import Post from "./pages/Post"; // Ensure this is correctly imported
import Profile from "./pages/Profile";
import Layout from "./Layout";
import MyPosts from "./pages/MyPost";
import EditPost from "./pages/EditPost";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <ScrollToTop />
        <Layout />
      </>
    ),
    children: [
      { path: "/", element: <Home /> },
      { path: "/register", element: <Register /> },
      { path: "/login", element: <Login /> },
      { path: "/post/:id", element: <Post /> },
      { path: "/write", element: <Write /> },
      { path: "/profile", element: <Profile /> },
      { path: "/my-post", element: <MyPosts /> },
      { path: "/edit-post/:id", element: <EditPost /> },
    ],
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  );
}

export default App;
