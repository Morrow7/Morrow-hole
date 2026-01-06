import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import resMethod from "../tools/resMethod";
import { motion } from "framer-motion";

export default function Projects() {
  interface Project {
    id: number;
    title: string;
    descript: string;
    tech: string[];
    progress: string | number;
    status: string;
    img: string;
    url: string;
  }

  const [projects, setProjects] = useState<Project[]>([
    {
      id: 0,
      title: "Loading..",
      descript: "Loading..",
      tech: ["Loading.."],
      progress: "Loading..",
      status: "Loading..",
      img: "",
      url: "",
    },
  ]);

  useEffect(() => {
    resMethod("/projects", "GET")
      .then((res) => {
        const filterProjects = (list: Project[]) =>
          list.filter((project) => project.title !== "Ant's agent");

        if (Array.isArray(res.data)) {
          setProjects(filterProjects(res.data));
        } else if (Array.isArray(res)) {
          setProjects(filterProjects(res));
        } else {
          console.error("Invalid projects response:", res);
          setProjects([]);
        }
      })
      .catch((err) => {
        console.error("Fetch projects error:", err);
        setProjects([]); // 失败时清空
      });
  }, []);

  return (
    <div className={"min-h-screen"}>
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* 头部区域 */}
        <header className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8 mb-12 border border-gray-200/80">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center">
            <svg
              className="w-8 h-8 text-amber-600 mr-3"
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
            Projects
          </h1>
          <div className="flex items-center space-x-4 text-gray-600">
            The manifestation of existential value
          </div>
        </header>

        {/* 项目网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {projects.length === 0 ? (
            <p className="text-center py-8 text-gray-500 col-span-2">
              underfind project
            </p>
          ) : (
            projects.map((project, index) => (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.15, // 每个卡片延迟 0.15s
                }}
                className="group bg-white/90 backdrop-blur-sm rounded-[1.5rem] p-10 border-2 border-gray-200/80 hover:border-amber-200 transition-all duration-300 hover:shadow-2xl"
              >
                <Link to={project.url}>
                  <div className="space-y-8">
                    {/* 项目封面 */}
                    <div className="relative rounded-2xl overflow-hidden aspect-video">
                      <img
                        src={project.img}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/600x338?text=No+Image";
                        }}
                      />
                      <div className="absolute bottom-4 right-4 bg-white/90 px-4 py-1.5 rounded-full text-sm shadow-sm">
                        {project.status === "开发中" ? (
                          <span className="text-amber-600">
                            🚧 {project.status}
                          </span>
                        ) : (
                          <span className="text-emerald-600">
                            ✅ {project.status}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 内容区块 */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-800 group-hover:text-amber-600 transition-colors">
                          {project.title}
                        </h2>
                      </div>

                      {/* 进度条 */}
                      <div className="space-y-3">
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                            style={{
                              width: `${typeof project.progress === "number" ? project.progress : 0}%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                      </div>

                      {/* 项目描述 */}
                      <p className="text-gray-600 leading-relaxed">
                        {project.descript}
                      </p>

                      {/* 技术栈标签 */}
                      <div className="flex flex-wrap gap-3">
                        {project.tech.map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors"
                          >
                            #{tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
