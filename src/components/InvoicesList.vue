<script setup>
import { ref, onMounted, watch } from 'vue'
import {
  addInvoice,
  getAllInvoices,
  deleteInvoice,
  getAllCustomers,
  getAllProducts,
  updateProductQuantity,
  addCustomer
} from '../idb'

const customerId = ref('')
const productSelections = ref([{ productId: '', quantity: 1 }])
const invoices = ref([])
const customers = ref([])
const products = ref([])
const selectedProductQty = ref(0)
const invoiceType = ref('')
const customerSearch = ref('')
const filteredCustomers = ref([])
const showCustomerList = ref(false)
const phone = ref('')

async function loadInvoices() {
  invoices.value = await getAllInvoices()
}

async function loadData() {
  customers.value = await getAllCustomers()
  products.value = await getAllProducts()
  await loadInvoices()
}

onMounted(loadData)

function addProductRow() {
  productSelections.value.push({ productId: '', quantity: 1 })
}

function removeProductRow(index) {
  productSelections.value.splice(index, 1)
}

watch(customerSearch, (val) => {
  if (!val) {
    filteredCustomers.value = []
    showCustomerList.value = false
    return
  }
  const searchTerm = val.toLowerCase()
  filteredCustomers.value = customers.value.filter((c) =>
    c.name.toLowerCase().includes(searchTerm)
  )
  showCustomerList.value = true
})

watch(
  () => productSelections.value.map((p) => p.productId),
  (newVal) => {
    const lastId = parseInt(newVal[newVal.length - 1])
    const product = products.value.find((p) => p.id === lastId)
    selectedProductQty.value = product ? product.quantity : 0
  }
)

async function selectCustomer(cust) {
  customerId.value = cust.id
  customerSearch.value = cust.name
  showCustomerList.value = false
}

async function addNewCustomer() {
  const name = customerSearch.value.trim()
  const phoneNumber = phone.value.trim()
  if (!name) return
  const newCust = { name, phone: phoneNumber }
  const id = await addCustomer(newCust)
  const addedCustomer = { id, ...newCust }
  customers.value.push(addedCustomer)

  await selectCustomer(addedCustomer)
  phone.value = ''
}

async function addInvoiceHandler() {
  if (!customerId.value || productSelections.value.length === 0 || !invoiceType.value) return

  const customer = customers.value.find((c) => c.id === parseInt(customerId.value))
  if (!customer) return

  const invoiceProducts = []

  for (const selection of productSelections.value) {
    const product = products.value.find((p) => p.id === parseInt(selection.productId))
    if (!product) continue

    let price = product.salePrice;
    // ✅ Correct inventory logic
    if (invoiceType.value === 'purchaser') {
      // You purchased items → stock increases
      product.quantity += selection.quantity
      price = product.purchasePrice;
      await updateProductQuantity(product.id, product.quantity)
    } else if (invoiceType.value === 'seller') {
      // You sold items → stock decreases
      if (selection.quantity > product.quantity) {
        alert(`Not enough stock for ${product.name}!`)
        continue
      }
      product.quantity -= selection.quantity
      await updateProductQuantity(product.id, product.quantity)
    }

    invoiceProducts.push({
      productId: product.id,
      productName: product.name,
      price: price,
      quantity: selection.quantity,
      stock: product.quantity,
      total: price * selection.quantity
    })
  }

  const invoice = {
    customerId: customer.id,
    customerName: customer.name,
    type: invoiceType.value,
    products: invoiceProducts,
    total: invoiceProducts.reduce((sum, p) => sum + p.total, 0)
  }

  await addInvoice(invoice)

  // Reset form
  customerId.value = ''
  invoiceType.value = ''
  productSelections.value = [{ productId: '', quantity: 1 }]
  await loadInvoices()
}

async function deleteInvoiceHandler(id) {
  await deleteInvoice(id)
  await loadInvoices()
}
</script>

<template>
  <div class="container mt-4">
    <h3 class="mb-3">Invoices</h3>

    <form @submit.prevent="addInvoiceHandler" class="mb-3">
      <select v-model="invoiceType" class="form-select mb-2" required>
        <option value="" disabled>Select Invoice Type</option>
        <option value="seller">Sales (You Sell)</option>
        <option value="purchaser">Purchase (You Buy)</option>
      </select>

      <div class="position-relative mb-2">
        <input
          v-model="customerSearch"
          type="text"
          class="form-control"
          placeholder="Search or Add Customer"
          @focus="showCustomerList = true"
        />

        <ul
          v-if="showCustomerList && filteredCustomers.length"
          class="list-group position-absolute w-100"
          style="z-index: 1000; max-height: 150px; overflow-y: auto;"
        >
          <li
            v-for="c in filteredCustomers"
            :key="c.id"
            class="list-group-item list-group-item-action"
            @click="selectCustomer(c)"
          >
            {{ c.name }} ({{ c.phone }})
          </li>
        </ul>

        <div v-else-if="showCustomerList && customerSearch" class="position-relative w-100">
          <input
            v-model="phone"
            class="form-control mb-2"
            placeholder="Enter phone number"
          />
          <li
            class="list-group-item list-group-item-action text-success"
            @click="addNewCustomer"
          >
            ➕ Add "{{ customerSearch }}"
          </li>
        </div>
      </div>

      <div
        v-for="(selection, index) in productSelections"
        :key="index"
        class="d-flex gap-2 align-items-center mb-2"
      >
        <select v-model="selection.productId" class="form-select">
          <option value="">Select Product</option>
          <option v-for="p in products" :key="p.id" :value="p.id">
            {{ p.name }} - {{ p.price }} PKR (Stock: {{ p.quantity }})
          </option>
        </select>

        <input
          v-model.number="selection.quantity"
          type="number"
          min="1"
          class="form-control w-25"
          placeholder="Qty"
        />

        <button
          type="button"
          class="btn btn-outline-danger btn-sm"
          @click="removeProductRow(index)"
          v-if="productSelections.length > 1"
        >
          ×
        </button>
      </div>

      <div class="d-flex justify-content-end mb-2">
        <button type="button" class="btn btn-outline-primary" @click="addProductRow">
          Add More Products
        </button>
      </div>

      <button class="btn btn-success w-100">Add Invoice</button>
    </form>

    <div class="row">
      <div v-for="inv in invoices" :key="inv.id" class="col-12 col-md-6 col-lg-3 mb-3">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">{{ inv.customerName }}</h5>
            <h6 class="card-subtitle mb-2 text-muted">
              {{ inv.type === 'seller' ? 'Sold' : 'Purchased' }}
            </h6>
            <ul class="list-unstyled mb-2">
              <li v-for="p in inv.products" :key="p.productId">
                → {{ p.productName }} × {{ p.quantity }} = {{ p.total }} PKR
              </li>
            </ul>
            <p class="fw-bold">Total: {{ inv.total }} PKR</p>
          </div>
          <div class="card-footer d-flex gap-2 justify-content-end">
            <button class="btn btn-warning">Edit</button>
            <button @click="deleteInvoiceHandler(inv.id)" class="btn btn-danger btn-sm">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
