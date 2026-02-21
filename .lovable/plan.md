

## Add react-helmet-async for Dynamic Meta Tags

### Overview
Install the `react-helmet-async` package and wrap the App component with `<HelmetProvider>` to enable injecting meta tags and structured data into the `<head>` of each page dynamically.

### Changes

1. **Install `react-helmet-async` package**

2. **Update `src/App.tsx`**
   - Import `HelmetProvider` from `react-helmet-async`
   - Wrap the entire app tree with `<HelmetProvider>` as the outermost wrapper

### Technical Details

The updated App component structure will be:

```text
<HelmetProvider>          <-- NEW
  <QueryClientProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>...</Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
</HelmetProvider>
```

After this, any page or component can use `<Helmet>` to set page-specific titles, meta descriptions, Open Graph tags, and JSON-LD structured data.

