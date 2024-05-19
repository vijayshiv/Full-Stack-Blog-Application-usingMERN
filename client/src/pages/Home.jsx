import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const getText = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent;
  };
  const posts = [
    {
      id: 1,
      title: "Products Reviews",
      desc: "When it comes to the most popular types of blog posts to incorporate into a content marketing campaign, listicles come in pretty close to the top, and with good reason.To begin with, everyone loves a good list. Lists are organized, easy to digest, and easy to share via social media, email, and more",
      img: "https://images.pexels.com/photos/7008010/pexels-photo-7008010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      id: 2,
      title: "Listicles",
      desc: "Buy a product, review it in a blog post. It’s a great way to gain attention, especially if you throw in a YouTube review of the company or “unboxing.However, it can be easy to fall into the trap of receiving and reviewing for the sake of the product. So, write about something that is related to your brand to stay focused. ",
      img: "https://images.pexels.com/photos/6489663/pexels-photo-6489663.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      id: 3,
      title: "Tutorials",
      desc: "Helpful content is truly where it’s at when it comes to topping today’s most competitive SERPs. The more you can teach your audience, the better, both for your readers and for your search rankings.That said, tutorials and other how-to articles are great additions to any list of go-to blog post types. They lend themselves well to ideal keyword usage, ",
      img: "https://images.pexels.com/photos/4230630/pexels-photo-4230630.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      id: 4,
      title: "Newsworthy Posts",
      desc: "Chiming in on timely, relevant industry topics is a terrific way to add variety to your blog feed and keep your audience engaged. There’s also endless potential there when it comes to ideas.Just keep an eye on what’s new, add your brand’s unique take on things, and you’re all set. You can even combine news posts with other popular kinds of blog posts",
      img: "https://images.pexels.com/photos/6157049/pexels-photo-6157049.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
  ];
  return (
    <>
      <div>
        <div className="">
          {posts.map((post, index) => (
            <div
              className={`flex flex-row text-2xl font-sans list-disc ${
                index % 2 !== 0 ? "flex-row-reverse" : ""
              }`}
            >
              <div className="flex basis-1/3 px-5 mt-14 relative">
                <div className="relative image-wrapper">
                  <img
                    className="m-10 relative z-10 h-[60%] w-auto"
                    src={`${post.img}`}
                    alt="Fine"
                  />
                </div>
              </div>

              <div className="relative basis-2/3 ml-10 py-2  ">
                <Link className="" to={`/post/${post.id}`}>
                  <h1 className="px-10 text-justify font-bold text-3xl mt-10 py-10">
                    {post.title}
                  </h1>
                </Link>
                <p className="px-10 text-xl text-justify ">
                  {getText(post.desc)}
                </p>
                <button className="absolute p-3 text-xl bottom-48 left-10 border-2 border-solid border-black  hover:bg-gray-200 ">
                  Read More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
