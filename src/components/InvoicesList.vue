  <script setup>

  import { ref, onMounted, watch } from 'vue'
  import { addInvoice, getAllInvoices, deleteInvoice, getAllCustomers, getAllProducts,
    updateProductQuantity
   } from '../idb'

  const customerId = ref('')
  const productId = ref('')
  const quantity = ref(1)
  const invoices = ref([])
  const customers = ref([])
  const products = ref([])
  const selectedProductQty = ref(0)
  const invoiceType = ref('')

  async function loadInvoices() {
    invoices.value = await getAllInvoices()
  }

  async function loadData() {
    customers.value = await getAllCustomers()
    products.value = await getAllProducts()
    await loadInvoices()
  }

  onMounted(loadData)

  watch(productId, id => {
    const product = products.value.find(p => p.id === parseInt(id))
    selectedProductQty.value = product ? product.quantity : 0
  })

  async function addInvoiceHandler() {
    if (!customerId.value || !productId.value || !quantity.value) return

    const customer = customers.value.find(c => c.id === parseInt(customerId.value))
    const product = products.value.find(p => p.id === parseInt(productId.value))

    if (invoiceType.value === 'seller') {
      product.quantity += quantity.value; // increment on seller (when buying)
      await updateProductQuantity(product.id, product.quantity);
    } else if (invoiceType.value === 'purchaser') {
      if (!product || quantity.value > product.quantity) {
        alert('Not enough stock!');
        return;
      }
      product.quantity -= quantity.value; // decrement on purchaser (for customers)
      await updateProductQuantity(product.id, product.quantity);
    }

    const total = product.price * quantity.value

    const invoice = {
      customerId: customer.id,
      customerName: customer.name,
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: quantity.value,
      stock: product.quantity,
      type: invoiceType.value,
      total
    }

    await addInvoice(invoice)
    customerId.value = productId.value = ''
    quantity.value = 1
    selectedProductQty.value = 0
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
          <option value="" disabled>Select Category</option>
          <option value="seller">Seller</option>
          <option value="purchaser">Purchaser</option>
        </select>

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
        <p v-if="selectedProductQty">Available: {{ selectedProductQty }}</p>

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
            <strong>{{ inv.customerName }}</strong>
            {{ inv.type === 'seller' ? 'Purchased' : 'Sold' }}
            <em>{{ inv.productName }}</em> × {{ inv.quantity }}
            <br />
            <small>{{ inv.price }} × {{ inv.quantity }} = {{ inv.total }} PKR</small>
          </div>
          <button @click="deleteInvoiceHandler(inv.id)" class="btn btn-danger btn-sm">Delete</button>
        </li>
      </ul>
    </div>
  </template>
