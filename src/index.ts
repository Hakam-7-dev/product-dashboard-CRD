// ================== TYPES ==================
interface Product {
  id?: number;
  title: string;
  price: number;
  category: string;
}

// ================== API LAYER ==================
class ProductAPI {
  private readonly baseUrl: string = "https://zzgiqrjbpbxmdtqjiqft.supabase.co/rest/v1/products";
  private readonly headers: Record<string, string> = {
    apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6Z2lxcmpicGJ4bWR0cWppcWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MTA2NzgsImV4cCI6MjA4MzI4NjY3OH0.qk4rMBF1gdMZJx_pkYY6sBKFlnUoelqeANbADAKAphM",
    Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6Z2lxcmpicGJ4bWR0cWppcWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MTA2NzgsImV4cCI6MjA4MzI4NjY3OH0.qk4rMBF1gdMZJx_pkYY6sBKFlnUoelqeANbADAKAphM",
    "Content-Type": "application/json",
    Prefer: "return=representation" // return created row
  };

  async getAll(): Promise<Product[]> {
    const res: Response = await fetch(`${this.baseUrl}?select=*`, { headers: this.headers });
    if (!res.ok) throw new Error("Failed to fetch products");
    const data: Product[] = await res.json();
    return data;
  }

  async create(product: Product): Promise<Product> {
    const body: Omit<Product, "id"> = { title: product.title, price: product.price, category: product.category };
    const res: Response = await fetch(this.baseUrl, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to create product");
    }

    const data: Product[] = await res.json();
    if(!data || !data[0]) throw new Error("No product returned after creation");
    return data[0];
  }

  async delete(id: number): Promise<void> {
    const res: Response = await fetch(`${this.baseUrl}?id=eq.${id}`, {
      method: "DELETE",
      headers: this.headers
    });
    if (!res.ok) throw new Error("Failed to delete product");
  }
}

// ================== DOM INPUTS ==================
class DomInputs {
  title: HTMLInputElement;
  price: HTMLInputElement;
  category: HTMLInputElement;

  constructor() {
    const titleInput = document.getElementById("title");
    const priceInput = document.getElementById("price");
    const categoryInput = document.getElementById("category");

    if (!(titleInput instanceof HTMLInputElement)) throw new Error("Missing title input");
    if (!(priceInput instanceof HTMLInputElement)) throw new Error("Missing price input");
    if (!(categoryInput instanceof HTMLInputElement)) throw new Error("Missing category input");

    this.title = titleInput;
    this.price = priceInput;
    this.category = categoryInput;
  }

  read(): Product {
    return {
      title: this.title.value.trim(),
      price: Number(this.price.value) || 0,
      category: this.category.value.trim()
    };
  }

  clear(): void {
    this.title.value = "";
    this.price.value = "";
    this.category.value = "";
  }
}

// ================== APP CONTROLLER ==================
class ProductApp {
  private api: ProductAPI = new ProductAPI();
  private dom: DomInputs = new DomInputs();
  private tbody: HTMLTableSectionElement;
  private submitBtn: HTMLButtonElement;
  private searchInput: HTMLInputElement;

  constructor() {
    const tbodyEl = document.querySelector("tbody");
    const submitBtnEl = document.getElementById("submit");
    const searchInputEl = document.getElementById("search");

    if (!(tbodyEl instanceof HTMLTableSectionElement)) throw new Error("Missing tbody element");
    if (!(submitBtnEl instanceof HTMLButtonElement)) throw new Error("Missing submit button");
    if (!(searchInputEl instanceof HTMLInputElement)) throw new Error("Missing search input");

    this.tbody = tbodyEl;
    this.submitBtn = submitBtnEl;
    this.searchInput = searchInputEl;

    this.submitBtn.addEventListener("click", () => this.handleAdd());
    this.tbody.addEventListener("click", (e: Event) => this.handleDeleteClick(e));
    this.searchInput.addEventListener("input", () => this.render());

    this.render();
  }

  // ---------- ADD PRODUCT ----------
  private async handleAdd(): Promise<void> {
    const product: Product = this.dom.read();
    if (!product.title || !product.category) return;

    try {
      await this.api.create(product);
      this.dom.clear();
      await this.render(); // refresh table immediately
    } catch (err: unknown) {
      console.error(err);
      alert("Error adding product: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  // ---------- DELETE PRODUCT ----------
  private async handleDeleteClick(e: Event): Promise<void> {
    const target = e.target;
    if (!(target instanceof HTMLButtonElement)) return; // type guard
    if (!target.classList.contains("delete")) return;

    const idStr = target.dataset.id;
    if (!idStr) return;

    const id: number = Number(idStr);
    try {
      await this.api.delete(id);
      await this.render();
    } catch (err: unknown) {
      console.error(err);
      alert("Error deleting product: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  // ---------- RENDER TABLE ----------
  private async render(): Promise<void> {
    try {
      const products: Product[] = await this.api.getAll();
      const query: string = this.searchInput.value.toLowerCase();

      const filtered: Product[] = products.filter((p) => p.title.toLowerCase().includes(query));

      this.tbody.innerHTML = "";

      filtered.forEach((p: Product, index: number) => {
        const tr: HTMLTableRowElement = document.createElement("tr");
        tr.innerHTML = `
          <td>${index + 1}</td>
          <td>${p.title}</td>
          <td>${p.price}$</td>
          <td>${p.category}</td>
          <td><button class="delete" data-id="${p.id}">Delete</button></td>
        `;
        this.tbody.appendChild(tr);
      });
    } catch (err: unknown) {
      console.error(err);
      this.tbody.innerHTML = `<tr><td colspan="5">Failed to load products</td></tr>`;
    }
  }
}

// ================== INIT APP ==================
new ProductApp();
