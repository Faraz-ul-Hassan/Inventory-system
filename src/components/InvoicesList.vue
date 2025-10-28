  <script setup>

  import { ref, onMounted, watch } from 'vue'
  import { addInvoice, getAllInvoices, deleteInvoice, getAllCustomers, getAllProducts,
    updateProductQuantity
   } from '../idb'

  const customerId = ref('')
  // const productId = ref('')
  // const quantity = ref(1)
  const productSelections = ref([{ productId: '', quantity: 1}])
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

  function addProductRow() {
    productSelections.value.push({ productId: '', quantity: 1})
  }

  function removeProductRow(index) {
    productSelections.value.splice(index, 1)
  }

  watch(
    () => productSelections.value.map(p => p.productId),
    (newVal) => {
      const lastId = parseInt(newVal[newVal.length - 1])
      const product = products.value.find(p => p.id === lastId)
      selectedProductQty.value = product ? product.quantity : 0
    }
  )

  async function addInvoiceHandler() {
    if (!customerId.value || productSelections.value.length === 0 || !invoiceType.value) return

    const customer = customers.value.find(c => c.id === parseInt(customerId.value))
    if (!customer) return

    // Create a single invoice object with all products
    const invoiceProducts = []

    for (const selection of productSelections.value) {
      const product = products.value.find(p => p.id === parseInt(selection.productId))
      if (!product) continue

      if (invoiceType.value === 'seller') {
        product.quantity += selection.quantity
        await updateProductQuantity(product.id, product.quantity)
      } else if (invoiceType.value === 'purchaser') {
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
        price: product.price,
        quantity: selection.quantity,
        stock: product.quantity,
        total: product.price * selection.quantity
      })
    }

    // Only add one invoice with multiple products
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
          <option value="" disabled>Select Category</option>
          <option value="seller">Seller</option>
          <option value="purchaser">Purchaser</option>
        </select>

        <select v-model="customerId" class="form-select mb-2">
          <option value="">Select Customer</option>
          <option v-for="c in customers" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>

        <div v-for="(selection, index) in productSelections" :key="index" class="d-flex gap-2 align-items-center mb-2">
            <select v-model="selection.productId" class="form-select">
              <option value="">Select Product</option>
              <option v-for="p in products" :key="p.id" :value="p.id">
                {{ p.name }} - {{ p.price }} PKR (Stock: {{ p.quantity }})
              </option>
            </select>

            <input v-model.number="selection.quantity" type="number" min="1" class="form-control w-25" placeholder="Qty" />

            <button type="button" class="btn btn-outline-danger btn-sm" @click="removeProductRow(index)" v-if="productSelections.length > 1">×</button>
        </div>

        <div class="d-flex justify-content-end mb-2">
          <button type="button" class="btn btn-outline-primary" @click="addProductRow">Add More Products</button>
        </div>

        <!-- <p v-if="selectedProductQty">Available: {{ selectedProductQty }}</p> -->

        <!-- <input v-model.number="quantity" type="number" min="1" class="form-control mb-2" placeholder="Quantity" /> -->
        <button class="btn btn-success w-100">Add Invoice</button>
      </form>
      <div class="row">
        <div v-for="inv in invoices" :key="inv.id" class="col-12 col-md-6 col-lg-3 mb-3">
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="card-title">{{ inv.customerName }}</h5>
              <h6 class="card-subtitle mb-2 text-muted">{{ inv.type === 'seller' ? 'Purchased' : 'Sold' }}</h6>
              <ul class="list-unstyled mb-2">
                <li v-for="p in inv.products" :key="p.productId">
                  -> {{ p.productName }} x {{ p.quantity }} = {{ p.total }}<br> ( -/{{ p.price }} )
                </li>
              </ul>
              <p class="fw-bold">Total: {{ inv.total }} PKR</p>
            </div>
            <div class="card-footer d-flex gap-2 justify-content-end">
              <button class="btn btn-warning">Edit</button>
              <button @click="deleteInvoiceHandler(inv.id)" class="btn btn-danger btn-sm">Delete</button>
            </div>
          </div>
        </div>
      </div>
      <!-- <ul class="list-group">
        <li
          v-for="inv in invoices"
          :key="inv.id"
          class="list-group-item mx-2 shadow d-flex justify-content-between align-items-center"
        >
           <div>
            <strong>{{ inv.customerName }}</strong>
            {{ inv.type === 'seller' ? 'Purchased' : 'Sold' }}
            <em>{{ inv.productName }}</em> × {{ inv.quantity }}
            <br />
            <small>{{ inv.price }} × {{ inv.quantity }} = {{ inv.total }} PKR</small>
          </div> ->
          <div>
            <strong>{{ inv.customerName }}</strong> - {{ inv.type === 'seller' ? 'Purchased' : 'Sold' }}
            <ul class="list-unstyled mb-2">
              <li v-for="p in inv.products" :key="p.productId">
                {{ p.productName }} × {{ p.quantity }} @ {{ p.price }} PKR = {{ p.total }} PKR
              </li>
            </ul>
            <strong>Total: {{ inv.total }} PKR</strong>
          </div>
          <button class="btn btn-warning">Edit</button>
          <button @click="deleteInvoiceHandler(inv.id)" class="btn btn-danger btn-sm">Delete</button>
        </li>
      </ul> -->
    </div>
  </template>
