import fitz # PyMuPDF
import os

pdf_path = r'C:/Users/ganes/.gemini/antigravity-ide/brain/96de9729-2d03-4f39-a8f2-6aef7961b2e8/.user_uploaded/media_1791909293063.pdf'
doc = fitz.open(pdf_path)
print('Total pages:', len(doc))

os.makedirs('extracted_assets', exist_ok=True)

for i in range(len(doc)):
    text = doc[i].get_text()
    if 'DATA FLOW' in text.upper() or 'DFD' in text.upper() or 'USE CASE' in text.upper():
        print(f'Page {i+1}: {text[:100].strip().replace(chr(10), " ")}')
        # Render this page as image to inspect visual sketching/diagram style!
        pix = doc[i].get_pixmap(dpi=150)
        pix.save(f'extracted_assets/page_{i+1}.png')
        print(f'  Rendered page_{i+1}.png')

# Extract images from front matter (for logo)
for pno in range(min(5, len(doc))):
    page = doc[pno]
    for img_idx, img in enumerate(page.get_images()):
        xref = img[0]
        base_img = doc.extract_image(xref)
        img_bytes = base_img['image']
        img_ext = base_img['ext']
        img_name = f'extracted_assets/p{pno+1}_img{img_idx+1}.{img_ext}'
        with open(img_name, 'wb') as f:
            f.write(img_bytes)
        print(f'Saved logo asset {img_name} ({base_img["width"]}x{base_img["height"]})')
