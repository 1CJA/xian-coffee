# 栖岸咖啡 Qi'an Coffee

咖啡馆点单课程项目，包含微信小程序用户端、Vue3 管理端和 Spring Boot 后端。

## 项目结构

| 目录 | 内容 |
| --- | --- |
| XianCoffee | 原生微信小程序，18 个页面 |
| admin-vue | Vue3 + Element Plus 管理端 |
| XianCoffeebackend | Spring Boot + MyBatis 后端 |
| sql/schema.sql | MySQL 17 张表建表脚本，无个人数据 |

## 功能

用户端包含登录注册、菜单分类、搜索、规格选择、购物袋、下单、模拟支付、订单、会员、优惠券、集点卡、地址和门店信息。管理端包含商品、分类、规格、订单、会员、优惠券、集点卡、门店和轮播图管理。

## 本地启动

1. 创建 MySQL 数据库并导入 `sql/schema.sql`。公开版本不包含业务数据，请通过管理端录入分类、商品、门店等数据。
2. 使用 IDEA 打开 `XianCoffeebackend`，按 pom.xml 配置 JDK 与 Maven。设置运行环境变量 `DB_USERNAME` 和 `DB_PASSWORD`，启动主类。默认端口为 2544。
3. 在 `admin-vue` 执行 `npm ci`，再执行 `npm run dev`。依赖版本见 package.json 与 package-lock.json。
4. 微信开发者工具导入 `XianCoffee`，将 touristappid 替换为你自己的 AppID。

## 公开版配置

数据库密码由 `DB_PASSWORD` 环境变量提供。前端原有教学登录密码已替换为 `CHANGE_ME_BEFORE_RUN`，运行前需配置自己的演示密码。当前管理员认证与小程序登录实现仅适用于课程演示，正式部署需要后端鉴权、密码哈希和权限控制。

接口默认地址为 `http://localhost:2544/api`。手机无法访问电脑的 localhost；真机调试需同步替换接口及图片地址为可访问的主机地址，正式发布请配置 HTTPS 域名。

图片映射与上传目录见后端 application.yml 和 WebConfig。原项目图片、视频、上传头像、会员与订单数据未随源码发布；请自行提供有使用权的素材。部分页面保留原图片 URL，未配置素材时图片可能为空。

支付功能为模拟支付。后台和小程序通过后端共享业务数据，需刷新页面获取更新。本次发布未执行完整构建与真机测试。

## 许可证

源码采用 MIT 许可证。第三方依赖遵循各自许可证，图片和视频不包含在本授权中。
