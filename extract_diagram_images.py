import pymupdf

doc = pymupdf.open(r'C:/Users/ganes/.gemini/antigravity-ide/brain/96de9729-2d03-4f39-a8f2-6aef7961b2e8/.user_uploaded/media_1791909293063.pdf')
for p in range(18, 36):
    page = doc[p-1]
    imgs = page.get_images()
    if imgs:
        print(f'Page {p}: images={len(imgs)}')
        for img_idx, img in enumerate(imgs):
            xref = img[0]
            base_img = doc.extract_image(xref)
            ext = base_img['ext']
            w = base_img['width']
            h = base_img['height']
            img_name = f'extracted_assets/p{p}_img{img_idx+1}.{ext}'
            with open(img_name, 'wb') as f:
                f.write(base_img['image'])
            print(f'  saved {img_name} ({w}x{h})')
