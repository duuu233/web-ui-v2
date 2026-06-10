# API Integration Progress

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
| Common | 管理后台-通用相关接口 | Completed | Home stats, config, and upload now use `/Common/*`; unsupported area/TMS common APIs removed. |
| User product image | 管理后台-用户产品图片控制接口 | Completed | Added `/UserProductImg/*` API wrappers, list route, and CRUD/status UI. |
| User | 管理后台-用户相关接口 | Completed | User list, detail, edit, export, and status now align with `/User/*`. |

## Completed Work

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

### 管理后台-产品版本控制接口

Status: Completed

Implemented API wrappers:

- `POST /ProductVersion/addProductVersion`
- `POST /ProductVersion/deleteProductVersion`
- `POST /ProductVersion/editProductVersion`
- `GET /ProductVersion/getProductVersionDetail`
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
- Home statistics now match Swagger fields `userCount`, `productCount`, and `productFaqCount`, with registration statistics loaded from `getStatisticsUser`.
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
- `POST /User/setUserInfo`
- `POST /User/setUserVerify`

Changed files:

- `src/api/userList.js`
- `src/views/sms/userList/index.vue`
- `src/views/sms/userList/template/DetailForm.vue`
- `docs/api-integration-progress.md`

Notes:

- Removed unsupported `getUserDetailsOrders` wrapper.
- User list now supports Swagger filters: keyword, date range, language, terminal, and status.
- Export uses `/User/getUserListExcel` with the current supported filters.
- Edit submits only Swagger-supported fields: `userId`, `nickName`, `userEmail`, and optional md5 `password`.
- Detail/edit page displays non-editable detail fields from `UserDetailApiOut`.

Verification:

- `npm run build` passed.

Pending:

- Confirm next module before continuing.
