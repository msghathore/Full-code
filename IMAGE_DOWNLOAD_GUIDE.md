# 📸 Zavira Website - Professional Photo Download Guide

## 🎯 Quick Start (30 minutes to complete website)

Follow this guide to download ALL photos needed for zavira.ca

---

## ✅ PRIORITY 1: Service Category Cards (6 photos) - 1024x1024

### 1. Hair Services → `hair-service.jpg`
**Download from:** https://unsplash.com/photos/DW0u4rPrrqQ
- Click "Download free" (top right)
- Save as: `hair-service.jpg`
- Move to: `public/images/`

### 2. Massage Services → `massage-service.jpg`
**Search:** https://unsplash.com/s/photos/massage-therapy
- Find a peaceful massage scene
- Click photo → "Download free"
- Save as: `massage-service.jpg`

### 3. Nails Services → `nails-service.jpg`
**Search:** https://unsplash.com/s/photos/nail-art
- Find beautiful finished nails or manicure
- Download and save as: `nails-service.jpg`

### 4. Piercing Services → `piercing-service.jpg`
**Search:** https://unsplash.com/s/photos/ear-piercing
- Find elegant ear with jewelry
- Download and save as: `piercing-service.jpg`

### 5. Skin/Facial Services → `skin-service.jpg`
**Search:** https://unsplash.com/s/photos/facial-treatment
- Find facial treatment or glowing skin
- Download and save as: `skin-service.jpg`

### 6. Tattoo Services → `tattoo-service.jpg`
**Search:** https://www.pexels.com/search/tattoo/
- Find beautiful tattoo artwork
- Download and save as: `tattoo-service.jpg`

### 7. Waxing Services → `waxing-service.jpg`
**Search:** https://unsplash.com/s/photos/spa-treatment
- Find spa/beauty treatment scene
- Download and save as: `waxing-service.jpg`

---

## 📦 PRIORITY 2: Product Images (25 photos) - 1024x1024

**Search on Unsplash:**
- **Hair Products:** https://unsplash.com/s/photos/shampoo
- **Skin Products:** https://unsplash.com/s/photos/skincare-product
- **Nail Products:** https://unsplash.com/s/photos/nail-polish
- **Body Products:** https://unsplash.com/s/photos/beauty-products

Download 25 different product photos and save as:
- `product-1.jpg` through `product-25.jpg`

**Pro Tip:** Look for clean, white background product shots

---

## 📝 PRIORITY 3: Blog Header Images (11 photos) - 1280x720

**Search on Unsplash:**
- https://unsplash.com/s/photos/beauty
- https://unsplash.com/s/photos/wellness
- https://unsplash.com/s/photos/hair-care

Download 11 lifestyle/beauty photos and save as:
- `blog-1.jpg` through `blog-11.jpg`

---

## 👥 PRIORITY 4: Testimonial Images (5 photos) - 768x768

**Search on Unsplash:**
- https://unsplash.com/s/photos/portrait
- Look for diverse, friendly faces

Download 5 portrait photos and save as:
- `client-1.jpg` through `client-5.jpg`

---

## 🚀 Quick Download Method

### Option A: Manual (Recommended for best quality)
1. Open each Unsplash link above
2. Click photo you like
3. Click "Download free" (top right)
4. Save to `public/images/` folder
5. Rename to match the filename above

### Option B: Run Placeholder Script (Temporary)
```powershell
# Get basic placeholders immediately
.\download-images.ps1
```
Then replace with real photos later

---

## 📱 Image Specifications

| Type | Size | Ratio | Format |
|------|------|-------|--------|
| Service Cards | 1024x1024 | 1:1 Square | JPG |
| Products | 1024x1024 | 1:1 Square | JPG |
| Blog Headers | 1280x720 | 16:9 Wide | JPG |
| Testimonials | 768x768 | 1:1 Square | JPG |

---

## ✅ After Downloading All Photos

1. **Verify all images are in:** `public/images/`
2. **Test locally:**
   ```bash
   npm run dev
   ```
3. **Check mobile view:** Open http://localhost:5173 on phone
4. **Commit changes:**
   ```bash
   git add public/images/
   git commit -m "Add professional photos to website"
   git push
   ```
5. **Deploy:** Vercel will auto-deploy

---

## 💡 Photo Selection Tips

✅ **DO:**
- Choose natural, realistic photos
- Pick diverse representation
- Use consistent lighting/style
- Prefer natural skin tones

❌ **AVOID:**
- Overly airbrushed images
- Stock photos with watermarks
- Low resolution images
- Photos with visible hands holding tools (AI artifacts)

---

## 🆘 Need Help?

**Can't find good photos?**
- Wait 22 hours for AI image generation quota to reset
- Hire a photographer for original photos
- Use Canva Pro for premium stock photos

**Images not showing?**
- Check filename matches exactly (case-sensitive)
- Verify file is in `public/images/` folder
- Clear browser cache
- Run `npm run dev` again

---

## 📊 Progress Checklist

- [ ] 6 Service category images
- [ ] 25 Product images
- [ ] 11 Blog header images
- [ ] 5 Testimonial images
- [ ] Test website locally
- [ ] Commit and push to GitHub
- [ ] Verify on zavira.ca

**Total: 47 images to complete your website! 🎉**
