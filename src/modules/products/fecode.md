/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import {useState, useEffect} from 'react';
import productsService from '../../../lib/api/services/products';
import categoriesService from '../../../lib/api/services/categories';
import brandsService from '../../../lib/api/services/brands';
import Link from 'next/link';
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  GripVertical,
  Image as ImageIcon,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import {Button} from '../../../components/ui/button';
import {Input} from '../../../components/ui/input';
import {Label} from '../../../components/ui/label';
import {Textarea} from '../../../components/ui/textarea';
import {Switch} from '../../../components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {withProtectedRoute} from '../../../lib/auth/protected-route';

function NewProductPage() {
  // Basic product info
  const [productName, setProductName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [productCode, setProductCode] = useState('');

  // Rich text editor functions
  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const handleShortDescriptionChange = (e: React.FormEvent<HTMLDivElement>) => {
    setShortDescription(e.currentTarget.innerHTML);
  };
  const [sku, setSku] = useState('');
  const [warranty, setWarranty] = useState('');

  // Category and Brand
  const [categories, setCategories] = useState<{id: string; name: string}[]>(
    [],
  );
  const [brands, setBrands] = useState<{id: string; name: string}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');

  // Status flags
  const [isActive, setIsActive] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [isPos, setIsPos] = useState(true);
  const [isPreOrder, setIsPreOrder] = useState(false);
  const [isOfficial, setIsOfficial] = useState(false);
  const [freeShipping, setFreeShipping] = useState(false);
  const [isEmi, setIsEmi] = useState(false);

  // Reward & Booking
  const [rewardPoints, setRewardPoints] = useState('');
  const [minBookingPrice, setMinBookingPrice] = useState('');

  // SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [seoCanonical, setSeoCanonical] = useState('');
  const [tags, setTags] = useState('');

  // Direct Colors (region-independent for simple products like headphones, watches)
  interface DirectColorVariant {
    // Default pricing (shared by all colors)
    defaultPrice: string;
    defaultComparePrice: string;
    defaultDiscountPercent: string;
    defaultDiscountPrice: string;
    defaultStockQuantity: string;
    defaultLowStockAlert: string;
    
    // Colors with shared pricing
    colors: Array<{
      id: string;
      colorName: string;
      colorImage: string;
    }>;
    
    // Custom pricing overrides (for colors with different prices)
    customPricing: Array<{
      id: string;
      colorId: string;
      price: string;
      comparePrice: string;
      discountPercent: string;
      discountPrice: string;
      stockQuantity: string;
      lowStockAlert: string;
    }>;
  }
  const [directColorVariant, setDirectColorVariant] = useState<DirectColorVariant>({
    defaultPrice: '',
    defaultComparePrice: '',
    defaultDiscountPercent: '',
    defaultDiscountPrice: '',
    defaultStockQuantity: '',
    defaultLowStockAlert: '5',
    colors: [],
    customPricing: [],
  });

  // Networks → Colors → Storages → Prices
  const [networks, setNetworks] = useState<
    Array<{
      id: string;
      networkType: string;
      priceAdjustment: string;
      isDefault: boolean;
      colors: Array<{
        id: string;
        colorName: string;
        colorImage: string;
        hasStorage: boolean;
        singlePrice: string;
        singleComparePrice: string;
        singleStockQuantity: string;
        storages: Array<{
          id: string;
          storageSize: string;
          regularPrice: string;
          discountPrice: string;
          discountPercent: string;
          stockQuantity: string;
          lowStockAlert: string;
        }>;
      }>;
    }>
  >([]);

  // File uploads
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [galleryImageFiles, setGalleryImageFiles] = useState<File[]>([]);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState<
    Array<{
      url: string;
      altText: string;
      file: File;
    }>
  >([]);

  // Videos
  const [videos, setVideos] = useState<
    Array<{
      id: string;
      url: string;
      type: string;
    }>
  >([{id: 'video-1', url: '', type: 'youtube'}]);

  // Regions → Default Storages + Colors (with optional custom storages)
  const [regions, setRegions] = useState<
    Array<{
      id: string;
      regionName: string;
      isDefault: boolean;
      defaultStorages: Array<{
        id: string;
        storageSize: string;
        regularPrice: string;
        discountPrice: string;
        discountPercent: string;
        stockQuantity: string;
        lowStockAlert: string;
      }>;
      colors: Array<{
        id: string;
        colorName: string;
        colorImage: string;
        hasStorage: boolean;
        useDefaultStorages: boolean;
        singlePrice: string;
        singleComparePrice: string;
        singleStockQuantity: string;
        storages: Array<{
          id: string;
          storageSize: string;
          regularPrice: string;
          discountPrice: string;
          discountPercent: string;
          stockQuantity: string;
          lowStockAlert: string;
        }>;
      }>;
    }>
  >([
    {
      id: 'region-1',
      regionName: 'International',
      isDefault: true,
      defaultStorages: [
        {
          id: 'default-storage-1',
          storageSize: '256GB',
          regularPrice: '',
          discountPrice: '',
          discountPercent: '',
          stockQuantity: '',
          lowStockAlert: '5',
        },
      ],
      colors: [
        {
          id: 'color-1',
          colorName: 'Midnight',
          colorImage: '',
          hasStorage: true,
          useDefaultStorages: true,
          singlePrice: '',
          singleComparePrice: '',
          singleStockQuantity: '',
          storages: [],
        },
      ],
    },
  ]);

  // Specifications (flat list)
  const [specifications, setSpecifications] = useState<
    Array<{
      id: string;
      key: string;
      value: string;
    }>
  >([
    {id: 'spec-1', key: '', value: ''},
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Collapsible sections state
  const [isNetworksExpanded, setIsNetworksExpanded] = useState(true);
  const [isRegionsExpanded, setIsRegionsExpanded] = useState(true);

  // Fetch categories and brands
  useEffect(() => {
    categoriesService.getAll().then(data => {
      setCategories(
        data.map((c: any) => ({
          id: c.id,
          name: c.name,
        })),
      );
    });
    brandsService.findAll().then(data => {
      setBrands(data.map((b: any) => ({id: b.id, name: b.name})));
    });
  }, []);

  // Slugify helper
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

  const handleProductNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setProductName(newName);
    setSlug(prevSlug => {
      const prevAuto = slugify(productName);
      const newAuto = slugify(newName);
      if (prevSlug === prevAuto || prevSlug === '') {
        return newAuto;
      }
      return prevSlug;
    });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(slugify(e.target.value));
  };

  // Network management
  const addNetwork = () => {
    setNetworks([
      ...networks,
      {
        id: `network-${Date.now()}`,
        networkType: '',
        priceAdjustment: '0',
        isDefault: false,
        colors: [
          {
            id: `color-${Date.now()}`,
            colorName: '',
            colorImage: '',
            hasStorage: true,
            singlePrice: '',
            singleComparePrice: '',
            singleStockQuantity: '',
            storages: [
              {
                id: `storage-${Date.now()}`,
                storageSize: '',
                regularPrice: '',
                discountPrice: '',
                discountPercent: '',
                stockQuantity: '',
                lowStockAlert: '5',
              },
            ],
          },
        ],
      },
    ]);
  };

  const removeNetwork = (networkId: string) => {
    setNetworks(networks.filter(n => n.id !== networkId));
  };

  const updateNetwork = (networkId: string, field: string, value: any) => {
    setNetworks(
      networks.map(n => (n.id === networkId ? {...n, [field]: value} : n)),
    );
  };

  // Color management within network
  const addColorToNetwork = (networkId: string) => {
    setNetworks(
      networks.map(n =>
        n.id === networkId
          ? {
              ...n,
              colors: [
                ...n.colors,
                {
                  id: `color-${Date.now()}`,
                  colorName: '',
                  colorImage: '',
                  hasStorage: true,
                  singlePrice: '',
                  singleComparePrice: '',
                  singleStockQuantity: '',
                  storages: [
                    {
                      id: `storage-${Date.now()}`,
                      storageSize: '',
                      regularPrice: '',
                      discountPrice: '',
                      discountPercent: '',
                      stockQuantity: '',
                      lowStockAlert: '5',
                    },
                  ],
                },
              ],
            }
          : n,
      ),
    );
  };

  const removeColorFromNetwork = (networkId: string, colorId: string) => {
    setNetworks(
      networks.map(n =>
        n.id === networkId
          ? {...n, colors: n.colors.filter(c => c.id !== colorId)}
          : n,
      ),
    );
  };

  const updateColorInNetwork = (
    networkId: string,
    colorId: string,
    field: string,
    value: any,
  ) => {
    setNetworks(
      networks.map(n =>
        n.id === networkId
          ? {
              ...n,
              colors: n.colors.map(c =>
                c.id === colorId ? {...c, [field]: value} : c,
              ),
            }
          : n,
      ),
    );
  };

  // Storage management within network color
  const addStorageToNetwork = (networkId: string, colorId: string) => {
    setNetworks(
      networks.map(n =>
        n.id === networkId
          ? {
              ...n,
              colors: n.colors.map(c =>
                c.id === colorId
                  ? {
                      ...c,
                      storages: [
                        ...c.storages,
                        {
                          id: `storage-${Date.now()}`,
                          storageSize: '',
                          regularPrice: '',
                          discountPrice: '',
                          discountPercent: '',
                          stockQuantity: '',
                          lowStockAlert: '5',
                        },
                      ],
                    }
                  : c,
              ),
            }
          : n,
      ),
    );
  };

  const removeStorageFromNetwork = (
    networkId: string,
    colorId: string,
    storageId: string,
  ) => {
    setNetworks(
      networks.map(n =>
        n.id === networkId
          ? {
              ...n,
              colors: n.colors.map(c =>
                c.id === colorId
                  ? {
                      ...c,
                      storages: c.storages.filter(s => s.id !== storageId),
                    }
                  : c,
              ),
            }
          : n,
      ),
    );
  };

  const updateStorageInNetwork = (
    networkId: string,
    colorId: string,
    storageId: string,
    field: string,
    value: any,
  ) => {
    setNetworks(
      networks.map(n =>
        n.id === networkId
          ? {
              ...n,
              colors: n.colors.map(c =>
                c.id === colorId
                  ? {
                      ...c,
                      storages: c.storages.map(s => {
                        if (s.id === storageId) {
                          const updated = {...s, [field]: value};
                          // Auto-calculate discount price when regular price or discount percent changes
                          if (field === 'regularPrice' || field === 'discountPercent') {
                            const regularPrice = field === 'regularPrice' ? Number(value) : Number(s.regularPrice);
                            const discountPercent = field === 'discountPercent' ? Number(value) : Number(s.discountPercent);
                            if (regularPrice && discountPercent) {
                              updated.discountPrice = String(Math.round(regularPrice - (regularPrice * discountPercent / 100)));
                            }
                          }
                          return updated;
                        }
                        return s;
                      }),
                    }
                  : c,
              ),
            }
          : n,
      ),
    );
  };

  // Direct Color Variant management (region-independent)
  const updateDirectColorVariant = (field: string, value: string) => {
    const updated = { ...directColorVariant, [field]: value };
    
    // Auto-calculate default discount price
    if (field === 'defaultPrice' || field === 'defaultDiscountPercent') {
      const price = parseFloat(field === 'defaultPrice' ? value : updated.defaultPrice);
      const discountPercent = parseFloat(field === 'defaultDiscountPercent' ? value : updated.defaultDiscountPercent);
      
      if (!isNaN(price) && !isNaN(discountPercent) && discountPercent > 0) {
        updated.defaultDiscountPrice = (price - (price * discountPercent / 100)).toFixed(2);
      } else {
        updated.defaultDiscountPrice = '';
      }
    }
    
    setDirectColorVariant(updated);
  };

  // Add color to variant
  const addColorToVariant = () => {
    setDirectColorVariant({
      ...directColorVariant,
      colors: [
        ...directColorVariant.colors,
        {
          id: `color-${Date.now()}`,
          colorName: '',
          colorImage: '',
        }
      ]
    });
  };

  const removeColorFromVariant = (colorId: string) => {
    setDirectColorVariant({
      ...directColorVariant,
      colors: directColorVariant.colors.filter(c => c.id !== colorId),
      customPricing: directColorVariant.customPricing.filter(cp => cp.colorId !== colorId),
    });
  };

  const updateColorInVariant = (colorId: string, field: string, value: string) => {
    setDirectColorVariant({
      ...directColorVariant,
      colors: directColorVariant.colors.map(color => 
        color.id === colorId ? { ...color, [field]: value } : color
      )
    });
  };

  // Add custom pricing for a specific color
  const addCustomPricing = (colorId: string) => {
    const exists = directColorVariant.customPricing.some(cp => cp.colorId === colorId);
    if (exists) return;

    setDirectColorVariant({
      ...directColorVariant,
      customPricing: [
        ...directColorVariant.customPricing,
        {
          id: `custom-${Date.now()}`,
          colorId: colorId,
          price: '',
          comparePrice: '',
          discountPercent: '',
          discountPrice: '',
          stockQuantity: '',
          lowStockAlert: '5',
        }
      ]
    });
  };

  const removeCustomPricing = (customPricingId: string) => {
    setDirectColorVariant({
      ...directColorVariant,
      customPricing: directColorVariant.customPricing.filter(cp => cp.id !== customPricingId)
    });
  };

  const updateCustomPricing = (customPricingId: string, field: string, value: string) => {
    setDirectColorVariant({
      ...directColorVariant,
      customPricing: directColorVariant.customPricing.map(cp => {
        if (cp.id === customPricingId) {
          const updated = { ...cp, [field]: value };
          
          // Auto-calculate custom discount price
          if (field === 'price' || field === 'discountPercent') {
            const price = parseFloat(field === 'price' ? value : updated.price);
            const discountPercent = parseFloat(field === 'discountPercent' ? value : updated.discountPercent);
            
            if (!isNaN(price) && !isNaN(discountPercent) && discountPercent > 0) {
              updated.discountPrice = (price - (price * discountPercent / 100)).toFixed(2);
            } else {
              updated.discountPrice = '';
            }
          }
          
          return updated;
        }
        return cp;
      })
    });
  };

  // Region management
  const addRegion = () => {
    setRegions([
      ...regions,
      {
        id: `region-${Date.now()}`,
        regionName: '',
        isDefault: false,
        defaultStorages: [
          {
            id: `default-storage-${Date.now()}`,
            storageSize: '',
            regularPrice: '',
            discountPrice: '',
            discountPercent: '',
            stockQuantity: '',
            lowStockAlert: '5',
          },
        ],
        colors: [
          {
            id: `color-${Date.now()}`,
            colorName: '',
            colorImage: '',
            hasStorage: true,
            useDefaultStorages: true,
            singlePrice: '',
            singleComparePrice: '',
            singleStockQuantity: '',
            storages: [],
          },
        ],
      },
    ]);
  };

  // Default storage management at region level
  const addDefaultStorage = (regionId: string) => {
    setRegions(
      regions.map(r =>
        r.id === regionId
          ? {
              ...r,
              defaultStorages: [
                ...r.defaultStorages,
                {
                  id: `default-storage-${Date.now()}`,
                  storageSize: '',
                  regularPrice: '',
                  discountPrice: '',
                  discountPercent: '',
                  stockQuantity: '',
                  lowStockAlert: '5',
                },
              ],
            }
          : r,
      ),
    );
  };

  const removeDefaultStorage = (regionId: string, storageId: string) => {
    setRegions(
      regions.map(r =>
        r.id === regionId
          ? {
              ...r,
              defaultStorages: r.defaultStorages.filter(s => s.id !== storageId),
            }
          : r,
      ),
    );
  };

  const updateDefaultStorage = (
    regionId: string,
    storageId: string,
    field: string,
    value: any,
  ) => {
    setRegions(
      regions.map(r =>
        r.id === regionId
          ? {
              ...r,
              defaultStorages: r.defaultStorages.map(s => {
                if (s.id === storageId) {
                  const updated = {...s, [field]: value};
                  // Auto-calculate discount price
                  if (field === 'regularPrice' || field === 'discountPercent') {
                    const regularPrice = field === 'regularPrice' ? Number(value) : Number(s.regularPrice);
                    const discountPercent = field === 'discountPercent' ? Number(value) : Number(s.discountPercent);
                    if (regularPrice && discountPercent) {
                      updated.discountPrice = String(Math.round(regularPrice - (regularPrice * discountPercent / 100)));
                    }
                  }
                  return updated;
                }
                return s;
              }),
            }
          : r,
      ),
    );
  };

  const removeRegion = (regionId: string) => {
    setRegions(regions.filter(r => r.id !== regionId));
  };

  const updateRegion = (regionId: string, field: string, value: any) => {
    setRegions(
      regions.map(r => (r.id === regionId ? {...r, [field]: value} : r)),
    );
  };

  // Color management within region
  const addColor = (regionId: string) => {
    setRegions(
      regions.map(r =>
        r.id === regionId
          ? {
              ...r,
              colors: [
                ...r.colors,
                {
                  id: `color-${Date.now()}`,
                  colorName: '',
                  colorImage: '',
                  hasStorage: true,
                  useDefaultStorages: true,
                  singlePrice: '',
                  singleComparePrice: '',
                  singleStockQuantity: '',
                  storages: [],
                },
              ],
            }
          : r,
      ),
    );
  };

  const removeColor = (regionId: string, colorId: string) => {
    setRegions(
      regions.map(r =>
        r.id === regionId
          ? {...r, colors: r.colors.filter(c => c.id !== colorId)}
          : r,
      ),
    );
  };

  const updateColor = (
    regionId: string,
    colorId: string,
    field: string,
    value: any,
  ) => {
    setRegions(
      regions.map(r =>
        r.id === regionId
          ? {
              ...r,
              colors: r.colors.map(c =>
                c.id === colorId ? {...c, [field]: value} : c,
              ),
            }
          : r,
      ),
    );
  };

  const handleNetworkColorImageUpload = async (
    networkId: string,
    colorId: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      
      updateColorInNetwork(networkId, colorId, 'colorImage', imageUrl);
    }
  };

  const handleRegionColorImageUpload = async (
    regionId: string,
    colorId: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      
      updateColor(regionId, colorId, 'colorImage', imageUrl);
    }
  };

  const handleVariantColorImageUpload = async (
    colorId: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      
      updateColorInVariant(colorId, 'colorImage', imageUrl);
    }
  };

  // Storage management within color
  const addStorage = (regionId: string, colorId: string) => {
    setRegions(
      regions.map(r =>
        r.id === regionId
          ? {
              ...r,
              colors: r.colors.map(c =>
                c.id === colorId
                  ? {
                      ...c,
                      storages: [
                        ...c.storages,
                        {
                          id: `storage-${Date.now()}`,
                          storageSize: '',
                          regularPrice: '',
                          discountPrice: '',
                          discountPercent: '',
                          campaignPrice: '',
                          campaignStart: '',
                          campaignEnd: '',
                          stockQuantity: '',
                          lowStockAlert: '5',
                        },
                      ],
                    }
                  : c,
              ),
            }
          : r,
      ),
    );
  };

  const removeStorage = (
    regionId: string,
    colorId: string,
    storageId: string,
  ) => {
    setRegions(
      regions.map(r =>
        r.id === regionId
          ? {
              ...r,
              colors: r.colors.map(c =>
                c.id === colorId
                  ? {
                      ...c,
                      storages: c.storages.filter(s => s.id !== storageId),
                    }
                  : c,
              ),
            }
          : r,
      ),
    );
  };

  const updateStorage = (
    regionId: string,
    colorId: string,
    storageId: string,
    field: string,
    value: any,
  ) => {
    setRegions(
      regions.map(r =>
        r.id === regionId
          ? {
              ...r,
              colors: r.colors.map(c =>
                c.id === colorId
                  ? {
                      ...c,
                      storages: c.storages.map(s => {
                        if (s.id === storageId) {
                          const updated = {...s, [field]: value};
                          // Auto-calculate discount price when regular price or discount percent changes
                          if (field === 'regularPrice' || field === 'discountPercent') {
                            const regularPrice = field === 'regularPrice' ? Number(value) : Number(s.regularPrice);
                            const discountPercent = field === 'discountPercent' ? Number(value) : Number(s.discountPercent);
                            if (regularPrice && discountPercent) {
                              updated.discountPrice = String(Math.round(regularPrice - (regularPrice * discountPercent / 100)));
                            }
                          }
                          return updated;
                        }
                        return s;
                      }),
                    }
                  : c,
              ),
            }
          : r,
      ),
    );
  };

  // Thumbnail Image management (single)
  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
  };

  // Gallery Images management (multiple)
  const handleGalleryImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);

      const newPreviews = files.map(file => ({
        url: URL.createObjectURL(file),
        altText: productName || file.name,
        file,
      }));

      setGalleryImageFiles([...galleryImageFiles, ...files]);
      setGalleryImagePreviews([...galleryImagePreviews, ...newPreviews]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImageFiles(galleryImageFiles.filter((_, i) => i !== index));
    setGalleryImagePreviews(galleryImagePreviews.filter((_, i) => i !== index));
  };

  // Video management
  const addVideo = () => {
    setVideos([
      ...videos,
      {id: `video-${Date.now()}`, url: '', type: 'youtube'},
    ]);
  };

  const removeVideo = (id: string) => {
    setVideos(videos.filter(v => v.id !== id));
  };

  const updateVideo = (id: string, field: string, value: string) => {
    setVideos(videos.map(v => (v.id === id ? {...v, [field]: value} : v)));
  };

  // Specification management
  const addSpecification = () => {
    setSpecifications([
      ...specifications,
      {id: `spec-${Date.now()}`, key: '', value: ''},
    ]);
  };

  const removeSpecification = (specId: string) => {
    setSpecifications(specifications.filter(s => s.id !== specId));
  };

  const updateSpecification = (
    specId: string,
    field: string,
    value: string,
  ) => {
    setSpecifications(
      specifications.map(s =>
        s.id === specId ? {...s, [field]: value} : s,
      ),
    );
  };

  // Handle publish product with FormData
  const handlePublish = async () => {
    // Validate thumbnail
    if (!thumbnailFile) {
      alert('❌ Please upload a product thumbnail image.');
      return;
    }

    // Validate no duplicate color names within direct color variants
    if (directColorVariant.colors.length > 0) {
      const colorNames = directColorVariant.colors.map(c => c.colorName.toLowerCase().trim());
      const duplicates = colorNames.filter((name, index) => colorNames.indexOf(name) !== index);
      if (duplicates.length > 0) {
        alert(
          `❌ Duplicate color names found in Direct Color Variants:\n\n` +
          `Duplicate colors: ${[...new Set(duplicates)].join(', ')}\n\n` +
          `Please ensure each color has a unique name.`
        );
        return;
      }
    }

    // Validate no duplicate color names within each region
    for (const region of regions) {
      const colorNames = region.colors.map(c => c.colorName.toLowerCase().trim());
      const duplicates = colorNames.filter((name, index) => colorNames.indexOf(name) !== index);
      if (duplicates.length > 0) {
        alert(
          `❌ Duplicate color names found in region "${region.regionName}":\n\n` +
          `Duplicate colors: ${[...new Set(duplicates)].join(', ')}\n\n` +
          `Please ensure each color has a unique name within the same region.`
        );
        return;
      }
    }

    // Validate no duplicate color names within each network
    for (const network of networks) {
      const colorNames = network.colors.map(c => c.colorName.toLowerCase().trim());
      const duplicates = colorNames.filter((name, index) => colorNames.indexOf(name) !== index);
      if (duplicates.length > 0) {
        alert(
          `❌ Duplicate color names found in network "${network.networkType}":\n\n` +
          `Duplicate colors: ${[...new Set(duplicates)].join(', ')}\n\n` +
          `Please ensure each color has a unique name within the same network.`
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Append thumbnail image
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      // Append gallery images
      galleryImageFiles.forEach(file => {
        formData.append('galleryImages', file);
      });

      // Prepare JSON payload
      const payload: any = {
        name: productName,
        slug,
        description: description || undefined,
        shortDescription: shortDescription || undefined,
        categoryId: selectedCategory || undefined,
        brandId: selectedBrand || undefined,
        productCode: productCode || undefined,
        sku: sku || undefined,
        warranty: warranty || undefined,
        isActive,
        isOnline,
        isPos,
        isPreOrder,
        isOfficial,
        freeShipping,
        isEmi,
        rewardPoints: rewardPoints ? Number(rewardPoints) : undefined,
        minBookingPrice: minBookingPrice ? Number(minBookingPrice) : undefined,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        seoKeywords: seoKeywords
          ? seoKeywords.split(',').map(k => k.trim())
          : undefined,
        seoCanonical: seoCanonical || undefined,
        tags: tags ? tags.split(',').map(t => t.trim()) : undefined,

        // Direct Colors (region-independent, for simple products)
        directColors: directColorVariant.colors.length > 0 ? directColorVariant.colors.map((color, idx) => {
          // Check if this color has custom pricing
          const customPrice = directColorVariant.customPricing.find(cp => cp.colorId === color.id);
          
          if (customPrice) {
            // Use custom pricing
            return {
              colorName: color.colorName,
              colorImage: color.colorImage,
              hasStorage: false,
              singlePrice: customPrice.price ? Number(customPrice.price) : 0,
              singleComparePrice: customPrice.comparePrice ? Number(customPrice.comparePrice) : undefined,
              singleDiscountPercent: customPrice.discountPercent ? Number(customPrice.discountPercent) : undefined,
              singleDiscountPrice: customPrice.discountPrice ? Number(customPrice.discountPrice) : undefined,
              singleStockQuantity: customPrice.stockQuantity ? Number(customPrice.stockQuantity) : 0,
              singleLowStockAlert: customPrice.lowStockAlert ? Number(customPrice.lowStockAlert) : 5,
              displayOrder: idx,
            };
          } else {
            // Use default pricing
            return {
              colorName: color.colorName,
              colorImage: color.colorImage,
              hasStorage: false,
              singlePrice: directColorVariant.defaultPrice ? Number(directColorVariant.defaultPrice) : 0,
              singleComparePrice: directColorVariant.defaultComparePrice ? Number(directColorVariant.defaultComparePrice) : undefined,
              singleDiscountPercent: directColorVariant.defaultDiscountPercent ? Number(directColorVariant.defaultDiscountPercent) : undefined,
              singleDiscountPrice: directColorVariant.defaultDiscountPrice ? Number(directColorVariant.defaultDiscountPrice) : undefined,
              singleStockQuantity: directColorVariant.defaultStockQuantity ? Number(directColorVariant.defaultStockQuantity) : 0,
              singleLowStockAlert: directColorVariant.defaultLowStockAlert ? Number(directColorVariant.defaultLowStockAlert) : 5,
              displayOrder: idx,
            };
          }
        }) : undefined,

        // Networks with nested colors, storages, and prices
        networks: networks.length > 0 ? networks.map((network, nIdx) => ({
          networkType: network.networkType,
          priceAdjustment: network.priceAdjustment ? Number(network.priceAdjustment) : 0,
          isDefault: network.isDefault,
          displayOrder: nIdx,
          colors: network.colors.map((color, cIdx) => ({
            colorName: color.colorName,
            hasStorage: color.hasStorage,
            singlePrice:
              !color.hasStorage && color.singlePrice
                ? Number(color.singlePrice)
                : undefined,
            singleComparePrice:
              !color.hasStorage && color.singleComparePrice
                ? Number(color.singleComparePrice)
                : undefined,
            singleStockQuantity:
              !color.hasStorage && color.singleStockQuantity
                ? Number(color.singleStockQuantity)
                : undefined,
            displayOrder: cIdx,
            storages: color.hasStorage
              ? color.storages.map((storage, sIdx) => ({
                  storageSize: storage.storageSize,
                  displayOrder: sIdx,
                  price: {
                    regularPrice: storage.regularPrice
                      ? Number(storage.regularPrice)
                      : 0,
                    discountPrice: storage.discountPrice
                      ? Number(storage.discountPrice)
                      : undefined,
                    discountPercent: storage.discountPercent
                      ? Number(storage.discountPercent)
                      : undefined,
                    stockQuantity: storage.stockQuantity
                      ? Number(storage.stockQuantity)
                      : 0,
                    lowStockAlert: storage.lowStockAlert
                      ? Number(storage.lowStockAlert)
                      : 5,
                  },
                }))
              : undefined,
          })),
        })) : undefined,

        // Regions with nested colors, storages, and prices (color images will be assigned by backend)
        regions: regions.length > 0 ? regions.map((region, rIdx) => ({
          regionName: region.regionName,
          isDefault: region.isDefault,
          displayOrder: rIdx,
          // Default storages shared by all colors in this region
          defaultStorages: region.defaultStorages
            .filter(s => s.storageSize && s.regularPrice)
            .map((storage, sIdx) => ({
              storageSize: storage.storageSize,
              displayOrder: sIdx,
              price: {
                regularPrice: storage.regularPrice
                  ? Number(storage.regularPrice)
                  : 0,
                discountPrice: storage.discountPrice
                  ? Number(storage.discountPrice)
                  : undefined,
                discountPercent: storage.discountPercent
                  ? Number(storage.discountPercent)
                  : undefined,
                stockQuantity: storage.stockQuantity
                  ? Number(storage.stockQuantity)
                  : 0,
                lowStockAlert: storage.lowStockAlert
                  ? Number(storage.lowStockAlert)
                  : 5,
              },
            })),
          colors: region.colors.map((color, cIdx) => ({
            colorName: color.colorName,
            // colorImage will be auto-assigned by backend from uploaded colorImages
            hasStorage: color.hasStorage,
            useDefaultStorages: color.useDefaultStorages,
            singlePrice:
              !color.hasStorage && color.singlePrice
                ? Number(color.singlePrice)
                : undefined,
            singleComparePrice:
              !color.hasStorage && color.singleComparePrice
                ? Number(color.singleComparePrice)
                : undefined,
            singleStockQuantity:
              !color.hasStorage && color.singleStockQuantity
                ? Number(color.singleStockQuantity)
                : undefined,
            displayOrder: cIdx,
            // Only include custom storages if useDefaultStorages = false
            storages: color.hasStorage && !color.useDefaultStorages
              ? color.storages.map((storage, sIdx) => ({
                  storageSize: storage.storageSize,
                  displayOrder: sIdx,
                  price: {
                    regularPrice: storage.regularPrice
                      ? Number(storage.regularPrice)
                      : 0,
                    discountPrice: storage.discountPrice
                      ? Number(storage.discountPrice)
                      : undefined,
                    discountPercent: storage.discountPercent
                      ? Number(storage.discountPercent)
                      : undefined,
                    stockQuantity: storage.stockQuantity
                      ? Number(storage.stockQuantity)
                      : 0,
                    lowStockAlert: storage.lowStockAlert
                      ? Number(storage.lowStockAlert)
                      : 5,
                  },
                }))
              : undefined,
          })),
        })) : undefined,

        // Videos
        videos: videos
          .filter(v => v.url)
          .map((v, idx) => ({
            videoUrl: v.url,
            videoType: v.type,
            displayOrder: idx,
          })),

        // Specifications (flat list)
        specifications: specifications
          .filter(s => s.key && s.value)
          .map((s, idx) => ({
            specKey: s.key,
            specValue: s.value,
            displayOrder: idx,
          })),
      };

      // Append all JSON fields to FormData
      Object.keys(payload).forEach(key => {
        const value = payload[key];
        if (value !== undefined) {
          if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      console.log('Submitting FormData with files...');
      console.log('Thumbnail:', thumbnailFile ? 'Yes' : 'No');
      console.log('Gallery Images:', galleryImageFiles.length);

      // Call API with FormData
      await productsService.createWithFormData(formData);

      alert('Product created successfully!');
      // Optionally redirect to products list
      // router.push('/admin/products');
    } catch (err: any) {
      console.error('Error creating product:', err);
      
      // Enhanced error handling for duplicate key errors
      const errorMessage = err?.response?.data?.message || err?.message || 'Unknown error';
      
      if (errorMessage.includes('duplicate key') || errorMessage.includes('E11000')) {
        alert(
          '⚠️ Database Error: Duplicate color name detected.\n\n' +
          'This is a backend issue where the product ID is not being set correctly.\n\n' +
          'Please contact the backend team to fix the product-color relationship.\n\n' +
          'Technical details: ' + errorMessage
        );
      } else if (errorMessage.includes('Color name') && errorMessage.includes('already exists')) {
        alert(
          '⚠️ Duplicate Color Name\n\n' +
          'One or more colors have the same name within this product.\n' +
          'Please ensure each color has a unique name.\n\n' +
          'Error: ' + errorMessage
        );
      } else {
        alert('❌ Failed to create product:\n\n' + errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-muted-foreground">
            Create a new product listing with images.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Basic Information</h2>
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                placeholder="Enter product name"
                value={productName}
                onChange={handleProductNameChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                placeholder="product-url-slug"
                value={slug}
                onChange={handleSlugChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter product description (Markdown supported)"
                rows={8}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <div className="border rounded-md">
                {/* Formatting Toolbar */}
                <div className="flex items-center gap-1 p-2 border-b bg-muted/50">
                  <button
                    type="button"
                    onClick={() => formatText('bold')}
                    className="p-2 hover:bg-accent rounded transition-colors"
                    title="Bold (Ctrl+B)">
                    <strong className="text-sm">B</strong>
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('italic')}
                    className="p-2 hover:bg-accent rounded transition-colors"
                    title="Italic (Ctrl+I)">
                    <em className="text-sm">I</em>
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('underline')}
                    className="p-2 hover:bg-accent rounded transition-colors"
                    title="Underline (Ctrl+U)">
                    <span className="text-sm underline">U</span>
                  </button>
                  <div className="w-px h-6 bg-border mx-1" />
                  <button
                    type="button"
                    onClick={() => formatText('insertUnorderedList')}
                    className="p-2 hover:bg-accent rounded transition-colors"
                    title="Bullet List">
                    <span className="text-sm">• List</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('insertOrderedList')}
                    className="p-2 hover:bg-accent rounded transition-colors"
                    title="Numbered List">
                    <span className="text-sm">1. List</span>
                  </button>
                  <div className="w-px h-6 bg-border mx-1" />
                  <button
                    type="button"
                    onClick={() => formatText('removeFormat')}
                    className="p-2 hover:bg-accent rounded transition-colors text-xs"
                    title="Clear Formatting">
                    Clear
                  </button>
                </div>
                {/* Editable Content */}
                <div
                  contentEditable
                  onInput={handleShortDescriptionChange}
                  dangerouslySetInnerHTML={{ __html: shortDescription }}
                  className="min-h-[120px] p-3 focus:outline-none"
                  style={{ wordBreak: 'break-word' }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Use the toolbar above to format text with bold, italic, underline, and lists.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="brand">Brand</Label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map(brand => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="productCode">Product Code</Label>
                <Input
                  id="productCode"
                  placeholder="Enter product code"
                  value={productCode}
                  onChange={e => setProductCode(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  placeholder="Enter SKU"
                  value={sku}
                  onChange={e => setSku(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="warranty">Warranty</Label>
                <Input
                  id="warranty"
                  placeholder="e.g. 1 Year Official"
                  value={warranty}
                  onChange={e => setWarranty(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Product Status Flags */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Product Status</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="isOnline"
                  checked={isOnline}
                  onCheckedChange={setIsOnline}
                />
                <Label htmlFor="isOnline">Online</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="isPos" checked={isPos} onCheckedChange={setIsPos} />
                <Label htmlFor="isPos">POS</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="isPreOrder"
                  checked={isPreOrder}
                  onCheckedChange={setIsPreOrder}
                />
                <Label htmlFor="isPreOrder">Pre-Order</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="isOfficial"
                  checked={isOfficial}
                  onCheckedChange={setIsOfficial}
                />
                <Label htmlFor="isOfficial">Official</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="freeShipping"
                  checked={freeShipping}
                  onCheckedChange={setFreeShipping}
                />
                <Label htmlFor="freeShipping">Free Shipping</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="isEmi"
                  checked={isEmi}
                  onCheckedChange={setIsEmi}
                />
                <Label htmlFor="isEmi">EMI Available</Label>
              </div>
            </div>
          </div>

          {/* Rewards & Booking */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Rewards & Booking</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="rewardPoints">Reward Points</Label>
                <Input
                  id="rewardPoints"
                  type="number"
                  placeholder="0"
                  value={rewardPoints}
                  onChange={e => setRewardPoints(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="minBookingPrice">Min Booking Price</Label>
                <Input
                  id="minBookingPrice"
                  type="number"
                  placeholder="0"
                  value={minBookingPrice}
                  onChange={e => setMinBookingPrice(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Thumbnail Image (Single) */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Product Thumbnail *</h2>
            <p className="text-sm text-muted-foreground">
              Upload the main thumbnail image for this product.
              This will be shown in product listings.
            </p>
            <div className="grid gap-4 sm:grid-cols-4">
              {thumbnailPreview && (
                <div className="relative aspect-square rounded-lg border border-border bg-muted">
                  <button
                    className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground z-10"
                    onClick={removeThumbnail}>
                    <X className="h-3 w-3" />
                  </button>
                  <div className="absolute left-2 top-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs z-10">
                    Thumbnail
                  </div>
                  <img
                    src={thumbnailPreview}
                    alt="Product thumbnail"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              )}
              {!thumbnailPreview && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 hover:bg-muted">
                  <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Upload Thumbnail</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Product Gallery (Multiple Images) */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Product Gallery</h2>
            <p className="text-sm text-muted-foreground">
              Upload multiple images for the product gallery.
              These images will be shown in the product detail page.
            </p>
            <div className="grid gap-4 sm:grid-cols-5">
              {galleryImagePreviews.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg border border-border bg-muted">
                  <button
                    className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground z-10"
                    onClick={() => removeGalleryImage(index)}>
                    <X className="h-3 w-3" />
                  </button>
                  <div className="absolute left-1 top-1 bg-black/60 text-white px-1.5 py-0.5 rounded text-xs z-10">
                    #{index + 1}
                  </div>
                  <img
                    src={image.url}
                    alt={image.altText}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 hover:bg-muted">
                <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Add Images</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryImageUpload}
                />
              </label>
            </div>
          </div>

          {/* Direct Color Variants (Region-Independent) - Always Visible */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Direct Color Variants</h2>
              <p className="text-sm text-muted-foreground mt-1">
                For simple products without network/region complexity (Headphones, Watches, Cases, Power Banks, etc.)
              </p>
            </div>

            <Card className="border-2 border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-purple-900">
                  Product Color Variants
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Default Pricing Section */}
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-3">Default Pricing (Shared by All Colors)</h4>
                  
                  <div className="grid gap-4 sm:grid-cols-2 mb-4">
                    <div className="grid gap-2">
                      <Label>Regular Price *</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={directColorVariant.defaultPrice}
                        onChange={e => updateDirectColorVariant('defaultPrice', e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Compare Price</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={directColorVariant.defaultComparePrice}
                        onChange={e => updateDirectColorVariant('defaultComparePrice', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3 mb-4">
                    <div className="grid gap-2">
                      <Label>Discount %</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={directColorVariant.defaultDiscountPercent}
                        onChange={e => updateDirectColorVariant('defaultDiscountPercent', e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Discount Price (Auto)</Label>
                      <Input
                        type="number"
                        value={directColorVariant.defaultDiscountPrice}
                        readOnly
                        className="bg-muted cursor-not-allowed"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Stock Quantity *</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={directColorVariant.defaultStockQuantity}
                        onChange={e => updateDirectColorVariant('defaultStockQuantity', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2" style={{ maxWidth: '200px' }}>
                    <Label>Low Stock Alert</Label>
                    <Input
                      type="number"
                      placeholder="5"
                      value={directColorVariant.defaultLowStockAlert}
                      onChange={e => updateDirectColorVariant('defaultLowStockAlert', e.target.value)}
                    />
                  </div>
                </div>

                {/* Colors Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-purple-900">Colors (Using Default Price)</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addColorToVariant()}>
                      <Plus className="mr-2 h-3 w-3" /> Add Color
                    </Button>
                  </div>

                  {directColorVariant.colors.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No colors added yet. Click &quot;Add Color&quot; to start.
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {directColorVariant.colors.map((color) => {
                        const hasCustomPricing = directColorVariant.customPricing.some(cp => cp.colorId === color.id);
                        
                        return (
                          <div key={color.id} className="p-3 bg-white rounded border space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Color</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeColorFromVariant(color.id)}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>

                            <div className="grid gap-2">
                              <Input
                                placeholder="Color name (e.g. Black)"
                                value={color.colorName}
                                onChange={e => updateColorInVariant(color.id, 'colorName', e.target.value)}
                                required
                              />
                            </div>

                            <div className="grid gap-2">
                              <div className="space-y-2">
                                {color.colorImage && (
                                  <div className="relative inline-block">
                                    <img
                                      src={color.colorImage}
                                      alt={color.colorName}
                                      className="h-16 w-16 object-cover rounded border"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => updateColorInVariant(color.id, 'colorImage', '')}
                                      className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-destructive-foreground">
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                )}
                                <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 hover:bg-muted px-4 py-2">
                                  <Upload className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    {color.colorImage ? 'Change Image' : 'Upload Image'}
                                  </span>
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleVariantColorImageUpload(color.id, e)}
                                  />
                                </label>
                              </div>
                            </div>

                            {!hasCustomPricing && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-xs"
                                onClick={() => addCustomPricing(color.id)}>
                                Set Custom Price
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Custom Pricing Section */}
                {directColorVariant.customPricing.length > 0 && (
                  <div className="space-y-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-orange-900">Custom Pricing (Different from Default)</h4>
                    
                    {directColorVariant.customPricing.map((customPrice) => {
                      const color = directColorVariant.colors.find(c => c.id === customPrice.colorId);
                      
                      return (
                        <div key={customPrice.id} className="p-3 bg-white rounded border space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-orange-900">
                              {color?.colorName || 'Unknown Color'}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeCustomPricing(customPrice.id)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                              <Label className="text-xs">Regular Price *</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={customPrice.price}
                                onChange={e => updateCustomPricing(customPrice.id, 'price', e.target.value)}
                                required
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label className="text-xs">Compare Price</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={customPrice.comparePrice}
                                onChange={e => updateCustomPricing(customPrice.id, 'comparePrice', e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-3">
                            <div className="grid gap-2">
                              <Label className="text-xs">Discount %</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={customPrice.discountPercent}
                                onChange={e => updateCustomPricing(customPrice.id, 'discountPercent', e.target.value)}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label className="text-xs">Discount Price (Auto)</Label>
                              <Input
                                type="number"
                                value={customPrice.discountPrice}
                                readOnly
                                className="bg-muted cursor-not-allowed"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label className="text-xs">Stock</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={customPrice.stockQuantity}
                                onChange={e => updateCustomPricing(customPrice.id, 'stockQuantity', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Networks, Colors, Storages, Prices */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsNetworksExpanded(!isNetworksExpanded)}
                  className="p-2">
                  {isNetworksExpanded ? '▼' : '▶'}
                </Button>
                <h2 className="text-lg font-semibold">
                  Networks, Colors, Storages & Pricing
                </h2>
              </div>
              <Button variant="outline" size="sm" onClick={addNetwork}>
                <Plus className="mr-2 h-4 w-4" /> Add Network
              </Button>
            </div>

            {isNetworksExpanded && networks.map((network, networkIdx) => (
              <Card key={network.id} className="border-2 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between bg-blue-50">
                  <CardTitle className="text-base">
                    Network #{networkIdx + 1}
                  </CardTitle>
                  {networks.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeNetwork(network.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4 mt-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="grid gap-2">
                      <Label>Network Type *</Label>
                      <Input
                        placeholder="e.g. 4G LTE, 5G, WiFi Only"
                        value={network.networkType}
                        onChange={e =>
                          updateNetwork(network.id, 'networkType', e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Price Adjustment</Label>
                      <Input
                        type="number"
                        placeholder="0 (positive or negative)"
                        value={network.priceAdjustment}
                        onChange={e =>
                          updateNetwork(network.id, 'priceAdjustment', e.target.value)
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-7">
                      <Switch
                        checked={network.isDefault}
                        onCheckedChange={checked =>
                          updateNetwork(network.id, 'isDefault', checked)
                        }
                      />
                      <Label>Default Network</Label>
                    </div>
                  </div>

                  {/* Colors within this network */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold">Colors</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addColorToNetwork(network.id)}>
                        <Plus className="mr-2 h-3 w-3" /> Add Color
                      </Button>
                    </div>

                    {network.colors.map((color, colorIdx) => (
                      <Card key={color.id} className="border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm">
                            Color #{colorIdx + 1}
                          </CardTitle>
                          {network.colors.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeColorFromNetwork(network.id, color.id)}>
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                              <Label>Color Name *</Label>
                              <Input
                                placeholder="e.g. Midnight"
                                value={color.colorName}
                                onChange={e =>
                                  updateColorInNetwork(
                                    network.id,
                                    color.id,
                                    'colorName',
                                    e.target.value,
                                  )
                                }
                                required
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label>Color Image</Label>
                              <div className="flex items-center gap-2">
                                {color.colorImage && (
                                  <div className="relative w-16 h-16 rounded border">
                                    <img
                                      src={color.colorImage}
                                      alt={color.colorName}
                                      className="w-full h-full object-cover rounded"
                                    />
                                    <button
                                      type="button"
                                      className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                                      onClick={() =>
                                        updateColorInNetwork(
                                          network.id,
                                          color.id,
                                          'colorImage',
                                          '',
                                        )
                                      }>
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                )}
                                <label className="flex-1">
                                  <div className="flex h-10 w-full cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground">
                                    <Upload className="mr-2 h-4 w-4" />
                                    {color.colorImage ? 'Change' : 'Upload'}
                                  </div>
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={e =>
                                      handleNetworkColorImageUpload(
                                        network.id,
                                        color.id,
                                        e,
                                      )
                                    }
                                  />
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Switch
                              checked={color.hasStorage}
                              onCheckedChange={checked =>
                                updateColorInNetwork(
                                  network.id,
                                  color.id,
                                  'hasStorage',
                                  checked,
                                )
                              }
                            />
                            <Label>Has Storage Variants</Label>
                          </div>

                          {/* Color-only pricing (when hasStorage = false) */}
                          {!color.hasStorage && (
                            <div className="grid gap-4 sm:grid-cols-3 p-4 bg-muted rounded-lg">
                              <div className="grid gap-2">
                                <Label>Price *</Label>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={color.singlePrice}
                                  onChange={e =>
                                    updateColorInNetwork(
                                      network.id,
                                      color.id,
                                      'singlePrice',
                                      e.target.value,
                                    )
                                  }
                                  required
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label>Compare Price</Label>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={color.singleComparePrice}
                                  onChange={e =>
                                    updateColorInNetwork(
                                      network.id,
                                      color.id,
                                      'singleComparePrice',
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label>Stock Quantity</Label>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={color.singleStockQuantity}
                                  onChange={e =>
                                    updateColorInNetwork(
                                      network.id,
                                      color.id,
                                      'singleStockQuantity',
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>
                          )}

                          {/* Storages within this color (only if hasStorage = true) */}
                          {color.hasStorage && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="font-semibold">
                                  Storage Variants & Pricing
                                </Label>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    addStorageToNetwork(network.id, color.id)
                                  }>
                                  <Plus className="mr-2 h-3 w-3" /> Add Storage
                                </Button>
                              </div>

                              {color.storages.map((storage, storageIdx) => (
                                <div
                                  key={storage.id}
                                  className="rounded border p-4 space-y-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">
                                      Storage #{storageIdx + 1}
                                    </span>
                                    {color.storages.length > 1 && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          removeStorageFromNetwork(
                                            network.id,
                                            color.id,
                                            storage.id,
                                          )
                                        }>
                                        <X className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>

                                  <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                      <Label>Storage Size *</Label>
                                      <Input
                                        placeholder="e.g. 256GB"
                                        value={storage.storageSize}
                                        onChange={e =>
                                          updateStorageInNetwork(
                                            network.id,
                                            color.id,
                                            storage.id,
                                            'storageSize',
                                            e.target.value,
                                          )
                                        }
                                        required
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label>Regular Price *</Label>
                                      <Input
                                        type="number"
                                        placeholder="0"
                                        value={storage.regularPrice}
                                        onChange={e =>
                                          updateStorageInNetwork(
                                            network.id,
                                            color.id,
                                            storage.id,
                                            'regularPrice',
                                            e.target.value,
                                          )
                                        }
                                        required
                                      />
                                    </div>
                                  </div>

                                  <div className="grid gap-4 sm:grid-cols-3">
                                    <div className="grid gap-2">
                                      <Label>Discount %</Label>
                                      <Input
                                        type="number"
                                        placeholder="0"
                                        value={storage.discountPercent}
                                        onChange={e =>
                                          updateStorageInNetwork(
                                            network.id,
                                            color.id,
                                            storage.id,
                                            'discountPercent',
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label>Discount Price (Auto)</Label>
                                      <Input
                                        type="number"
                                        placeholder="0"
                                        value={storage.discountPrice}
                                        readOnly
                                        className="bg-muted cursor-not-allowed"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                      <Label>Stock Quantity *</Label>
                                      <Input
                                        type="number"
                                        placeholder="0"
                                        value={storage.stockQuantity}
                                        onChange={e =>
                                          updateStorageInNetwork(
                                            network.id,
                                            color.id,
                                            storage.id,
                                            'stockQuantity',
                                            e.target.value,
                                          )
                                        }
                                        required
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label>Low Stock Alert</Label>
                                      <Input
                                        type="number"
                                        placeholder="5"
                                        value={storage.lowStockAlert}
                                        onChange={e =>
                                          updateStorageInNetwork(
                                            network.id,
                                            color.id,
                                            storage.id,
                                            'lowStockAlert',
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Regions, Colors, Storages, Prices */}
          <div className="space-y-4 mt-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsRegionsExpanded(!isRegionsExpanded)}
                  className="p-2">
                  {isRegionsExpanded ? '▼' : '▶'}
                </Button>
                <h2 className="text-lg font-semibold">
                  Regions, Colors, Storages & Pricing
                </h2>
              </div>
              <Button variant="outline" size="sm" onClick={addRegion}>
                <Plus className="mr-2 h-4 w-4" /> Add Region
              </Button>
            </div>

            {isRegionsExpanded && regions.map((region, regionIdx) => (
              <Card key={region.id} className="border-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">
                    Region #{regionIdx + 1}
                  </CardTitle>
                  {regions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRegion(region.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Region Name *</Label>
                      <Input
                        placeholder="e.g. International, USA, Europe"
                        value={region.regionName}
                        onChange={e =>
                          updateRegion(region.id, 'regionName', e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-7">
                      <Switch
                        checked={region.isDefault}
                        onCheckedChange={checked =>
                          updateRegion(region.id, 'isDefault', checked)
                        }
                      />
                      <Label>Default Region</Label>
                    </div>
                  </div>

                  {/* Default Storages for this region (shared by all colors) */}
                  <div className="space-y-2 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-semibold text-blue-900">Default Storage & Pricing (Shared)</Label>
                        <p className="text-xs text-blue-700 mt-1">
                          These storages will be used by all colors unless a color has custom pricing
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addDefaultStorage(region.id)}>
                        <Plus className="mr-2 h-3 w-3" /> Add Storage
                      </Button>
                    </div>

                    {region.defaultStorages.map((storage, storageIdx) => (
                      <div
                        key={storage.id}
                        className="rounded border bg-white p-4 space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            Default Storage #{storageIdx + 1}
                          </span>
                          {region.defaultStorages.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                removeDefaultStorage(region.id, storage.id)
                              }>
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="grid gap-2">
                            <Label>Storage Size *</Label>
                            <Input
                              placeholder="e.g. 256GB"
                              value={storage.storageSize}
                              onChange={e =>
                                updateDefaultStorage(
                                  region.id,
                                  storage.id,
                                  'storageSize',
                                  e.target.value,
                                )
                              }
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Regular Price *</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={storage.regularPrice}
                              onChange={e =>
                                updateDefaultStorage(
                                  region.id,
                                  storage.id,
                                  'regularPrice',
                                  e.target.value,
                                )
                              }
                              required
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                          <div className="grid gap-2">
                            <Label>Discount %</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={storage.discountPercent}
                              onChange={e =>
                                updateDefaultStorage(
                                  region.id,
                                  storage.id,
                                  'discountPercent',
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Discount Price (Auto)</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={storage.discountPrice}
                              readOnly
                              className="bg-muted cursor-not-allowed"
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="grid gap-2">
                            <Label>Stock Quantity *</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={storage.stockQuantity}
                              onChange={e =>
                                updateDefaultStorage(
                                  region.id,
                                  storage.id,
                                  'stockQuantity',
                                  e.target.value,
                                )
                              }
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Low Stock Alert</Label>
                            <Input
                              type="number"
                              placeholder="5"
                              value={storage.lowStockAlert}
                              onChange={e =>
                                updateDefaultStorage(
                                  region.id,
                                  storage.id,
                                  'lowStockAlert',
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Colors within this region */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold">Colors</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addColor(region.id)}>
                        <Plus className="mr-2 h-3 w-3" /> Add Color
                      </Button>
                    </div>

                    {region.colors.map((color, colorIdx) => (
                      <Card key={color.id} className="border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm">
                            Color #{colorIdx + 1}
                          </CardTitle>
                          {region.colors.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeColor(region.id, color.id)}>
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                              <Label>Color Name *</Label>
                              <Input
                                placeholder="e.g. Midnight"
                                value={color.colorName}
                                onChange={e =>
                                  updateColor(
                                    region.id,
                                    color.id,
                                    'colorName',
                                    e.target.value,
                                  )
                                }
                                required
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label>Color Image</Label>
                              <div className="flex items-center gap-2">
                                {color.colorImage && (
                                  <div className="relative w-16 h-16 rounded border">
                                    <img
                                      src={color.colorImage}
                                      alt={color.colorName}
                                      className="w-full h-full object-cover rounded"
                                    />
                                    <button
                                      type="button"
                                      className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                                      onClick={() =>
                                        updateColor(
                                          region.id,
                                          color.id,
                                          'colorImage',
                                          '',
                                        )
                                      }>
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                )}
                                <label className="flex-1">
                                  <div className="flex h-10 w-full cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground">
                                    <Upload className="mr-2 h-4 w-4" />
                                    {color.colorImage ? 'Change' : 'Upload'}
                                  </div>
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={e =>
                                      handleRegionColorImageUpload(
                                        region.id,
                                        color.id,
                                        e,
                                      )
                                    }
                                  />
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Switch
                              checked={color.hasStorage}
                              onCheckedChange={checked =>
                                updateColor(
                                  region.id,
                                  color.id,
                                  'hasStorage',
                                  checked,
                                )
                              }
                            />
                            <Label>Has Storage Variants</Label>
                          </div>

                          {/* Toggle for using default storages */}
                          {color.hasStorage && (
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={color.useDefaultStorages}
                                  onCheckedChange={checked => {
                                    updateColor(
                                      region.id,
                                      color.id,
                                      'useDefaultStorages',
                                      checked,
                                    );
                                    // If switching to custom, add one empty storage
                                    if (!checked && color.storages.length === 0) {
                                      addStorage(region.id, color.id);
                                    }
                                  }}
                                />
                                <div>
                                  <Label className="text-blue-900">Use Region Default Storages</Label>
                                  <p className="text-xs text-blue-700 mt-0.5">
                                    {color.useDefaultStorages 
                                      ? 'This color will use the shared default storages defined above'
                                      : 'This color has custom storage pricing'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Color-only pricing (when hasStorage = false) */}
                          {!color.hasStorage && (
                            <div className="grid gap-4 sm:grid-cols-3 p-4 bg-muted rounded-lg">
                              <div className="grid gap-2">
                                <Label>Price *</Label>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={color.singlePrice}
                                  onChange={e =>
                                    updateColor(
                                      region.id,
                                      color.id,
                                      'singlePrice',
                                      e.target.value,
                                    )
                                  }
                                  required
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label>Compare Price</Label>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={color.singleComparePrice}
                                  onChange={e =>
                                    updateColor(
                                      region.id,
                                      color.id,
                                      'singleComparePrice',
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label>Stock Quantity</Label>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={color.singleStockQuantity}
                                  onChange={e =>
                                    updateColor(
                                      region.id,
                                      color.id,
                                      'singleStockQuantity',
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>
                          )}

                          {/* Custom Storages (only if hasStorage = true AND useDefaultStorages = false) */}
                          {color.hasStorage && !color.useDefaultStorages && (
                            <div className="space-y-2 p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label className="font-semibold text-orange-900">
                                    Custom Storage Variants & Pricing
                                  </Label>
                                  <p className="text-xs text-orange-700 mt-1">
                                    This color has custom pricing that differs from the default
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    addStorage(region.id, color.id)
                                  }>
                                  <Plus className="mr-2 h-3 w-3" /> Add Storage
                                </Button>
                              </div>

                              {color.storages.map((storage, storageIdx) => (
                                <div
                                  key={storage.id}
                                  className="rounded border p-4 space-y-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">
                                      Storage #{storageIdx + 1}
                                    </span>
                                    {color.storages.length > 1 && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          removeStorage(
                                            region.id,
                                            color.id,
                                            storage.id,
                                          )
                                        }>
                                        <X className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>

                                  <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                      <Label>Storage Size *</Label>
                                      <Input
                                        placeholder="e.g. 256GB"
                                        value={storage.storageSize}
                                        onChange={e =>
                                          updateStorage(
                                            region.id,
                                            color.id,
                                            storage.id,
                                            'storageSize',
                                            e.target.value,
                                          )
                                        }
                                        required
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label>Regular Price *</Label>
                                      <Input
                                        type="number"
                                        placeholder="0"
                                        value={storage.regularPrice}
                                        onChange={e =>
                                          updateStorage(
                                            region.id,
                                            color.id,
                                            storage.id,
                                            'regularPrice',
                                            e.target.value,
                                          )
                                        }
                                        required
                                      />
                                    </div>
                                  </div>

                                  <div className="grid gap-4 sm:grid-cols-3">
                                    <div className="grid gap-2">
                                      <Label>Discount %</Label>
                                      <Input
                                        type="number"
                                        placeholder="0"
                                        value={storage.discountPercent}
                                        onChange={e =>
                                          updateStorage(
                                            region.id,
                                            color.id,
                                            storage.id,
                                            'discountPercent',
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label>Discount Price (Auto)</Label>
                                      <Input
                                        type="number"
                                        placeholder="0"
                                        value={storage.discountPrice}
                                        readOnly
                                        className="bg-muted cursor-not-allowed"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                      <Label>Stock Quantity *</Label>
                                      <Input
                                        type="number"
                                        placeholder="0"
                                        value={storage.stockQuantity}
                                        onChange={e =>
                                          updateStorage(
                                            region.id,
                                            color.id,
                                            storage.id,
                                            'stockQuantity',
                                            e.target.value,
                                          )
                                        }
                                        required
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label>Low Stock Alert</Label>
                                      <Input
                                        type="number"
                                        placeholder="5"
                                        value={storage.lowStockAlert}
                                        onChange={e =>
                                          updateStorage(
                                            region.id,
                                            color.id,
                                            storage.id,
                                            'lowStockAlert',
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Videos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Product Videos</h2>
              <Button variant="outline" size="sm" onClick={addVideo}>
                <Plus className="mr-2 h-4 w-4" /> Add Video
              </Button>
            </div>
            {videos.map((video, idx) => (
              <div key={video.id} className="flex items-center gap-4">
                <Input
                  placeholder="Video URL (YouTube, Vimeo, etc.)"
                  value={video.url}
                  onChange={e => updateVideo(video.id, 'url', e.target.value)}
                  className="flex-1"
                />
                <Select
                  value={video.type}
                  onValueChange={val => updateVideo(video.id, 'type', val)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="vimeo">Vimeo</SelectItem>
                    <SelectItem value="cloudflare">Cloudflare</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {videos.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVideo(video.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Specifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Specifications</h2>
              <Button variant="outline" size="sm" onClick={addSpecification}>
                <Plus className="mr-2 h-4 w-4" /> Add Specification
              </Button>
            </div>

            <Card className="border">
              <CardContent className="space-y-2 pt-6">
                {specifications.map((spec, idx) => (
                  <div key={spec.id} className="flex items-center gap-2">
                    <Input
                      placeholder="Title (e.g. Brand, Model, Display Size)"
                      value={spec.key}
                      onChange={e =>
                        updateSpecification(spec.id, 'key', e.target.value)
                      }
                      className="flex-1"
                    />
                    <Input
                      placeholder="Value (e.g. Apple, MacBook Air M2, 13.6-inch)"
                      value={spec.value}
                      onChange={e =>
                        updateSpecification(spec.id, 'value', e.target.value)
                      }
                      className="flex-1"
                    />
                    {specifications.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSpecification(spec.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* SEO Settings */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">SEO Settings</h2>
            <div className="grid gap-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input
                id="seoTitle"
                placeholder="Enter SEO title"
                value={seoTitle}
                onChange={e => setSeoTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="seoDescription">SEO Description</Label>
              <Textarea
                id="seoDescription"
                placeholder="Enter SEO description"
                rows={3}
                value={seoDescription}
                onChange={e => setSeoDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="seoKeywords">
                SEO Keywords (comma separated)
              </Label>
              <Input
                id="seoKeywords"
                placeholder="e.g. iphone, apple, smartphone"
                value={seoKeywords}
                onChange={e => setSeoKeywords(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="seoCanonical">Canonical URL</Label>
              <Input
                id="seoCanonical"
                placeholder="https://example.com/product"
                value={seoCanonical}
                onChange={e => setSeoCanonical(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                placeholder="e.g. flagship, premium, 5G"
                value={tags}
                onChange={e => setTags(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-4">
        <Button variant="outline" disabled={isSubmitting}>
          Save as Draft
        </Button>
        <Button onClick={handlePublish} disabled={isSubmitting}>
          {isSubmitting ? 'Publishing...' : 'Publish Product'}
        </Button>
      </div>
    </div>
  );
}

export default withProtectedRoute(NewProductPage, {
  requiredRoles: ['admin'],
  fallbackTo: '/login',
  showLoader: true,
});
