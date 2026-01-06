import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import TechStackCard from "../computed/TechStackCard";
import SocialLink from "../computed/SocialLink";
import PixelTransition from "../computed/reactbits/PixelTransition";
import { GithubIcon, QQIcon, GiteeIcon, TwitterIcon } from "../computed/Icons";
import resMethod from "../tools/resMethod";

export default function About() {
  interface Span {
    id: number;
    text: string;
  }

  // 使用两个独立的 ref
  const [refLeft, inViewLeft] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  const [refRight, inViewRight] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const [nowList, setNowList] = useState<Span[]>([{ id: 0, text: "🤔 " }]);
  const [aboutData, setAboutData] = useState<Span[]>([{ id: 0, text: "🤔 " }]);

  const [imgUrl] = useState("/src/assets/avater.jpg");

  useEffect(() => {
    resMethod("/about/now", "GET").then((res) => {
      setNowList(res);
    });

    resMethod("/about", "GET").then((res) => {
      setAboutData(res);
    });
  }, []);

  // 动画配置
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    // 防止横向溢出
    <div className={"bg-gradient-to-br"}>
      {/* 使用 max-w-screen-2xl 限制最大宽度 */}
      <main className="max-w-screen-2xl mx-auto w-full py-24 px-4">
        {/* 头像区块 */}
        <motion.div
          className="flex justify-center mb-20"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 60 }}
        >
          {/* 固定头像容器尺寸，防止动画撑开 */}
          <div
            className="relative group"
            style={{ width: "200px", height: "200px" }}
          >
            <PixelTransition
              firstContent={
                <img
                  src={imgUrl}
                  alt="Y 的头像"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "1rem",
                  }}
                />
              }
              secondContent={
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "grid",
                    placeItems: "center",
                    backgroundColor: "#111",
                    borderRadius: "1rem",
                  }}
                >
                  <p
                    style={{
                      fontWeight: 900,
                      fontSize: "3rem",
                      color: "#ffffff",
                    }}
                  >
                    Hi ~
                  </p>
                </div>
              }
              gridSize={12}
              pixelColor="#ffffff"
              animationStepDuration={0.4}
              className="custom-pixel-card"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
          </div>
        </motion.div>

        {/* 卡片布局 */}
        <div className="flex flex-col lg:flex-row justify-center gap-12 mx-5">
          {/* 左侧卡片 */}
          <motion.div
            ref={refLeft}
            className="bg-white/90 backdrop-blur-lg rounded-[2rem] p-12 border border-gray-200/80 shadow-sm transition hover:shadow-xl w-full lg:w-1/3"
            // 固定最小高度，防止动画时布局跳动
            style={{ minHeight: "520px" }}
            initial="hidden"
            animate={inViewLeft ? "visible" : "hidden"}
            variants={containerVariants}
            layout
          >
            <motion.h1
              className="text-4xl font-bold text-gray-800 mb-8"
              variants={itemVariants}
            >
              <span className="bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
                Y
              </span>
              <br />
              <span className=" text-gray-600">Idealist</span>
            </motion.h1>

            <motion.div
              className="text-lg text-gray-600 leading-relaxed mb-12 space-y-3"
              variants={itemVariants}
            >
              {aboutData.map((item) => {
                return <p>{item.text}</p>;
              })}
            </motion.div>

            <motion.div>
              <motion.h2
                className="text-3xl font-bold text-gray-800 mb-8"
                variants={itemVariants}
              >
                <span className="text-gray-600">contact</span>
              </motion.h2>

              <motion.div
                className="grid grid-cols-2 gap-4 mb-12"
                variants={itemVariants}
              >
                <SocialLink
                  href="https://pbs.twimg.com/profile_images/2002373229852135424/H453-yww_400x400.jpg"
                  icon={<TwitterIcon />}
                  label="X"
                />
                <SocialLink
                  href="https://gitee.com/susu7923"
                  icon={<GiteeIcon />}
                  label="Gitee"
                />
                <SocialLink
                  href="https://github.com/Morrow7"
                  icon={<GithubIcon />}
                  label="Github"
                />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* 中间卡片 */}
          <TechStackCard />

          {/* 右侧卡片：现在 */}
          <motion.div
            ref={refRight}
            className="bg-white/90 backdrop-blur-lg rounded-[2rem] p-12 border border-gray-200/80 shadow-sm transition hover:shadow-xl w-full lg:w-1/3"
            style={{ minHeight: "520px" }}
            initial="hidden"
            animate={inViewRight ? "visible" : "hidden"}
            variants={containerVariants}
            layout
          >
            <motion.h1
              className="text-4xl font-bold text-gray-800 mb-8"
              variants={itemVariants}
            >
              <span className="text-gray-600">Now</span>
            </motion.h1>

            <motion.div
              className="text-lg text-gray-600 leading-relaxed mb-12 space-y-6"
              variants={itemVariants}
            >
              {nowList.map((item, index) => (
                <p key={index}>{item.text}</p>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
