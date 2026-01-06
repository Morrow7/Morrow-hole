function WeChatIcon(): React.ReactElement {
  return (
    <img src="https://wx.qlogo.cn/mmhead/HmVQlX9WkBsob0GPr1onPAQsqE0FwlEsVhFic80ABEqVPiaHlxDJWib5Rx2t0XqVK5bMQAfgRicuETc/0" alt="Wechat" className="rounded-full" />
  );
}

function QQIcon(): React.ReactElement {
  return (
    <img src="https://q.qlogo.cn/g?b=qq&nk=1537871968&s=100" alt="QQ" className="rounded-full" />
  );
}

function GiteeIcon(): React.ReactElement {
  return (
    <img src="https://foruda.gitee.com/avatar/1755261130817485028/16076710_susu7923_1755261130.png!avatar200" alt="Gitee" className="rounded-full" />
  )
}

function TwitterIcon(): React.ReactElement {
  return (
    <img src="https://pbs.twimg.com/profile_images/2002373229852135424/H453-yww_400x400.jpg" alt="Twitter" className="rounded-full" />
  )
}

// 图标组件 避免过度解耦所以不抽离
function GithubIcon(): React.ReactElement {
  return (
    <img src="https://avatars.githubusercontent.com/u/184657331?v=4" alt="Github" className="rounded-full" />
  )
}

function GmailIcon(): React.ReactElement {
  return (
    <img src="https://lh3.googleusercontent.com/a/ACg8ocLB9NVwNOXxBbuASRiafGZKBb8ylyQDLs33pw6vvOfWwKsqfak=s192-c-rg-br100" alt="Gmail" className="rounded-full" />
  )
}

export { WeChatIcon, QQIcon, GiteeIcon, GithubIcon, GmailIcon, TwitterIcon }; 
