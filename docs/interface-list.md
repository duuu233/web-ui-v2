# Interface Checklist

> Document type: API contract checklist
> Status: Active
> Last verified: 2026-09-04
> Sources: manual module checklist, Swagger contracts, current API modules, and documented read-only samples

Source:

- Manual checklist image provided on 2026-06-11.
- Machine-readable Swagger checked on 2026-06-11: `https://api.boltfox.cn/v2/api-docs`.
- Goods and order Swagger contracts plus live read-only response samples rechecked on 2026-08-11.
- Public image library, image category, and AI configuration Swagger contracts rechecked on 2026-08-12.
- Home statistics and user account Swagger contracts plus live read-only samples rechecked on 2026-08-13.
- Home report presentation and configuration-form behavior rechecked against the current frontend on 2026-08-28; no new backend contract was claimed.
- List `language` filter values were clarified by the project owner on 2026-08-31.
- Goods, public-image, and image-category multilingual contracts were replaced by the project owner on 2026-09-01; one record now carries all four language variants.
- The order-detail `currencyName` output contract was clarified by the project owner on 2026-09-03.
- Public-image physical deletion, list-thumbnail presentation, and the add/edit `grade` weight field were clarified by the project owner and rechecked against Swagger on 2026-09-04.

Comparison result:

- The previously completed Swagger comparison exposed 78 `/ZoneAdmin/*` endpoints; the public-image delete endpoint was added afterward and was rechecked separately on 2026-09-04.
- Local `src/api` already covered all current Swagger `/ZoneAdmin/*` endpoints at the time of comparison.
- The manual checklist lists one newer route that current Swagger did not expose when checked: `/ZoneAdmin/ProductVersion/getUserDeviceVersionDetail`. The code follows the manual checklist for product version detail.

Backend prefix:

- Runtime API prefix is `/ZoneAdmin`.
- Code API wrappers omit this prefix because `VITE_APP_API_PREFIX` supplies it through `src/utils/request.js`.

Remaining list language filter contract:

- List filters whose current contracts still declare `language` use the frontend-fixed option set: `0=英语`, `1=英语`, `2=简中`, `3=繁中`, and `4=日文`.
- The value `0` is a valid filter value and must not be treated as an empty selection.
- Goods, public-image, and image-category list/add/edit interfaces no longer submit `language`.

Client boundary:

- `GET /Client/Order/getGoodsList` adds output field `currencySymbol`. This is a user-facing client contract and has no wrapper or caller in this PC-admin repository.

Currency presentation (frontend display rules, last confirmed by the project owner on 2026-09-03):

- Language maps to settlement currency as `0`/`1=美元 (USD, $)`, `2=人民币 (CNY, ¥)`, `3=美元 (USD, $)`, and `4=日元 (JPY, JP¥)`; a missing or unknown language falls back to CNY because the base `amount` field carries the Simplified-Chinese price.
- Order list and order detail prefix the amount with that symbol. When an order response carries a non-empty `currencySymbol`, the backend value wins over the language mapping.
- Order detail displays the backend `currencyName` as the currency name. For compatibility with older responses, a missing or blank value falls back to the language-based currency label.
- The language mapping lives in `src/views/commerce/utils.js` and remains a frontend display convention. The `currencyName` addition changes only the order-detail response contract; no request parameter changed.

## PC Admin Backend

| Area | Module | Feature | Interface / handling | Current status |
| --- | --- | --- | --- | --- |
| Basic public | File upload | Upload file | `POST /ZoneAdmin/Common/setFileUpload` | Done. `src/api/oss.js` appends `userToken` in the URL query, posts `fileParam`, and supports optional query `isUploadThumb`; official gallery original uploads pass `1` and consume returned `urlThumb`. |
| Home | Data aggregate display | User count, bound-device count, order amount, product/FAQ totals, and registration trend | `GET /ZoneAdmin/Common/getUserCount`, `GET /ZoneAdmin/Common/getStatisticsUser` | Done. `getUserCount` displays `userCount`, `userBindProductCount`, `orderAmount`, `productCount`, and `productFaqCount`; registration data is rendered as an ECharts column chart. |
| Home | Order statistics | Order-count trends for the last week, month, and year | `GET /ZoneAdmin/Common/getStatisticsOrder` | Done. Sends `queryType` (`0`, `1`, or `2`) and renders `{ queryDate, orderCount }[]` as an ECharts line chart. |
| User management | User list | Registered user list and token balances | `GET /ZoneAdmin/User/getUserList` | Done. Displays `totalToken`, `availableToken`, and `consumeToken`; country columns are intentionally hidden from the list. |
| User management | User account | Edit available token balance | `POST /ZoneAdmin/User/setUserAccount` | Done. Submits only `userId` and non-negative `availableToken`; the request layer appends authentication fields. |
| User management | Account operation log | All users or one user by ID | `GET /ZoneAdmin/User/getOperatUserAccountLog` | Done. Hidden local route: `userAccountLogs`; entry points exist in the user-list toolbar and each row. |
| User management | User device list | Activated device list by user dimension | `GET /ZoneAdmin/Product/getUserProductList` | Done. Route: `userProductList`. |
| Product management | Product list | Product list | Original interface: `GET /ZoneAdmin/Product/getProductList` | Done. |
| Product management | Product management | Add product | `POST /ZoneAdmin/Product/addProduct`; add `broadcastId`, remove old `productContent` and `productFile` params | Done. |
| Product management | Product management | Edit product | Original function: `POST /ZoneAdmin/Product/editProduct` | Done. |
| Product management | Product management | Enable/disable product | Original function: `POST /ZoneAdmin/Product/setProductVerify` | Done. |
| Product management | Product management | Product detail | Original function: `GET /ZoneAdmin/Product/getProductDetail` | Done. |
| Device version | Device version settings | Version list | `GET /ZoneAdmin/ProductVersion/getProductVersionList` | Done. |
| Device version | Device version settings | Version detail | `GET /ZoneAdmin/ProductVersion/getUserDeviceVersionDetail` | Done. This follows the manual checklist; current Swagger still listed `getProductVersionDetail` when checked. |
| Device version | Device version settings | Add version | `POST /ZoneAdmin/ProductVersion/addProductVersion` | Done. |
| Device version | Device version settings | Edit version | `POST /ZoneAdmin/ProductVersion/editProductVersion` | Done. |
| Device version | Device version settings | Enable/disable version | `POST /ZoneAdmin/ProductVersion/setProductVersionVerify` | Done. |
| Help management | Help content list | Upload/edit/delete by device dimension | Original interface set: `GET /ZoneAdmin/Product/getProductFaqList`, `GET /ZoneAdmin/Product/getProductFaqDetail`, `POST /ZoneAdmin/Product/addProductFaq`, `POST /ZoneAdmin/Product/editProductFaq`, `POST /ZoneAdmin/Product/setProductFaqVerify` | Done. |
| Commerce | Goods management | Goods list, detail, add, edit, enable/disable | `GET /ZoneAdmin/Goods/getGoodsList`, `GET /ZoneAdmin/Goods/getGoodsDetail`, `POST /ZoneAdmin/Goods/addGoods`, `POST /ZoneAdmin/Goods/editGoods`, `POST /ZoneAdmin/Goods/setGoodsVerify` | Done. Routes: `goodsList`, `goodsListAdd`, `goodsListEdit`, `goodsListDetail`. List/add/edit remove `language`; one record carries base `goodsName`/`amount` plus `goodsNameEnglish`, `goodsNameFan`, `goodsNameJapanese`, `amountEnglish`, `amountFan`, and `amountJapanese`, and the list exposes all variants. |
| Product management | Public image library | Image list, detail, add, edit, physical delete, enable/disable | `GET /ZoneAdmin/ProductImg/getProductImgList`, `GET /ZoneAdmin/ProductImg/getProductImgDetail`, `POST /ZoneAdmin/ProductImg/addProductImg`, `POST /ZoneAdmin/ProductImg/editProductImg`, `POST /ZoneAdmin/ProductImg/deleteProductImg`, `POST /ZoneAdmin/ProductImg/setProductImgVerify` | Done. Delete submits `{ id: productImgId }`, physically deletes the record, and cleans its OSS files. Routes: `productImageList`, `productImageAdd`, `productImageEdit`, `productImageDetail`. The list displays only `imgThumb` in its image column. List/add/edit remove `language`; one record carries base `title`/`content` plus the `English`, `Fan`, and `Japanese` variants, and the list exposes all variants. Add/edit submit the Swagger-declared `int32` weight field `grade`; the shared add/edit/detail form displays it, defaults to `0`, and keeps old detail responses usable when the field is absent. The applicable-product/device selection remains optional and submits an empty `productIdList` when omitted. The supplied `/AiConfig/getProductImgList` list path is treated as a documentation typo because the current module and backend contract use `/ProductImg/getProductImgList`. |
| Product management | Image categories | Category list, detail, add, edit, enable/disable | `GET /ZoneAdmin/ProductImg/getImgCategoryList`, `GET /ZoneAdmin/ProductImg/getImgCategoryDetail`, `POST /ZoneAdmin/ProductImg/addImgCategory`, `POST /ZoneAdmin/ProductImg/editImgCategory`, `POST /ZoneAdmin/ProductImg/setImgCategoryVerify` | Done. Routes: `imageCategoryList`, `imageCategoryAdd`, `imageCategoryEdit`, `imageCategoryDetail`. List/add/edit remove `language`; one record carries base `categoryName` plus `categoryNameEnglish`, contract-spelled `categoryNameeFan`, and `categoryNameJapanese`, and the list exposes all variants. The supplied `/AiConfig/getImgCategoryList` path is treated as a documentation typo because the current module and backend contract use `/ProductImg/getImgCategoryList`. |
| Commerce | Order management | Order list and detail | `GET /ZoneAdmin/Order/getOrderList`, `GET /ZoneAdmin/Order/getOrderDetail` | Done. Routes: `orderList`, `orderListDetail`. Detail displays the response `currencyName` and falls back to the language-based currency label when absent. |
| AI configuration | AI cost configuration | List, edit, enable/disable | `GET /ZoneAdmin/AiConfig/getAiConfigList`, `POST /ZoneAdmin/AiConfig/editAiConfig`, `POST /ZoneAdmin/AiConfig/setAiConfigVerify` | Done. Route: `aiConfigList`; list search supports content `language` values `1`–`4`; editing uses a list-row dialog because Swagger has no detail endpoint. |
| Basic configuration | System configuration | View and edit backend configuration data | `GET /ZoneAdmin/Common/getConfigDataList`, `POST /ZoneAdmin/Common/setConfigDataEdit` | Done. The platform device ID item is intentionally omitted from the form and from the save payload; other editable configuration items retain the existing behavior. |
| System settings | Backend permission settings | Permissions, roles, menus, departments | Original function: `/ZoneAdmin/Jurisdiction/*` | Done. |
| System settings | App version settings | App version upgrade | Original function: `/ZoneAdmin/AppVersion/*` | Done. |
