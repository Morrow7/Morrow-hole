import { motion } from "framer-motion";
import LegendItem from "./LegendItem";

export default function TechStackCard() {
  // 技术栈数据类型
  interface Technology {
    name: string;
    level: number;
    category: "frontend" | "backend" | "database" | "build";
    icon: string;
  }

  const technologies: Technology[] = [
    {
      name: "Next.js",
      level: 41,
      category: "frontend",
      icon: "https://th.bing.com/th/id/ODF.MzoL3O4svOEyO-tUNCEcNA?w=32&h=32&qlt=92&pcl=fffffa&o=6&cb=12&pid=1.2",
    },
    {
      name: "React.js",
      level: 41,
      category: "frontend",
      icon: "https://th.bing.com/th/id/ODF.uueRzX_Uadnf-upJFewZbQ?w=32&h=32&qlt=90&pcl=fffffc&o=6&cb=12&pid=1.2",
    },
    {
      name: "Vue.js",
      level: 30,
      category: "frontend",
      icon: "https://th.bing.com/th/id/ODF.Npfb3Lt5Kweeqbn0AaNM8Q?w=32&h=32&qlt=90&pcl=fffffc&o=6&cb=12&pid=1.2",
    },
    {
      name: "TypeScript",
      level: 50,
      category: "frontend",
      icon: "https://th.bing.com/th/id/ODF.HUTtbnIbh59x2VtGGpwFiQ?w=32&h=32&qlt=90&pcl=fffffa&o=6&cb=12&pid=1.2",
    },
    {
      name: "Python",
      level: 10,
      category: "backend",
      icon: "https://th.bing.com/th/id/ODF.SWId9aBgwQh4GYX8Nki9BA?w=32&h=32&qlt=90&pcl=fffffa&o=6&cb=12&pid=1.2",
    },
    {
      name: "Node.js",
      level: 50,
      category: "backend",
      icon: "https://th.bing.com/th/id/ODF.yDzcbj5o-mHlIWot-A2fyQ?w=32&h=32&qlt=90&pcl=fffffa&o=6&cb=12&pid=1.2",
    },
    {
      name: "MySQL",
      level: 50,
      category: "database",
      icon: "https://th.bing.com/th/id/ODF.YzDy8NI4GHUFJZhS5YKQKg?w=32&h=32&qlt=90&pcl=fffffa&o=6&cb=12&pid=1.2",
    },
    {
      name: "Vite",
      level: 30,
      category: "build",
      icon: "https://th.bing.com/th/id/ODF.hvDJFjxOsw68NRakVlzOWg?w=32&h=32&qlt=90&pcl=fffffa&o=6&cb=12&pid=1.2",
    },
  ];

  const getColor = (category: string) => {
    switch (category) {
      case "frontend":
        return "bg-blue-500";
      case "backend":
        return "bg-green-500";
      case "database":
        return "bg-purple-400";
      case "build":
        return "bg-amber-500";
      default:
        return "bg-amber-500";
    }
  };

  return (
    <motion.div className="bg-white/95 backdrop-blur-sm rounded-[2rem] p-8 border border-gray-200/80 shadow-sm transition hover:shadow-xl xl:w-1/3 my-8 xl:my-0">
      <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        <svg
          className="w-6 h-6 text-amber-600 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        Technical capabilities
      </h3>

      <div className="space-y-6">
        {technologies.map((tech, index) => (
          <motion.div
            key={tech.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-700 font-medium flex space-x-1 items-center">
                <img src={tech.icon} className="w-5 h-5"></img>
                <span>{tech.name}</span>
              </span>
              <span className="text-amber-600 font-medium">{tech.level}%</span>
            </div>

            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className={`${getColor(tech.category)} h-full rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${tech.level}%` }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.15,
                  type: "spring",
                  stiffness: 50,
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* 图例说明 */}
      <div className="mt-8 pt-6 border-t border-gray-200/50 flex flex-wrap gap-6">
        <LegendItem color="bg-blue-500" label="fontend" />
        <LegendItem color="bg-green-500" label="backend" />
        <LegendItem color="bg-purple-400" label="database" />
        <LegendItem color="bg-amber-500" label="bulid" />
      </div>
    </motion.div>
  );
}
