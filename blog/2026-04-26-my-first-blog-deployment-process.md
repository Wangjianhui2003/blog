---
title: 第一次部署个人博客过程
description: frist blog deployment process
authors: jianhui
slug: my-first-blog-deployment-process
---

## 搭建Blog

使用`Docusaurus`脚手架搭建一个网站。

{/*truncate*/}

```bash
pnpm create docusaurus
```

## 部署

修改完毕后，在根目录创建`netlify.toml`，配置：

```toml
[build]
command = "pnpm build"
publish = "build"
```

将repo上传到Github

在Netlify上创建新的project，链接自己的Github账号，然后导入对应的repo。Netlify会构建然后部署。

## 配置域名

Netlify可以自定义域名，但是以netlify.app结尾。

```
jianhuiblog.netlify.app
```

京东云上买了一个域名：`jianhui03.cn`。将该根域名（Root domain / Apex domain）配置指向一个Netlify的负载均衡IPv4地址

```
jianhui03.cn A 75.2.60.5
```

在京东云上配置子域名`www`指向我的Netlify项目的默认域名

```
www.jianhui03.cn CNAME jianhuiblog.netlify.app
```

然后在Netlify添加我在京东云上买的这个域名，一个`jianhui03.cn`,和`www.jianhui03.cn`。将该子域名`www`设置为`Primary domain` ，这样可以利用Netlify的CDN

:::tip

为什么这样可以利用到CDN：

```
用户访问 jianhui03.cn
  ↓
DNS 返回 75.2.60.5
  ↓
请求到达 Netlify
  ↓
Netlify 自动跳转到 www.jianhui03.cn
  ↓
浏览器重新访问 www.jianhui03.cn
  ↓
DNS 通过 CNAME 解析到 jianhuiblog.netlify.app
  ↓
Netlify 根据自己的 CDN / Edge 网络处理请求
  ↓
用户拿到博客页面
```

:::

## 配置证书

Netlify域名配置下面可以直接启用TLS证书（Let’s Encrypt）

## 访问

完成，现在能成功访问`www.jianhui03.cn`和`jianhui03.cn`

可以用这条命令验证是否缓存命中

```bash
curl -I https://jianhui03.cn/img/logo.png
```
