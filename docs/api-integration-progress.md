# API Integration Progress

> Document type: integration status tracker
> Status: Tracking
> Last verified: 2026-08-13
> Sources: current Swagger contract, API modules, routes, views, and documented live read-only checks

Swagger source: https://api.boltfox.cn/swagger-ui.html#/

Machine-readable source: https://api.boltfox.cn/v2/api-docs

Backend prefix: `/ZoneAdmin`

Rule: only integrate `管理后台-*` Swagger groups. Existing modules without matching `管理后台-*` interfaces should be removed when their turn is reached.

## Module Status

| Module | Swagger tag | Status | Notes |
| --- | --- | --- | --- |
| APP version and app market | 管理后台-APP版本管理接口 | Completed | Current `appVersion` and `applicationStore` modules now use `/AppVersion/*`. |
| Product version | 管理后台-产品版本控制接口 | Completed | Added `productVersion` API, list route, and detail route. |
| Product | 管理后台-产品相关接口 | Completed | Product, product FAQ, and user product list now use `/Product/*`. |
| Login | 管理后台-登录 | Completed | Login request and token handling now match `/Passport/adminLogin`. |
| Permission | 管理后台-权限 | Completed | UMS permission pages now align with `/Jurisdiction/*`; unsupported area route removed. |
| Common | 管理后台-通用相关接口 | Completed | Home stats include bound-device count and order amount; config and upload use `/Common/*`; unsupported area/TMS common APIs removed. |
| User product image | 管理后台-用户产品图片控制接口 | Completed | Added `/UserProductImg/*` API wrappers, list route, and CRUD/status UI. |
| User | 管理后台-用户相关接口 | Completed | User list, detail, edit, export, status, token-account editing, and account logs align with `/User/*`. |
| Goods | 管理后台-商品相关接口 | Completed | Added goods list/add/edit/detail/status pages and `/Goods/*` API wrappers. |
| Public image library | 管理后台-公共图库相关接口 | Completed | Added image and category list/add/edit/detail/status pages and `/ProductImg/*` API wrappers. |
| Order | 管理后台-订单相关接口 | Completed | Added order list/detail pages and `/Order/*` API wrappers. |
| AI configuration | 管理后台-AI费用配置相关接口 | Completed | Added AI configuration list/edit/status UI and `/AiConfig/*` API wrappers. |

## Completed Work

### 首页统计与用户账户管理增量

Status: Completed

Implemented API integration:

- `GET /Common/getUserCount` now consumes `userBindProductCount` and `orderAmount` in addition to the existing totals.
- `GET /User/getUserList` now displays `totalToken`, `availableToken`, and `consumeToken`.
- `POST /User/setUserAccount`
- `GET /User/getOperatUserAccountLog`

Added UI route:

- `userAccountLogs` (hidden route, reachable from the user-list toolbar or a specific user row)

Changed files:

- `src/api/userList.js`
- `src/views/home/index.vue`
- `src/views/sms/userList/index.vue`
- `src/views/sms/userList/components/UserAccountEditor.vue`
- `src/views/sms/userList/accountLogs.vue`
- `src/router/routes.js`
- `scripts/sync-admin-menu.mjs`

Notes:

- Swagger and live read-only responses were rechecked on 2026-08-13. The account editor submits only `userId` and `availableToken`; authentication fields remain centralized in `src/utils/request.js`.
- The user list intentionally hides country and country-code columns. Users with `Post_User_SetUserAccount` can click the available-token value to edit it; other users see a read-only value.
- System `1` received the idempotent permission nodes `Post_User_SetUserAccount` and `Get_User_GetOperatUserAccountLog` under the existing `Get_User_GetUserList` node. No role bindings were changed.

Verification:

- `node --check scripts/sync-admin-menu.mjs` and `node --check src/api/userList.js` passed.
- `npm run build` passed on 2026-08-13.
- Live read-only account-log verification returned `retCode=200`; filtering by a sampled user ID returned only matching rows.
- Menu preview reported two missing nodes; apply created both; a second preview reported both as existing.

### 管理后台-APP版本管理接口

Status: Completed

Implemented API wrappers:

- `GET /AppVersion/getAppVersionDetail`
- `GET /AppVersion/getAppVersionList`
- `POST /AppVersion/setAppVersionDelete`
- `POST /AppVersion/setAppVersionEdit`
- `POST /AppVersion/setAppVersionGrade`
- `POST /AppVersion/setAppVersionVerify`
- `GET /AppVersion/getAppMarketDetail`
- `GET /AppVersion/getAppMarketList`
- `POST /AppVersion/setAppMarketDelete`
- `POST /AppVersion/setAppMarketEdit`
- `POST /AppVersion/setAppMarketGrade`
- `POST /AppVersion/setAppMarketVerify`

Changed files:

- `.env`
- `src/api/appVersion.js`
- `src/api/applicationStore.js`
- `src/views/sms/appVersion/index.vue`
- `src/views/sms/applicationStore/index.vue`

Verification:

- `npm run build` passed.

Pending:

- Confirm next module before continuing.

### 管理后台-商品与订单接口

Status: Completed

Implemented API wrappers:

- `POST /Goods/addGoods`
- `GET /Goods/getGoodsList`
- `GET /Goods/getGoodsDetail`
- `POST /Goods/editGoods`
- `POST /Goods/setGoodsVerify`
- `GET /Order/getOrderList`
- `GET /Order/getOrderDetail`

Added UI routes:

- `goodsList`
- `goodsListAdd`
- `goodsListEdit`
- `goodsListDetail`
- `orderList`
- `orderListDetail`

Changed files:

- `src/api/goods.js`
- `src/api/order.js`
- `src/views/commerce/**`
- `src/router/routes.js`
- `scripts/sync-admin-menu.mjs`
- `docs/dynamic-menu-sync.md`
- `docs/api-integration-progress.md`
- `docs/interface-list.md`

Notes:

- Swagger and live read-only responses were checked on 2026-08-11.
- Goods and order list filters match Swagger query fields and use the shared `pageIndex/pageSize/pageData/recordCount` pagination convention.
- Menu synchronization is idempotent and keeps credentials outside the repository.
- Backend menu `appUrl` values are the local route names `goodsList` and `orderList`; operation nodes reuse the exact `v-permission` codes.

Verification:

- `npm run build` passed on 2026-08-11.
- The menu sync was applied to system `1`: 9 nodes created, then a second read-only preview confirmed all 9 nodes exist with no configuration drift.

### 管理后台-公共图库与 AI 费用配置接口

Status: Completed

Implemented API wrappers:

- `POST /ProductImg/addProductImg`
- `GET /ProductImg/getProductImgList`
- `GET /ProductImg/getProductImgDetail`
- `POST /ProductImg/editProductImg`
- `POST /ProductImg/setProductImgVerify`
- `POST /ProductImg/addImgCategory`
- `GET /ProductImg/getImgCategoryList`
- `GET /ProductImg/getImgCategoryDetail`
- `POST /ProductImg/editImgCategory`
- `POST /ProductImg/setImgCategoryVerify`
- `GET /AiConfig/getAiConfigList`
- `POST /AiConfig/editAiConfig`
- `POST /AiConfig/setAiConfigVerify`

Added UI routes:

- `productImageList`, `productImageAdd`, `productImageEdit`, `productImageDetail`
- `imageCategoryList`, `imageCategoryAdd`, `imageCategoryEdit`, `imageCategoryDetail`
- `aiConfigList`

Changed files:

- `src/api/productImage.js`
- `src/api/aiConfig.js`
- `src/views/commerce/productImage/**`
- `src/views/commerce/imageCategory/**`
- `src/views/commerce/aiConfig/**`
- `src/router/routes.js`
- `scripts/sync-admin-menu.mjs`
- `docs/dynamic-menu-sync.md`
- `docs/api-integration-progress.md`
- `docs/interface-list.md`

Notes:

- Swagger was rechecked on 2026-08-12. Lists use the shared `pageIndex/pageSize/pageData/recordCount` contract and expose every documented query field.
- The product image form submits the documented `categoryIdList`, `productIdList`, `img`, `imgThumb`, `title`, and `content` fields. Original uploads in add/edit mode call `/Common/setFileUpload` with query `isUploadThumb=1`; returned `urlThumb` becomes `imgThumb`, remains replaceable through the thumbnail upload field, and falls back to the original URL only when no thumbnail URL is available.
- AI configuration has no detail endpoint in Swagger, so editing uses the selected list row in a dedicated dialog.
- The menu declaration keeps the sidebar-compatible two-level navigation shape and includes every operation permission code from the interface checklist.

Verification:

- `node --check` passed for `src/api/oss.js` and `useProductImageForm.js`, and `npm run build` passed after adding the official-gallery thumbnail upload flow on 2026-08-12.
- Backend menu preview/write still requires `BOLTFOX_USER_TOKEN` in the target environment. Run `npm run menu:sync:commerce -- --apply --update` to add the new nodes and migrate the old product menu names.

### 管理后台-产品版本控制接口

Status: Completed

Implemented API wrappers:

- `POST /ProductVersion/addProductVersion`
- `POST /ProductVersion/deleteProductVersion`
- `POST /ProductVersion/editProductVersion`
- `GET /ProductVersion/getUserDeviceVersionDetail`
- `GET /ProductVersion/getProductVersionList`
- `POST /ProductVersion/setProductVersionVerify`

Added UI routes:

- `productVersion`
- `productVersionDetail`

Changed files:

- `src/api/productVersion.js`
- `src/views/sms/productVersion/index.vue`
- `src/views/sms/productVersion/detail.vue`
- `src/router/routes.js`
- `docs/api-integration-progress.md`
- `docs/interface-list.md`

Notes:

- The 2026-06-11 interface checklist changes product version detail from `/ProductVersion/getProductVersionDetail` to `/ProductVersion/getUserDeviceVersionDetail`.
- The machine-readable Swagger source still listed `/ZoneAdmin/ProductVersion/getProductVersionDetail` when checked on 2026-06-11, so this change follows the provided latest checklist.

Verification:

- `npm run build` passed.

Pending:

- Confirm next module before continuing.

### 管理后台-产品相关接口

Status: Completed

Implemented API wrappers:

- `POST /Product/addProduct`
- `POST /Product/addProductFaq`
- `POST /Product/editProduct`
- `POST /Product/editProductFaq`
- `GET /Product/getProductDetail`
- `GET /Product/getProductFaqDetail`
- `GET /Product/getProductFaqList`
- `GET /Product/getProductList`
- `GET /Product/getUserProductList`
- `POST /Product/setProductFaqVerify`
- `POST /Product/setProductVerify`

Changed files:

- `src/api/productList.js`
- `src/views/sms/productList/index.vue`
- `src/views/sms/productList/template/DetailForm.vue`
- `src/views/sms/productFaqList/index.vue`
- `src/views/sms/userProductList/index.vue`
- `src/router/routes.js`
- `docs/api-integration-progress.md`

Notes:

- Product form fields now match Swagger product input fields and no longer submits unsupported product manual file fields.
- Product FAQ list uses Swagger-supported language/status/date filters and corrected permission keys.
- User product list route is now registered under `/sms/userProductList`.

Verification:

- `npm run build` passed.

Pending:

- Confirm next module before continuing.

### 管理后台-登录

Status: Completed

Implemented API wrappers:

- `POST /Passport/adminLogin`

Changed files:

- `src/api/login.js`
- `src/store/modules/user.js`
- `src/views/login/index.vue`
- `docs/api-integration-progress.md`

Notes:

- Login payload now uses Swagger fields `adminName` and md5 `password`.
- Login success handling stores `adminToken`, `trueName`, `adminName`, and `isSysAdmin` from Swagger response fields.
- Permission navigation/admin wrappers in `src/api/login.js` were reviewed in the Permission module pass; Common wrappers are handled in the Common pass.

Verification:

- `npm run build` passed.

Pending:

- Confirm next module before continuing.

### 管理后台-权限

Status: Completed

Implemented API wrappers:

- `GET /Jurisdiction/getAdminAppliByRole`
- `GET /Jurisdiction/getAdminAppliBySys`
- `GET /Jurisdiction/getAdminAppliDetails`
- `GET /Jurisdiction/getAdminStaffByRole`
- `GET /Jurisdiction/getAdminStaffBySys`
- `GET /Jurisdiction/getAdminStaffDetails`
- `GET /Jurisdiction/getAdminStaffs`
- `GET /Jurisdiction/getAdminSystems`
- `GET /Jurisdiction/getAdminSystemsDetails`
- `GET /Jurisdiction/getChildAppCodes`
- `GET /Jurisdiction/getDepartments`
- `GET /Jurisdiction/getLeftMenus`
- `GET /Jurisdiction/getRoleByAdminStaff`
- `GET /Jurisdiction/getRoleBySystem`
- `GET /Jurisdiction/getRoleDetails`
- `GET /Jurisdiction/getRoles`
- `GET /Jurisdiction/getSysMenus`
- `POST /Jurisdiction/setAdminAppli`
- `POST /Jurisdiction/setAdminAppliByRole`
- `POST /Jurisdiction/setAdminStaff`
- `POST /Jurisdiction/setAdminStaffBindRoles`
- `POST /Jurisdiction/setAdminStaffVerify`
- `POST /Jurisdiction/setAdminSystemBindRoles`
- `POST /Jurisdiction/setAdminSystems`
- `POST /Jurisdiction/setAdminSystemsVerify`
- `POST /Jurisdiction/setDelAdminAppli`
- `POST /Jurisdiction/setDelAdminStaff`
- `POST /Jurisdiction/setDelDepartment`
- `POST /Jurisdiction/setDelRole`
- `POST /Jurisdiction/setDepartment`
- `POST /Jurisdiction/setRole`
- `POST /Jurisdiction/setRoleVerify`

Changed files:

- `src/api/login.js`
- `src/api/menu.js`
- `src/api/role.js`
- `src/views/ums/menuList/index.vue`
- `src/views/ums/department/index.vue`
- `src/router/routes.js`
- `docs/api-integration-progress.md`

Notes:

- Added the missing `getAdminSystemsDetails` wrapper and use it when editing system/menu records.
- System/menu form now submits Swagger-required `systemCode`.
- Removed unused old `/role/*` wrappers and unused `/Common/getKeyValues` wrapper.
- Removed unsupported `/ums/area` route; area source files remain for Common-module cleanup.

Verification:

- `npm run build` passed.

Pending:

- Confirm next module before continuing.

### 管理后台-通用相关接口

Status: Completed

Implemented API wrappers:

- `GET /Common/getConfigDataList`
- `GET /Common/getStatisticsUser`
- `GET /Common/getUserCount`
- `POST /Common/setConfigDataEdit`
- `POST /Common/setFileUpload`

Changed files:

- `src/api/config.js`
- `src/api/home.js`
- `src/api/oss.js`
- `src/components/Upload/FileUpload.vue`
- `src/components/Upload/MultiUpload.vue`
- `src/components/Upload/utils.js`
- `src/utils/request.js`
- `src/views/home/index.vue`
- `src/views/ums/config/index.vue`
- `docs/api-integration-progress.md`

Removed files:

- `src/api/areaSettings.js`
- `src/views/ums/area/index.vue`
- `src/utils/ali-oss.js`

Notes:

- `FormData` POST requests now append `randomString`, `sign`, and `userToken` as multipart fields.
- Upload components now submit backend `fileParam` form-data and continue to expose `{ name, url }[]` via `v-model`.
- Home statistics now match Swagger fields `userCount`, `userBindProductCount`, `orderAmount`, `productCount`, and `productFaqCount`, with registration statistics loaded from `getStatisticsUser`.
- Removed unsupported area settings API/page and old unsupported TMS statistics wrappers.

Verification:

- `npm run build` passed.

Pending:

- Confirm next module before continuing.

### 管理后台-用户产品图片控制接口

Status: Completed

Implemented API wrappers:

- `POST /UserProductImg/addUserProductImg`
- `POST /UserProductImg/deleteUserProductImg`
- `POST /UserProductImg/editUserProductImg`
- `GET /UserProductImg/getUserProductImgDetail`
- `GET /UserProductImg/getUserProductImgList`
- `POST /UserProductImg/setUserProductImgVerify`

Added UI routes:

- `userProductImage`

Changed files:

- `src/api/userProductImage.js`
- `src/views/sms/userProductImage/index.vue`
- `src/router/routes.js`
- `docs/api-integration-progress.md`

Notes:

- Added a user product image list page with Swagger-supported filters: device ID keyword, date range, language, user ID, product ID, and status.
- Added create/edit dialog using `MultiUpload`; the form submits `img` as the uploaded URL and uses `uProductImgId` when editing.
- Added delete and verify status operations through the dedicated `/UserProductImg/*` endpoints.

Verification:

- `npm run build` passed.

Pending:

- Confirm next module before continuing.

### 管理后台-用户相关接口

Status: Completed

Implemented API wrappers:

- `GET /User/getUserDetail`
- `GET /User/getUserList`
- `GET /User/getUserListExcel`
- `GET /User/getOperatUserAccountLog`
- `POST /User/setUserInfo`
- `POST /User/setUserAccount`
- `POST /User/setUserVerify`

Changed files:

- `src/api/userList.js`
- `src/views/sms/userList/index.vue`
- `src/views/sms/userList/accountLogs.vue`
- `src/views/sms/userList/components/UserAccountEditor.vue`
- `src/views/sms/userList/template/DetailForm.vue`
- `src/router/routes.js`
- `docs/api-integration-progress.md`

Notes:

- Removed unsupported `getUserDetailsOrders` wrapper.
- User list now supports Swagger filters: keyword, date range, language, terminal, and status.
- User list displays all three token-account fields, hides the country columns, and exposes permission-controlled available-token editing.
- Account operation logs can be opened globally or for a single user through the hidden `userAccountLogs` route.
- Export uses `/User/getUserListExcel` with the current supported filters.
- Edit submits only Swagger-supported fields: `userId`, `nickName`, `userEmail`, and optional md5 `password`.
- Detail/edit page displays non-editable detail fields from `UserDetailApiOut`.

Verification:

- `npm run build` passed.

Pending:

- Confirm next module before continuing.
