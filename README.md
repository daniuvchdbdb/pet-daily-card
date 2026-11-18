# 毛孩日报

微信原生小程序 MVP，包含宠物档案、宠物日报、Canvas/云端日报卡生成、历史记录、成长相册、养护提醒、主题皮肤、会员服务和灵宠修行成长系统。

## 首次运行配置

1. 在微信开发者工具中导入本目录。
2. 确认 `app.js` 中的云开发环境 ID 已配置为 `YOUR_CLOUD_ENV_ID`。
3. 在「云开发」控制台创建数据库集合：
   - `users`
   - `pets`
   - `daily_cards`
   - `templates`
   - `reminders`
   - `reminder_logs`
   - `pet_exp_logs`
   - `orders`
   - `entitlements`
4. 集合权限建议：
   - `users`、`pets`、`daily_cards`、`reminders`、`reminder_logs`、`pet_exp_logs`、`orders`、`entitlements`：仅创建者可读写。
   - `templates`：所有用户可读，仅管理员可写；如控制台没有该选项，可先用仅创建者可读写。

## 会员服务与支付说明

会员服务定位为工具类增值服务，页面文案保持克制，不做强营销表达。

付费内容：
- Plus / Pro 为高级主题、无水印导出、成长记录增强、自定义主题等增值服务。
- 免费用户无需付费即可使用基础宠物记录、基础日报、基础提醒、历史记录和免费主题。

支付方式：
- 仅预留普通微信支付链路，不引导外部付款，支付通过微信支付官方能力完成。
- 前端只传 `productId`，不传金额，不直接修改 `users.plan`，不直接写支付成功状态。
- 支付成功后必须通过 `payNotify` 或 `queryOrder` 服务端确认，再更新 `users.plan`、`planExpireAt`，并写入 `entitlements`。

需要部署的会员支付云函数：
- `createOrder`：服务端读取商品配置、创建 `orders` pending 订单，并生成微信支付参数。
- `queryOrder`：查询订单状态，用于支付后确认。
- `payNotify`：微信支付通知回调，确认支付成功后发放会员权益。

真实支付接入前，需要在云函数服务端配置商户号、支付回调和微信支付能力。不要把任何支付密钥、证书或签名逻辑写在小程序前端。

## 创作者权限

- 在 `utils/devConfig.js` 的 `CREATOR_OPENIDS` 中填入你的微信云开发 openid。
- 命中白名单后，`users` 中该用户会自动更新为 `role: "creator"`、`plan: "pro"`。
- 创作者/管理员可使用全部主题和高级功能，生成无水印卡片，不受宠物、日报卡、提醒数量限制，用于测试、截图、展示和运营。

## 审核说明

小程序主要功能：
宠物档案、宠物日报、养护提醒、历史记录、成长相册、主题皮肤、会员服务、趣味成长记录。

会员服务说明：
Plus / Pro 是高级主题、无水印导出、成长记录增强、自定义主题等工具类增值服务。免费用户可以正常完成核心流程。

非医疗说明：
本项目只做日常养护观察、趣味成长记录和陪伴记录，不提供宠物医疗诊断、问诊、处方或治疗建议。驱虫、疫苗提醒只按照用户设置的时间发送。

隐私说明：
用户上传的宠物照片用于日报展示和成长相册。用户可删除宠物档案和相关记录，上传内容不会用于无关用途。


## Portfolio scope

This is a self-initiated, AI-assisted learning/demo project, not a claim of commercial employment or production deployment. Private databases, credentials, local browser profiles, customer records and generated build output are excluded. Configure your own services and use synthetic data. Payment/provider integrations and deployment require independent review before production use. No new full end-to-end validation is claimed by this publication.
