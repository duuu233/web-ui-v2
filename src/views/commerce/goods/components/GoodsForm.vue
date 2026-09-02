<script setup name="GoodsForm">
import PageHeader from '@/components/PageHeader/index.vue'
import { getCurrencyLabel, getVerifyTagType } from '@/views/commerce/utils'
import { useGoodsForm } from '../useGoodsForm'

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
} = useGoodsForm(props.mode)

const localizedGoodsFields = [
  {
    locale: '简中',
    language: 2,
    nameField: 'goodsName',
    amountField: 'amount',
    placeholder: '例如：30 元 / 3000 Token'
  },
  {
    locale: '英语',
    language: 1,
    nameField: 'goodsNameEnglish',
    amountField: 'amountEnglish',
    placeholder: 'Enter the English product name'
  },
  {
    locale: '繁中',
    language: 3,
    nameField: 'goodsNameFan',
    amountField: 'amountFan',
    placeholder: '請輸入繁中商品名稱'
  },
  {
    locale: '日文',
    language: 4,
    nameField: 'goodsNameJapanese',
    amountField: 'amountJapanese',
    placeholder: '日本語の商品名を入力してください'
  }
]
</script>

<template>
  <div class="app-container">
    <PageHeader :title="pageTitle" icon="Goods">
      <template v-if="!isAdd && formData.verify !== null" #extra>
        <el-tag :type="getVerifyTagType(formData.verify)" effect="light" round>
          {{ Number(formData.verify) === 1 ? '启用中' : '已禁用' }}
        </el-tag>
      </template>
    </PageHeader>

    <el-card v-loading="loading" class="goods-form-card" shadow="never">
      <el-form ref="formRef" :model="formData" :rules="rules" label-position="top" size="default">
        <section class="form-section">
          <div class="section-heading">
            <span class="section-index">01</span>
            <div>
              <h2 class="section-title">商品基础信息</h2>
              <p class="section-description">配置四语种商品名称、对应售价、Token 发放量与列表排序。</p>
            </div>
          </div>

          <div class="form-rows">
            <div v-for="item in localizedGoodsFields" :key="item.locale" class="form-row form-row--pair">
              <el-form-item class="form-field" :label="`商品名称（${item.locale}）`" :prop="item.nameField">
                <el-input v-model="formData[item.nameField]" :disabled="isReadOnly" maxlength="30"
                  :placeholder="item.placeholder" show-word-limit />
              </el-form-item>

              <el-form-item class="form-field" :label="`商品金额（${item.locale}）`" :prop="item.amountField">
                <div class="amount-field">
                  <el-input-number v-model="formData[item.amountField]" class="number-input" :disabled="isReadOnly"
                    :min="0.01" :max="99999999" :precision="2" :step="0.01" controls-position="right" />
                  <span class="amount-field__currency">{{ getCurrencyLabel(item.language) }}</span>
                </div>
              </el-form-item>
            </div>

            <div class="form-row">
              <el-form-item class="form-field" label="基础 Token 数量" prop="num">
                <el-input-number v-model="formData.num" class="number-input" :disabled="isReadOnly" :min="1"
                  :max="2147483647" :precision="0" controls-position="right" />
              </el-form-item>
            </div>

            <div class="form-row">
              <el-form-item class="form-field" label="赠送 Token 数量" prop="giveNum">
                <el-input-number v-model="formData.giveNum" class="number-input" :disabled="isReadOnly" :min="0"
                  :max="2147483647" :precision="0" controls-position="right" />
              </el-form-item>
            </div>

            <div class="form-row">
              <el-form-item class="form-field" label="商品权重" prop="grade">
                <el-input-number v-model="formData.grade" class="number-input" :disabled="isReadOnly" :min="0"
                  :max="2147483647" :precision="0" controls-position="right" />
              </el-form-item>
            </div>
          </div>
        </section>

        <section class="form-section form-section--platform">
          <div class="section-heading">
            <span class="section-index">02</span>
            <div>
              <h2 class="section-title">支付平台映射</h2>
              <p class="section-description">对应微信与 Apple 平台后台配置的产品标识。</p>
            </div>
          </div>

          <div class="form-rows">
            <div class="form-row">
              <el-form-item class="form-field" label="微信产品 ID" prop="wxProductId">
                <el-input v-model="formData.wxProductId" :disabled="isReadOnly" maxlength="100"
                  placeholder="请输入微信平台产品 ID" />
              </el-form-item>
            </div>

            <div class="form-row">
              <el-form-item class="form-field" label="Apple 产品 ID" prop="appleProductId">
                <el-input v-model="formData.appleProductId" :disabled="isReadOnly" maxlength="100"
                  placeholder="请输入 Apple 平台产品 ID" />
              </el-form-item>
            </div>
          </div>
        </section>

        <div class="form-actions">
          <el-button @click="backToList">返回列表</el-button>
          <el-button v-if="!isReadOnly" type="primary" :loading="submitting" @click="submitForm">
            {{ isAdd ? '创建商品' : '保存修改' }}
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.goods-form-card {
  margin-top: 14px;
}

.goods-form-card :deep(.el-card__body) {
  padding: 0;
}

.form-section {
  padding: 28px 30px 30px;
}

.form-section--platform {
  border-top: 1px solid var(--app-border);
  background: var(--app-surface-muted);
}

.section-heading {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 24px;
}

.section-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--brand-200);
  border-radius: 10px;
  color: var(--brand-600);
  background: var(--brand-50);
  font-size: 12px;
  font-weight: 700;
}

.section-title {
  color: var(--app-ink);
  font-size: 16px;
  font-weight: 700;
  line-height: 20px;
}

.section-description {
  margin-top: 4px;
  color: var(--app-text);
  font-size: 12px;
}

/* 每组表单独占一行；语种的名称与金额作为一组并排显示。 */
.form-rows {
  display: flex;
  max-width: 840px;
  flex-direction: column;
}

.form-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0 20px;
}

.form-row--pair {
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
}

.form-field {
  min-width: 0;
}

.amount-field {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
}

.amount-field__currency {
  flex: 0 0 auto;
  color: var(--app-text);
  font-size: 13px;
}

.number-input {
  width: 100%;
  min-width: 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 18px 30px;
  border-top: 1px solid var(--app-border);
  background: var(--app-surface);
}

@media (max-width: 680px) {
  .form-section {
    padding: 22px 18px;
  }

  .form-row--pair {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
