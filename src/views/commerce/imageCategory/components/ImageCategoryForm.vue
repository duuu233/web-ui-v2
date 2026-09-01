<script setup name="ImageCategoryForm">
import PageHeader from '@/components/PageHeader/index.vue'
import { getVerifyTagType } from '@/views/commerce/utils'
import { useImageCategoryForm } from '../useImageCategoryForm'

const props = defineProps({
  mode: {
    type: String,
    required: true,
    validator: value => ['add', 'edit', 'detail'].includes(value)
  }
})

const {
  formRef,
  formData,
  loading,
  submitting,
  rules,
  isAdd,
  isReadOnly,
  pageTitle,
  submitForm,
  backToList
} = useImageCategoryForm(props.mode)

const localizedNameFields = [
  { locale: '简中', field: 'categoryName', placeholder: '例如：节日海报' },
  {
    locale: '英语',
    field: 'categoryNameEnglish',
    placeholder: 'Enter the category name'
  },
  { locale: '繁中', field: 'categoryNameeFan', placeholder: '請輸入繁中分類名稱' },
  {
    locale: '日文',
    field: 'categoryNameJapanese',
    placeholder: '日本語のカテゴリ名を入力してください'
  }
]
</script>

<template>
  <div class="app-container">
    <PageHeader :title="pageTitle" icon="CollectionTag">
      <template v-if="!isAdd && formData.verify !== null" #extra>
        <el-tag :type="getVerifyTagType(formData.verify)" effect="light" round>
          {{ Number(formData.verify) === 1 ? '启用中' : '已禁用' }}
        </el-tag>
      </template>
    </PageHeader>

    <el-card v-loading="loading" class="category-card" shadow="never">
      <div class="category-intro">
        <span class="category-intro__mark">LIBRARY TAXONOMY</span>
        <h2 class="category-intro__title">组织公共图库内容</h2>
        <p class="category-intro__description">
          四语种分类名称会用于图库内容归档与前端展示，请保持简洁且含义明确。
        </p>
      </div>

      <el-form
        ref="formRef"
        class="category-form"
        :model="formData"
        :rules="rules"
        label-position="top"
        size="default"
      >
        <el-form-item
          v-for="item in localizedNameFields"
          :key="item.field"
          :label="`分类名称（${item.locale}）`"
          :prop="item.field"
        >
          <el-input
            v-model="formData[item.field]"
            :disabled="isReadOnly"
            maxlength="20"
            :placeholder="item.placeholder"
            show-word-limit
          />
        </el-form-item>

        <div class="form-actions">
          <el-button @click="backToList">返回列表</el-button>
          <el-button
            v-if="!isReadOnly"
            type="primary"
            :loading="submitting"
            @click="submitForm"
          >
            保存分类
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.category-card {
  margin-top: 12px;
  border-color: var(--app-border);
}

.category-card :deep(.el-card__body) {
  display: grid;
  grid-template-columns: minmax(240px, 0.72fr) minmax(320px, 1.28fr);
  gap: 48px;
  padding: 34px;
}

.category-intro {
  padding: 6px 0 28px 18px;
  border-left: 3px solid var(--brand-logo);
}

.category-intro__mark {
  color: var(--brand-600);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.category-intro__title {
  margin: 10px 0 0;
  color: var(--app-ink);
  font-size: 20px;
  font-weight: 720;
}

.category-intro__description {
  max-width: 360px;
  margin: 10px 0 0;
  color: var(--app-text);
  font-size: 13px;
  line-height: 1.8;
}

.category-form {
  max-width: 560px;
}

.field-control {
  width: 100%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid var(--app-border);
}

@media (max-width: 760px) {
  .category-card :deep(.el-card__body) {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 24px;
  }
}
</style>
