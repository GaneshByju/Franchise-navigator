import os
import re
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

WORKSPACE_DIR = r"c:\Users\ganes\OneDrive\Desktop\franchise-investment-decision-support-system"
MD_PATH = os.path.join(WORKSPACE_DIR, "PROJECT_REPORT_GANESH_B.md")
DOCX_PATH = os.path.join(WORKSPACE_DIR, "PROJECT_REPORT_GANESH_B_FINAL.docx")
DOCX_ORIGINAL_PATH = os.path.join(WORKSPACE_DIR, "PROJECT_REPORT_GANESH_B.docx")
ASSETS_DIR = os.path.join(WORKSPACE_DIR, "extracted_assets")
DIAGRAMS_DIR = os.path.join(WORKSPACE_DIR, "report_diagrams")

LOGO_COVER = os.path.join(ASSETS_DIR, "p1_img1.jpeg")  # Vertical MACFAST shield
LOGO_HEADER = os.path.join(ASSETS_DIR, "p2_img1.jpeg") # Horizontal MACFAST header

def sanitize_text(text):
    """Removes all &nbsp; and raw HTML entities."""
    if not text:
        return ""
    text = re.sub(r'&nbsp;?', ' ', text)
    text = re.sub(r'&amp;', '&', text)
    text = re.sub(r'&quot;', '"', text)
    text = re.sub(r'&lt;', '<', text)
    text = re.sub(r'&gt;', '>', text)
    text = re.sub(r'<br\s*/?>', '\n', text)
    text = re.sub(r'<[^>]+>', '', text)  # remove remaining html tags
    return text.strip()

def set_cell_background(cell, fill_color):
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_table_borders(table, color="CCCCCC", sz="4", val="single"):
    tblPr = table._element.xpath('w:tblPr')
    if tblPr:
        borders = parse_xml(f'''
            <w:tblBorders {nsdecls("w")}>
                <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            </w:tblBorders>
        ''')
        tblPr[0].append(borders)

def remove_table_borders(table):
    tblPr = table._element.xpath('w:tblPr')
    if tblPr:
        borders = parse_xml(f'''
            <w:tblBorders {nsdecls("w")}>
                <w:top w:val="none" w:sz="0" w:space="0" w:color="auto"/>
                <w:bottom w:val="none" w:sz="0" w:space="0" w:color="auto"/>
                <w:insideH w:val="none" w:sz="0" w:space="0" w:color="auto"/>
                <w:insideV w:val="none" w:sz="0" w:space="0" w:color="auto"/>
                <w:left w:val="none" w:sz="0" w:space="0" w:color="auto"/>
                <w:right w:val="none" w:sz="0" w:space="0" w:color="auto"/>
            </w:tblBorders>
        ''')
        tblPr[0].append(borders)

def format_run_text(p, text, font_name="Times New Roman", font_size=12, bold=False, italic=False, color=None):
    text = sanitize_text(text)
    if not text:
        return
    tokens = re.split(r'(\*\*.*?\*\*|\*.*?\*)', text)
    for token in tokens:
        if not token:
            continue
        is_bold = bold
        is_italic = italic
        run_text = token

        if token.startswith('**') and token.endswith('**') and len(token) >= 4:
            is_bold = True
            run_text = token[2:-2]
        elif token.startswith('*') and token.endswith('*') and len(token) >= 2:
            is_italic = True
            run_text = token[1:-1]

        run = p.add_run(run_text)
        run.font.name = font_name
        run.font.size = Pt(font_size)
        run.font.bold = is_bold
        run.font.italic = is_italic
        if color:
            run.font.color.rgb = color
        else:
            run.font.color.rgb = RGBColor(30, 30, 30)

def add_signature_table(doc, left_lines, right_lines):
    """Creates a clean, borderless 2-column signature table with left and right alignment."""
    tbl = doc.add_table(rows=1, cols=2)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    remove_table_borders(tbl)
    
    cell_left = tbl.cell(0, 0)
    cell_right = tbl.cell(0, 1)
    
    # Left cell
    p_left = cell_left.paragraphs[0]
    p_left.paragraph_format.space_before = Pt(0)
    p_left.paragraph_format.space_after = Pt(2)
    p_left.paragraph_format.line_spacing = 1.15
    p_left.alignment = WD_ALIGN_PARAGRAPH.LEFT
    for idx, (txt, b, it) in enumerate(left_lines):
        if idx > 0:
            p_left = cell_left.add_paragraph()
            p_left.paragraph_format.space_before = Pt(0)
            p_left.paragraph_format.space_after = Pt(2)
            p_left.paragraph_format.line_spacing = 1.15
            p_left.alignment = WD_ALIGN_PARAGRAPH.LEFT
        format_run_text(p_left, txt, font_size=11, bold=b, italic=it)

    # Right cell
    p_right = cell_right.paragraphs[0]
    p_right.paragraph_format.space_before = Pt(0)
    p_right.paragraph_format.space_after = Pt(2)
    p_right.paragraph_format.line_spacing = 1.15
    p_right.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    for idx, (txt, b, it) in enumerate(right_lines):
        if idx > 0:
            p_right = cell_right.add_paragraph()
            p_right.paragraph_format.space_before = Pt(0)
            p_right.paragraph_format.space_after = Pt(2)
            p_right.paragraph_format.line_spacing = 1.15
            p_right.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        format_run_text(p_right, txt, font_size=11, bold=b, italic=it)

    # Spacing after table
    sp = doc.add_paragraph()
    sp.paragraph_format.space_before = Pt(0)
    sp.paragraph_format.space_after = Pt(6)

def add_image_figure(doc, img_path, caption_text, width_inches=6.0):
    """Inserts a centered image followed by a formal italic figure caption."""
    if not os.path.exists(img_path):
        print(f"Warning: Image not found at {img_path}")
        return
    p_img = doc.add_paragraph()
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_img.paragraph_format.space_before = Pt(10)
    p_img.paragraph_format.space_after = Pt(4)
    run_img = p_img.add_run()
    run_img.add_picture(img_path, width=Inches(width_inches))

    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(2)
    p_cap.paragraph_format.space_after = Pt(10)
    format_run_text(p_cap, caption_text, font_size=10, italic=True, bold=True, color=RGBColor(70, 70, 70))

def build_front_matter(doc):
    """Builds the exact front-matter pages matching demo report formatting & college logos."""
    
    # -------------------------------------------------------------------------
    # PAGE 1: COVER PAGE (Matching front_page_1.png)
    # -------------------------------------------------------------------------
    def add_cover_para(text, font_size, bold=False, italic=False, space_before=2, space_after=2):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        format_run_text(p, text, font_size=font_size, bold=bold, italic=italic)
        return p

    add_cover_para("A Project Report", 14, bold=True, space_before=10, space_after=4)
    add_cover_para("On", 12, bold=True, space_before=2, space_after=6)
    add_cover_para("FRANCHISE INVESTMENT DECISION\nSUPPORT SYSTEM", 17, bold=True, space_before=4, space_after=14)
    add_cover_para("Submitted to the", 11.5, italic=True, space_before=4, space_after=2)
    add_cover_para("Department of Computer Applications", 13, bold=True, space_before=2, space_after=12)
    add_cover_para("In partial fulfillment of the", 11.5, italic=True, space_before=4, space_after=2)
    add_cover_para("MASTER OF COMPUTER APPLICATIONS", 13.5, bold=True, space_before=2, space_after=14)
    add_cover_para("Under the guidance of", 11.5, italic=True, space_before=4, space_after=2)
    add_cover_para("Mrs. SMITHA", 13, bold=True, space_before=2, space_after=14)
    add_cover_para("Project Done by", 11.5, space_before=4, space_after=2)
    add_cover_para("GANESH B", 13, bold=True, space_before=2, space_after=2)
    add_cover_para("Reg No:253242210219", 11, bold=True, space_before=0, space_after=12)

    # Center Logo (Vertical MACFAST shield)
    if os.path.exists(LOGO_COVER):
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_logo.paragraph_format.space_before = Pt(4)
        p_logo.paragraph_format.space_after = Pt(12)
        p_logo.add_run().add_picture(LOGO_COVER, width=Inches(1.8))

    add_cover_para("DEPARTMENT OF COMPUTER APPLICATIONS", 12, bold=True, space_before=2, space_after=2)
    add_cover_para("MAR ATHANASIOS COLLEGE FOR ADVANCED STUDIES", 12, bold=True, space_before=2, space_after=2)
    add_cover_para("TIRUVALLA(MACFAST)", 12, bold=True, space_before=2, space_after=2)
    add_cover_para("689101, KERALA www.macfast.org", 10.5, bold=True, space_before=2, space_after=2)
    add_cover_para("2025-2027", 11, bold=True, space_before=4, space_after=10)

    doc.add_page_break()

    # -------------------------------------------------------------------------
    # PAGE 2: BONAFIDE CERTIFICATE (Matching front_page_2.png)
    # -------------------------------------------------------------------------
    def add_cert_header():
        p1 = doc.add_paragraph()
        p1.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p1.paragraph_format.space_before = Pt(4)
        p1.paragraph_format.space_after = Pt(2)
        format_run_text(p1, "MAR ATHANASIOS COLLEGE FOR ADVANCED STUDIES", font_size=12, bold=True)

        p2 = doc.add_paragraph()
        p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p2.paragraph_format.space_before = Pt(0)
        p2.paragraph_format.space_after = Pt(6)
        format_run_text(p2, "TIRUVALLA (MACFAST), THIRUVALLA", font_size=11, bold=True)

        if os.path.exists(LOGO_HEADER):
            p_logo = doc.add_paragraph()
            p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_logo.paragraph_format.space_before = Pt(2)
            p_logo.paragraph_format.space_after = Pt(12)
            p_logo.add_run().add_picture(LOGO_HEADER, width=Inches(2.2))

    add_cert_header()

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(4)
    p_title.paragraph_format.space_after = Pt(10)
    format_run_text(p_title, "BONAFIDE CERTIFICATE", font_size=13, bold=True)

    p_body1 = doc.add_paragraph()
    p_body1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_body1.paragraph_format.space_before = Pt(4)
    p_body1.paragraph_format.space_after = Pt(6)
    format_run_text(p_body1, "Certified that the Project Work entitled", font_size=11, italic=False)

    p_proj = doc.add_paragraph()
    p_proj.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_proj.paragraph_format.space_before = Pt(4)
    p_proj.paragraph_format.space_after = Pt(8)
    format_run_text(p_proj, "FRANCHISE INVESTMENT DECISION\nSUPPORT SYSTEM", font_size=13.5, bold=True)

    p_body2 = doc.add_paragraph()
    p_body2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_body2.paragraph_format.space_before = Pt(4)
    p_body2.paragraph_format.space_after = Pt(6)
    format_run_text(p_body2, "is a Bonafide work done by", font_size=11, italic=False)

    p_cand = doc.add_paragraph()
    p_cand.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cand.paragraph_format.space_before = Pt(4)
    p_cand.paragraph_format.space_after = Pt(8)
    format_run_text(p_cand, "GANESH B", font_size=12.5, bold=True)

    p_body3 = doc.add_paragraph()
    p_body3.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_body3.paragraph_format.space_before = Pt(4)
    p_body3.paragraph_format.space_after = Pt(6)
    format_run_text(p_body3, "In partial fulfillment of the requirement for the Award of", font_size=11, italic=True)

    p_deg = doc.add_paragraph()
    p_deg.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_deg.paragraph_format.space_before = Pt(2)
    p_deg.paragraph_format.space_after = Pt(6)
    format_run_text(p_deg, "MASTER OF COMPUTER APPLICATIONS", font_size=12.5, bold=True)

    p_uni = doc.add_paragraph()
    p_uni.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_uni.paragraph_format.space_before = Pt(2)
    p_uni.paragraph_format.space_after = Pt(4)
    format_run_text(p_uni, "Degree From\nMahatma Gandhi University, Kottayam\n2025-2027", font_size=11, bold=True)

    # Empty space before signatures
    sp = doc.add_paragraph()
    sp.paragraph_format.space_after = Pt(20)

    # HOD & Guide Signatures (Matching demo report: Prof. TIJI THOMAS left, Mrs. SMITHA right)
    add_signature_table(
        doc,
        left_lines=[
            ("Prof. TIJI THOMAS", True, False),
            ("HEAD OF THE DEPARTMENT", True, False),
        ],
        right_lines=[
            ("Mrs. SMITHA", True, False),
            ("PROJECT GUIDE", True, False),
        ]
    )

    p_viva = doc.add_paragraph()
    p_viva.paragraph_format.space_before = Pt(14)
    p_viva.paragraph_format.space_after = Pt(16)
    format_run_text(p_viva, "Submitted for the Viva-voce Examination held on ....................", font_size=11, bold=True, italic=True)

    # Examiners Table
    add_signature_table(
        doc,
        left_lines=[
            ("External Examiners1: ........................................", True, False),
        ],
        right_lines=[
            ("External Examiners2: ........................................", True, False),
        ]
    )

    doc.add_page_break()

    # -------------------------------------------------------------------------
    # PAGE 3: COLLEGE CERTIFICATE (Matching front_page_3.png)
    # -------------------------------------------------------------------------
    add_cert_header()

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(6)
    p_title.paragraph_format.space_after = Pt(14)
    format_run_text(p_title, "CERTIFICATE", font_size=13, bold=True)

    p_text = doc.add_paragraph()
    p_text.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_text.paragraph_format.space_before = Pt(8)
    p_text.paragraph_format.space_after = Pt(24)
    p_text.paragraph_format.line_spacing = 1.3
    cert_text = (
        "This is to certify that the project ‘FRANCHISE INVESTMENT DECISION SUPPORT SYSTEM’ "
        "has been successfully carried out by GANESH B (Reg No:253242210219) in partial fulfilment "
        "of the course Master of Computer Applications."
    )
    format_run_text(p_text, cert_text, font_size=11.5)

    sp = doc.add_paragraph()
    sp.paragraph_format.space_after = Pt(24)

    # Left: Mrs. SMITHA INTERNAL GUIDE, Right: Prof. TIJI THOMAS HEAD OF DEPARTMENT
    add_signature_table(
        doc,
        left_lines=[
            ("Mrs. SMITHA", True, False),
            ("INTERNAL GUIDE", True, False),
        ],
        right_lines=[
            ("Prof. TIJI THOMAS", True, False),
            ("HEAD OF THE DEPARTMENT", True, False),
        ]
    )

    p_date = doc.add_paragraph()
    p_date.paragraph_format.space_before = Pt(20)
    format_run_text(p_date, "Date:-", font_size=11, bold=True)

    doc.add_page_break()

    # -------------------------------------------------------------------------
    # PAGE 4: GUIDE CERTIFICATE (Matching front_page_4.png)
    # -------------------------------------------------------------------------
    add_cert_header()

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(6)
    p_title.paragraph_format.space_after = Pt(14)
    format_run_text(p_title, "CERTIFICATE", font_size=13, bold=True)

    p_text = doc.add_paragraph()
    p_text.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_text.paragraph_format.space_before = Pt(8)
    p_text.paragraph_format.space_after = Pt(28)
    p_text.paragraph_format.line_spacing = 1.3
    guide_cert_text = (
        "This is to certify that the project ‘FRANCHISE INVESTMENT DECISION SUPPORT SYSTEM’ "
        "has been successfully carried out by GANESH B (Reg No:253242210219) in partial fulfilment "
        "of the course Master of Computer Applications under my guidance."
    )
    format_run_text(p_text, guide_cert_text, font_size=11.5)

    sp = doc.add_paragraph()
    sp.paragraph_format.space_after = Pt(24)

    add_signature_table(
        doc,
        left_lines=[
            ("DATE:-", True, False),
        ],
        right_lines=[
            ("Mrs. SMITHA", True, False),
            ("INTERNAL GUIDE", True, False),
        ]
    )

    doc.add_page_break()

    # -------------------------------------------------------------------------
    # PAGE 5: DECLARATION (Matching front_page_5.png)
    # -------------------------------------------------------------------------
    add_cert_header()

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(6)
    p_title.paragraph_format.space_after = Pt(14)
    format_run_text(p_title, "DECLARATION", font_size=13, bold=True)

    p_text = doc.add_paragraph()
    p_text.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_text.paragraph_format.space_before = Pt(8)
    p_text.paragraph_format.space_after = Pt(28)
    p_text.paragraph_format.line_spacing = 1.3
    decl_text = (
        "I, GANESH B, hereby declare that the project work entitled “FRANCHISE INVESTMENT DECISION "
        "SUPPORT SYSTEM” is an authenticated work carried out by me under the guidance of Mrs. SMITHA "
        "for the partial fulfilment of the course MASTER OF COMPUTER APPLICATIONS. This work had not "
        "been submitted for a similar purpose anywhere else except to MAR ATHANASIOS COLLEGE FOR "
        "ADVANCED STUDIES TIRUVALLA (MACFAST), THIRUVALLA. I understand that detection of any such copying "
        "is liable to be punished in any way the college deems fit."
    )
    format_run_text(p_text, decl_text, font_size=11.5)

    sp = doc.add_paragraph()
    sp.paragraph_format.space_after = Pt(24)

    add_signature_table(
        doc,
        left_lines=[
            ("Date:", True, False),
            ("Place: Thiruvalla", True, False),
        ],
        right_lines=[
            ("GANESH B", True, False),
            ("(Reg No: 253242210219)", False, True),
        ]
    )

    doc.add_page_break()

def main():
    print("Reading markdown report...")
    with open(MD_PATH, "r", encoding="utf-8") as f:
        md_text = f.read()

    doc = Document()

    # Standard A4 / Letter Dimensions with 1-inch margins
    for s in doc.sections:
        s.top_margin = Inches(1.0)
        s.bottom_margin = Inches(1.0)
        s.left_margin = Inches(1.0)
        s.right_margin = Inches(1.0)
        s.page_width = Inches(8.5)
        s.page_height = Inches(11.0)

    # Base Normal Style setup
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Times New Roman'
    style_normal.font.size = Pt(11.5)
    style_normal.font.color.rgb = RGBColor(30, 30, 30)

    print("Building front matter (Pages 1-5 with MACFAST logos)...")
    build_front_matter(doc)

    # Process markdown starting from Acknowledgement
    # Find start of ACKNOWLEDGEMENT
    ack_pos = md_text.find("## ACKNOWLEDGEMENT")
    if ack_pos != -1:
        body_md = md_text[ack_pos:]
    else:
        body_md = md_text

    lines = body_md.split('\n')
    i = 0
    in_code_block = False
    code_lines = []
    in_table = False
    table_lines = []

    def flush_table(lines_chunk):
        if not lines_chunk:
            return
        parsed_rows = []
        for line in lines_chunk:
            line_str = line.strip()
            if line_str.startswith('|') and line_str.endswith('|'):
                cells = [sanitize_text(c) for c in line_str[1:-1].split('|')]
                if all(re.match(r'^:?-+:?$', c) for c in cells):
                    continue
                parsed_rows.append(cells)
        if not parsed_rows:
            return

        col_count = max(len(r) for r in parsed_rows)
        for r in parsed_rows:
            while len(r) < col_count:
                r.append("")

        tbl = doc.add_table(rows=len(parsed_rows), cols=col_count)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        set_table_borders(tbl, color="CBD5E1", sz="4")

        for r_idx, row in enumerate(parsed_rows):
            for c_idx, val in enumerate(row):
                cell = tbl.cell(r_idx, c_idx)
                cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
                set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
                p = cell.paragraphs[0]
                p.paragraph_format.space_before = Pt(0)
                p.paragraph_format.space_after = Pt(0)
                p.paragraph_format.line_spacing = 1.15

                if r_idx == 0:
                    set_cell_background(cell, "1E293B")
                    format_run_text(p, val, font_size=10, bold=True, color=RGBColor(255, 255, 255))
                else:
                    if r_idx % 2 == 1:
                        set_cell_background(cell, "F8FAFC")
                    else:
                        set_cell_background(cell, "FFFFFF")
                    format_run_text(p, val, font_size=10, bold=False, color=RGBColor(30, 30, 30))

        sp = doc.add_paragraph()
        sp.paragraph_format.space_before = Pt(0)
        sp.paragraph_format.space_after = Pt(4)

    def flush_code(lines_chunk):
        if not lines_chunk:
            return
        # If this is ASCII diagram art, skip it because we embed the actual diagram image!
        first_few = "\n".join(lines_chunk[:4])
        if any(char in first_few for char in ['┌', '├', '│', '+--', '|  FRANCHISE', '|       INVESTOR', '[Start]', '[Franchiser', '<Trademark']):
            return

        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        set_table_borders(tbl, color="CBD5E1", sz="5")
        cell = tbl.cell(0, 0)
        set_cell_background(cell, "F8FAFC")
        set_cell_margins(cell, top=120, bottom=120, left=160, right=160)

        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.05

        full_code = "\n".join(lines_chunk)
        run = p.add_run(full_code)
        run.font.name = "Consolas"
        run.font.size = Pt(9.0)
        run.font.color.rgb = RGBColor(15, 23, 42)

        sp = doc.add_paragraph()
        sp.paragraph_format.space_before = Pt(0)
        sp.paragraph_format.space_after = Pt(4)

    while i < len(lines):
        line = lines[i]
        trimmed = line.strip()

        # Handle Code Blocks
        if trimmed.startswith('```'):
            if in_code_block:
                in_code_block = False
                flush_code(code_lines)
                code_lines = []
            else:
                if in_table:
                    flush_table(table_lines)
                    table_lines = []
                    in_table = False
                in_code_block = True
                code_lines = []
            i += 1
            continue

        if in_code_block:
            code_lines.append(line)
            i += 1
            continue

        # Handle Markdown Tables
        if trimmed.startswith('|') and trimmed.endswith('|'):
            if not in_table:
                in_table = True
                table_lines = []
            table_lines.append(trimmed)
            i += 1
            continue
        else:
            if in_table:
                flush_table(table_lines)
                table_lines = []
                in_table = False

        # Page Breaks
        if '<div style="page-break-after: always;"></div>' in line:
            doc.add_page_break()
            i += 1
            continue

        if trimmed == '---':
            i += 1
            continue

        if not trimmed:
            i += 1
            continue

        # Section Headings & Image Injections
        if trimmed.startswith('# '):
            heading_text = sanitize_text(trimmed[2:])
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(14)
            p.paragraph_format.space_after = Pt(6)
            p.paragraph_format.keep_with_next = True
            if "CHAPTER" in heading_text:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                format_run_text(p, heading_text, font_size=15, bold=True, color=RGBColor(15, 23, 42))
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                format_run_text(p, heading_text, font_size=14, bold=True, color=RGBColor(15, 23, 42))
            i += 1
            continue

        if trimmed.startswith('## '):
            heading_text = sanitize_text(trimmed[3:])
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(12)
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.keep_with_next = True
            if "TABLE OF CONTENTS" in heading_text or "ABSTRACT" in heading_text or "ACKNOWLEDGEMENT" in heading_text:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            format_run_text(p, heading_text, font_size=13, bold=True, color=RGBColor(30, 41, 59))
            i += 1
            continue

        if trimmed.startswith('### '):
            heading_text = sanitize_text(trimmed[4:])
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(10)
            p.paragraph_format.space_after = Pt(3)
            p.paragraph_format.keep_with_next = True
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            format_run_text(p, heading_text, font_size=12, bold=True, color=RGBColor(30, 41, 59))

            # DIAGRAM INJECTIONS BASED ON SECTION HEADERS
            if "3.2 DATABASE DESIGN" in heading_text:
                # Add ER and Class Diagram
                add_image_figure(doc, os.path.join(DIAGRAMS_DIR, "fig_er_diagram.png"),
                                 "Figure 3.1: Entity-Relationship (ER) Architecture", width_inches=6.2)
                add_image_figure(doc, os.path.join(DIAGRAMS_DIR, "fig_class_diagram.png"),
                                 "Figure 3.2: UML Domain Class Diagram", width_inches=6.0)

            elif "6.3 GANTT CHART" in heading_text:
                add_image_figure(doc, os.path.join(DIAGRAMS_DIR, "fig_gantt_chart.png"),
                                 "Figure 6.1: 12-Week Implementation Gantt Chart", width_inches=6.2)

            elif "6.4 PERT CHART" in heading_text:
                add_image_figure(doc, os.path.join(DIAGRAMS_DIR, "fig_pert_chart.png"),
                                 "Figure 6.2: Program Evaluation and Review Technique (PERT) Network", width_inches=6.2)

            i += 1
            continue

        if trimmed.startswith('#### '):
            heading_text = sanitize_text(trimmed[5:])
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.keep_with_next = True
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            format_run_text(p, heading_text, font_size=11, bold=True, color=RGBColor(51, 65, 85))

            # DFD and UML Injections
            if "3.3.1 DFD LEVEL 0" in heading_text:
                add_image_figure(doc, os.path.join(DIAGRAMS_DIR, "fig_dfd_level0.png"),
                                 "Figure 3.3: Level 0 Data Flow Diagram (Context Model)", width_inches=6.2)
            elif "3.3.2 DFD LEVEL 1" in heading_text:
                add_image_figure(doc, os.path.join(DIAGRAMS_DIR, "fig_dfd_level1.png"),
                                 "Figure 3.4: Level 1 Data Flow Diagram (System Processing Modules & Database Stores)", width_inches=6.2)
            elif "3.3.3 DFD LEVEL 2" in heading_text:
                add_image_figure(doc, os.path.join(DIAGRAMS_DIR, "fig_dfd_level2.png"),
                                 "Figure 3.5: Level 2 Data Flow Diagram (Sub-Process 3.0: DSS Investment Engine)", width_inches=6.2)
            elif "3.4.1 USE CASE" in heading_text:
                add_image_figure(doc, os.path.join(DIAGRAMS_DIR, "fig_use_case.png"),
                                 "Figure 3.6: UML Use Case Diagram", width_inches=5.2)
            elif "3.4.2 ACTIVITY DIAGRAM" in heading_text:
                add_image_figure(doc, os.path.join(DIAGRAMS_DIR, "fig_activity.png"),
                                 "Figure 3.7: UML Activity Flow Diagram (Statutory Compliance & Contracting)", width_inches=3.95)
            elif "3.4.3 SEQUENCE DIAGRAM" in heading_text:
                add_image_figure(doc, os.path.join(DIAGRAMS_DIR, "fig_sequence_diagram.png"),
                                 "Figure 3.8: UML Sequence Diagram (Proposal, Evaluation & Bilateral E-Sign)", width_inches=6.2)

            i += 1
            continue

        # Bullet List Items
        if trimmed.startswith('- ') or trimmed.startswith('* '):
            bullet_text = sanitize_text(trimmed[2:])
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.2
            format_run_text(p, bullet_text, font_size=11)
            i += 1
            continue

        # Numbered List Items
        num_match = re.match(r'^(\d+)\.\s+(.*)$', trimmed)
        if num_match:
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Inches(0.25)
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.2
            r_num = p.add_run(f"{num_match.group(1)}. ")
            r_num.font.name = "Times New Roman"
            r_num.font.size = Pt(11)
            r_num.font.bold = True
            format_run_text(p, num_match.group(2), font_size=11)
            i += 1
            continue

        # Regular Paragraph
        clean_para = sanitize_text(trimmed)
        if clean_para:
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.line_spacing = 1.2
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            format_run_text(p, clean_para, font_size=11)

        i += 1

    if in_table:
        flush_table(table_lines)
    if in_code_block:
        flush_code(code_lines)

    print(f"Saving final report to {DOCX_PATH}...")
    doc.save(DOCX_PATH)
    file_size = os.path.getsize(DOCX_PATH)
    print(f"SUCCESS: Report saved successfully to {DOCX_PATH}! File size: {file_size:,} bytes")
    
    try:
        import shutil
        shutil.copy2(DOCX_PATH, DOCX_ORIGINAL_PATH)
        print(f"SUCCESS: Also updated {DOCX_ORIGINAL_PATH}")
    except Exception as e:
        print(f"Note: {DOCX_ORIGINAL_PATH} is open in Word, saved to {DOCX_PATH}")

if __name__ == "__main__":
    main()
