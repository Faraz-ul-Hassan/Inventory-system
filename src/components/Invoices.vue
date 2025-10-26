<script setup>
import { ref, onMounted } from 'vue'
import { addInvoice, getAllInvoices, deleteInvoice, getAllCustomers, getAllProducts } from '../idb'

const customerId = ref('')
const productId = ref('')
const quantity = ref(1)
const invoices = ref([])
const customers = ref([])
const products = ref([])

async function loadInvoices() {
  invoices.value = await getAllInvoices()
}

async function loadData() {
  customers.value = await getAllCustomers()
  products.value = await getAllProducts()
  await loadInvoices()
}

onMounted(loadData)

async function addInvoiceHandler() {
  if (!customerId.value || !productId.value || !quantity.value) return

  const customer = customers.value.find(c => c.id === parseInt(customerId.value))
  const product = products.value.find(p => p.id === parseInt(productId.value))

  const total = product.price * quantity.value

  const invoice = {
    customerId: customer.id,
    customerName: customer.name,
    productId: product.id,
    productName: product.name,
    price: product.price,
    quantity: quantity.value,
    total
  }

  await addInvoice(invoice)
  customerId.value = productId.value = ''
  quantity.value = 1
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
      <select v-model="customerId" class="form-select mb-2">
        <option value="">Select Customer</option>
        <option v-for="c in customers" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>

      <select v-model="productId" class="form-select mb-2">
        <option value="">Select Product</option>
        <option v-for="p in products" :key="p.id" :value="p.id">
          {{ p.name }} - {{ p.price }} PKR
        </option>
      </select>

      <input v-model.number="quantity" type="number" min="1" class="form-control mb-2" placeholder="Quantity" />
      <button class="btn btn-success w-100">Add Invoice</button>
    </form>

    <ul class="list-group">
      <li
        v-for="inv in invoices"
        :key="inv.id"
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <div>
          <strong>{{ inv.customerName }}</strong> bought
          <em>{{ inv.productName }}</em> × {{ inv.quantity }}
          <br />
          <small>{{ inv.price }} × {{ inv.quantity }} = {{ inv.total }} PKR</small>
        </div>
        <button @click="deleteInvoiceHandler(inv.id)" class="btn btn-danger btn-sm">Delete</button>
      </li>
    </ul>
  </div>
</template>
