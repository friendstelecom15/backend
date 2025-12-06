/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Plus,
  Trash2,
  Check,
  ChevronsUpDown,
} from 'lucide-react';
import {withProtectedRoute} from '../../lib/auth/protected-route';
import {Card, CardContent, CardHeader, CardTitle} from '../../components/ui/card';
import {Button} from '../../components/ui/button';
import {Input} from '../../components/ui/input';
import {Textarea} from '../../components/ui/textarea';
import {Label} from '../../components/ui/label';
import {Switch} from '../../components/ui/switch';
import {Badge} from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '../../components/ui/command';
import {cn} from '../../lib/utils';

import productsService from '../../lib/api/services/products';
import categoriesService from '../../lib/api/services/categories';
import brandsService from '../../lib/api/services/brands'; // Assuming this exists

function AdminCreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{id: string; name: string}[]>([]);
  const [brands, setBrands] = useState<{id: string; name: string}[]>([]);
  
  // Form State
  const [productType, setProductType] = useState<'basic' | 'network' | 'region'>('basic');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    sku: '',
    productCode: '',
    price: '',
    stockQuantity: '',
    isActive: true,
    isOnline: true,
  });

  // Multi-select states
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  
  // UI States for Multi-select
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, brandsRes] = await Promise.all([
          categoriesService.getAll(),
          brandsService.getAll(),
        ]);
        setCategories(catsRes.filter((c: any) => c.id !== 'all'));
        setBrands(brandsRes);
      } catch (error) {
        console.error('Failed to fetch form data', error);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {name, value} = e.target;
    setFormData(prev => ({...prev, [name]: value}));
    
    // Auto-generate slug from name
    if (name === 'name' && !formData.slug) {
      setFormData(prev => ({
        ...prev, 
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      }));
    }
  };

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleBrand = (id: string) => {
    setSelectedBrandIds(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        ...formData,
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity),
        categoryIds: selectedCategoryIds,
        brandIds: selectedBrandIds,
        // The backend will auto-set productType based on the endpoint used, 
        // but we can also structure the DTO accordingly if needed.
        // For now, we'll use the specific service methods based on type.
      };

      // Depending on productType, we might call different endpoints
      if (productType === 'basic') {
        await productsService.createBasic(payload);
      } else if (productType === 'network') {
        await productsService.createNetwork(payload);
      } else if (productType === 'region') {
        await productsService.createRegion(payload);
      }

      router.push('/admin/products');
    } catch (error) {
      console.error('Failed to create product', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create Product</h1>
            <p className="text-muted-foreground">Add a new product to your inventory.</p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={loading} className="gap-2">
          <Save className="h-4 w-4" />
          {loading ? 'Saving...' : 'Save Product'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Product Type</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant={productType === 'basic' ? 'default' : 'outline'}
                    onClick={() => setProductType('basic')}
                    className="flex-1"
                  >
                    Basic
                  </Button>
                  <Button
                    type="button"
                    variant={productType === 'network' ? 'default' : 'outline'}
                    onClick={() => setProductType('network')}
                    className="flex-1"
                  >
                    Network
                  </Button>
                  <Button
                    type="button"
                    variant={productType === 'region' ? 'default' : 'outline'}
                    onClick={() => setProductType('region')}
                    className="flex-1"
                  >
                    Region
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {productType === 'basic' && 'Simple product with direct colors/variants.'}
                  {productType === 'network' && 'Product with network-specific variants (e.g. Locked/Unlocked).'}
                  {productType === 'region' && 'Product with region-specific variants (e.g. USA/Global).'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Product Name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" name="slug" value={formData.slug} onChange={handleInputChange} placeholder="product-slug" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Textarea id="shortDescription" name="shortDescription" value={formData.shortDescription} onChange={handleInputChange} rows={2} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={5} />
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Sections based on Type would go here */}
          {/* For now, keeping it simple as requested */}
        </div>

        {/* Right Column - Settings & Organization */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Categories Multi-Select */}
              <div className="space-y-2">
                <Label>Categories</Label>
                <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={categoryOpen}
                      className="w-full justify-between h-auto min-h-10 py-2"
                    >
                      {selectedCategoryIds.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {selectedCategoryIds.map(id => (
                            <Badge key={id} variant="secondary" className="mr-1">
                              {categories.find(c => c.id === id)?.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        "Select categories..."
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search category..." />
                      <CommandEmpty>No category found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {categories.map((category) => (
                          <CommandItem
                            key={category.id}
                            value={category.name}
                            onSelect={() => toggleCategory(category.id)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCategoryIds.includes(category.id) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {category.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Brands Multi-Select */}
              <div className="space-y-2">
                <Label>Brands</Label>
                <Popover open={brandOpen} onOpenChange={setBrandOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={brandOpen}
                      className="w-full justify-between h-auto min-h-10 py-2"
                    >
                      {selectedBrandIds.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {selectedBrandIds.map(id => (
                            <Badge key={id} variant="secondary" className="mr-1">
                              {brands.find(b => b.id === id)?.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        "Select brands..."
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search brand..." />
                      <CommandEmpty>No brand found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {brands.map((brand) => (
                          <CommandItem
                            key={brand.id}
                            value={brand.name}
                            onSelect={() => toggleBrand(brand.id)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedBrandIds.includes(brand.id) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {brand.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" name="sku" value={formData.sku} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productCode">Code</Label>
                  <Input id="productCode" name="productCode" value={formData.productCode} onChange={handleInputChange} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price">Base Price</Label>
                <Input id="price" name="price" type="number" value={formData.price} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Stock Quantity</Label>
                <Input id="stockQuantity" name="stockQuantity" type="number" value={formData.stockQuantity} onChange={handleInputChange} />
              </div>
              <div className="flex items-center justify-between border-t pt-4">
                <Label htmlFor="isActive">Active Status</Label>
                <Switch 
                  id="isActive" 
                  checked={formData.isActive} 
                  onCheckedChange={(checked) => setFormData(prev => ({...prev, isActive: checked}))} 
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isOnline">Online Store</Label>
                <Switch 
                  id="isOnline" 
                  checked={formData.isOnline} 
                  onCheckedChange={(checked) => setFormData(prev => ({...prev, isOnline: checked}))} 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default withProtectedRoute(AdminCreateProductPage, {
  requiredRoles: ['admin'],
  fallbackTo: '/login',
});
