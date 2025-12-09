import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import resMethod from "../tools/resMethod.ts";
import TextType from "../computed/reactbits/TextType.tsx";
import DecryptedText from "../computed/reactbits/DecryptedText.tsx";

export default function Master() {
  const [masterData, setMasterData] = useState({
    tips: "Loading...",
    articleCount: 3,
    projectCount: 1,
    readCount: 0,
    lifeCount: 0,
    friendCount: 0,
  });

  const [friendList, setFriendList] = useState([
    {
      id: 0,
      name: "Loading..",
      title: "Loading..",
      descript: "Loading..",
      img: "Loading...",
      contact: "",
      contact_type: "email",
    },
  ]);

  useEffect(() => {
    resMethod("/master", "get").then((res) => {
      setMasterData(res);
    });

    resMethod("/master/friend", "get").then((res) => {
      setFriendList(res);
    });
  }, []);

  return (
    <div>
      {/* 主内容容器 */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* 头部区域 */}
        <header className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8 mb-12 border border-gray-200/80">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 animate-fade-in-up">
            <TextType
              text={[
                "Hi !",
                "I am Morrow.",
                "Software engineer",
                "quantitative researcher",
              ]}
              typingSpeed={150}
              pauseDuration={1500}
              showCursor={true}
              cursorCharacter="|"
              textColors={["black"]}
            />
          </h1>
          <p className="text-gray-800 text-xl py-4 font-bold">
            {/*文字解密动画效果*/}
            <DecryptedText
              text="Welcome to my blog "
              animateOn="view"
              speed={150}
              revealDirection="center"
            />
          </p>

          <p className="text-gray-400 text-lg leading-relaxed italic">
            <DecryptedText
              text={masterData.tips}
              animateOn="view"
              speed={180}
              revealDirection="center"
            />

            <br />
          </p>
        </header>

        {/* 特色卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* 现状卡片 */}
          <div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/80 hover:border-amber-200 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-amber-50 rounded-xl mr-4 group-hover:rotate-12 transition-transform">
                <svg
                  className="w-8 h-8 text-amber-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M12 6C9.79086 6 8 7.79086 8 10C8 12.2091 9.79086 14 12 14C14.2091 14 16 12.2091 16 10C16 7.79086 14.2091 6 12 6ZM12 8C10.8954 8 10 8.89543 10 10C10 11.1046 10.8954 12 12 12C13.1046 12 14 11.1046 14 10C14 8.89543 13.1046 8 12 8Z"
                    fill="#f59e0b"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M11.0901 22.5958C11.2059 22.6753 11.2981 22.7366 11.3626 22.7788L11.4687 22.8472C11.7933 23.0504 12.2061 23.0508 12.5307 22.8476L12.6375 22.7788C12.7019 22.7366 12.7941 22.6753 12.9099 22.5958C13.1415 22.4367 13.4685 22.2041 13.8591 21.9041C14.6386 21.3054 15.6801 20.4322 16.7247 19.3336C18.7857 17.1661 21 13.9725 21 10.1818C21 7.75381 20.0571 5.42084 18.3719 3.69728C16.6859 1.97296 14.3943 1 12 1C9.60571 1 7.31415 1.97296 5.62814 3.69728C3.94288 5.42084 3 7.75381 3 10.1818C3 13.9725 5.21434 17.1661 7.27531 19.3336C8.31993 20.4322 9.36136 21.3054 10.1409 21.9041C10.5315 22.2041 10.8585 22.4367 11.0901 22.5958ZM12 3C10.1508 3 8.37273 3.75107 7.05815 5.09552C5.74283 6.44073 5 8.26992 5 10.1818C5 13.2007 6.78566 15.9162 8.72469 17.9554C9.68007 18.9602 10.6386 19.7646 11.3591 20.3179C11.6046 20.5065 11.8215 20.6651 12 20.7918C12.1785 20.6651 12.3954 20.5065 12.6409 20.3179C13.3614 19.7646 14.3199 18.9602 15.2753 17.9554C17.2143 15.9162 19 13.2007 19 10.1818C19 8.26992 18.2572 6.44073 16.9418 5.09552C15.6273 3.75107 13.8492 3 12 3Z"
                    fill="#f59e0b"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 group-hover:text-amber-600 transition-colors">
                Recently
              </h2>
            </div>
            <p className="text-gray-600 mb-4">Now Job: Full stack of remote</p>
            <p className="text-gray-600 mb-4">Base: California USA</p>
            <p className="text-gray-600 mb-4">Loaction: Sichuan Chengdu</p>
          </div>

          {/* 项目展示卡片 */}
          <div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/80 hover:border-purple-200 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-50 rounded-xl mr-4 group-hover:-rotate-12 transition-transform">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                Projects
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              The cycle of learning and practice
            </p>
            <div className="animate-progress-bar h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all duration-1000"
                style={{ width: "75%" }}
              />
            </div>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>total project {masterData.projectCount}</span>
            </div>
          </div>

          {/* 数据统计卡片 */}
          <div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/80 hover:border-emerald-200 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-emerald-50 rounded-xl mr-4 group-hover:rotate-12 transition-transform">
                <svg
                  className="w-8 h-8 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">
                Milestone
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div className="p-4 bg-gray-50 rounded-xl hover:bg-white transition-colors flex flex-col items-center">
                <div className="text-2xl font-bold text-amber-600 text-center">
                  {masterData.readCount}
                </div>
                <div className="text-sm text-gray-500">read</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl hover:bg-white transition-colors">
                <div className="text-2xl font-bold text-purple-600">
                  {masterData.lifeCount}
                </div>
                <div className="text-sm text-gray-500">life</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl hover:bg-white transition-colors">
                <div className="text-2xl font-bold text-emerald-600">
                  {masterData.friendCount}
                </div>
                <div className="text-sm text-gray-500">Friends</div>
              </div>
            </div>
          </div>
        </div>

        {/* 友链 */}
        <section className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-200/80">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
              <span className="mr-2"></span>
              Friend links
            </h2>
            Add
          </div>

          <div className="space-y-6 lg:flex flex-wrap justify-around">
            {friendList.map((friend: any) => (
              <a href={friend.contact} key={friend.id}>
                <div className="group p-6 m-2 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <img
                      src={friend.img}
                      className="w-15 h-15 rounded-full flex-shrink-0"
                      alt={friend.name}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-800 group-hover:text-amber-600 transition-colors truncate">
                        {friend.name}
                      </h3>
                      <p className="text-gray-600 mt-2 truncate">
                        {friend.title}
                      </p>
                      <p className="text-gray-600 mt-2 line-clamp-2">
                        {friend.descript}
                      </p>
                      <div className="flex items-center mt-4 space-x-4 text-sm text-gray-500">
                        <span>{friend.contact_type}:</span>
                        <span className="truncate">{friend.contact}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
