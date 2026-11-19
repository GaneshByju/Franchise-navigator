import re
import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement
from docx.oxml.ns import qn, nsdecls
from docx.oxml import parse_xml

def set_cell_background(cell, fill_color):
    """Sets background shading of a table cell."""
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Sets cell margins (padding in dxa)."""
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_table_borders(table, color="CCCCCC", sz="4", val="single"):
    """Sets clean borders on a table."""
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

def format_run_text(p, text, font_name="Times New Roman", font_size=12, bold=False, italic=False, color=None):
    """Parses markdown bold and italic inline within text and appends runs."""
    # Pattern to match bold (**text**) and italic (*text*)
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

def main():
    md_file_path = r"c:\Users\ganes\OneDrive\Desktop\franchise-investment-decision-support-system\PROJECT_REPORT_GANESH_B.md"
    docx_file_path = r"c:\Users\ganes\OneDrive\Desktop\franchise-investment-decision-support-system\PROJECT_REPORT_GANESH_B.docx"

    with open(md_file_path, "r", encoding="utf-8") as f:
        md_text = f.read()

    doc = Document()

    # Set 1-inch margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.page_width = Inches(8.5)
        section.page_height = Inches(11.0)

    # Base Normal Style setup
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Times New Roman'
    style_normal.font.size = Pt(12)
    style_normal.font.color.rgb = RGBColor(30, 30, 30)

    lines = md_text.split('\n')
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
            if line.strip().startswith('|') and line.strip().endswith('|'):
                cells = [c.strip() for c in line.strip()[1:-1].split('|')]
                # Skip markdown separator row like |:---:|---|
                if all(re.match(r'^:?-+:?$', c) for c in cells):
                    continue
                parsed_rows.append(cells)
        if not parsed_rows:
            return

        col_count = max(len(r) for r in parsed_rows)
        # normalize row length
        for r in parsed_rows:
            while len(r) < col_count:
                r.append("")

        tbl = doc.add_table(rows=len(parsed_rows), cols=col_count)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        set_table_borders(tbl, color="B0B0B0", sz="4")

        for r_idx, row in enumerate(parsed_rows):
            for c_idx, val in enumerate(row):
                cell = tbl.cell(r_idx, c_idx)
                cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
                set_cell_margins(cell, top=120, bottom=120, left=150, right=150)
                p = cell.paragraphs[0]
                p.paragraph_format.space_before = Pt(0)
                p.paragraph_format.space_after = Pt(0)
                p.paragraph_format.line_spacing = 1.15

                if r_idx == 0:
                    set_cell_background(cell, "1E293B") # Dark slate header
                    format_run_text(p, val, font_name="Times New Roman", font_size=10.5, bold=True, color=RGBColor(255, 255, 255))
                else:
                    if r_idx % 2 == 1:
                        set_cell_background(cell, "F8FAFC")
                    else:
                        set_cell_background(cell, "FFFFFF")
                    format_run_text(p, val, font_name="Times New Roman", font_size=10.5, bold=False, color=RGBColor(30, 30, 30))

        # Add small spacing after table
        space_p = doc.add_paragraph()
        space_p.paragraph_format.space_before = Pt(0)
        space_p.paragraph_format.space_after = Pt(6)

    def flush_code(lines_chunk):
        if not lines_chunk:
            return
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        set_table_borders(tbl, color="CBD5E1", sz="6")
        cell = tbl.cell(0, 0)
        set_cell_background(cell, "F1F5F9") # slate-100
        set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
        
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.05
        
        full_code = "\n".join(lines_chunk)
        run = p.add_run(full_code)
        run.font.name = "Consolas"
        run.font.size = Pt(9.5)
        run.font.color.rgb = RGBColor(15, 23, 42)

        space_p = doc.add_paragraph()
        space_p.paragraph_format.space_before = Pt(0)
        space_p.paragraph_format.space_after = Pt(6)

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

        # Handle Page Breaks
        if '<div style="page-break-after: always;"></div>' in line or (trimmed == '---' and i < len(lines)-1 and lines[i+1].strip().startswith('# ')):
            doc.add_page_break()
            i += 1
            continue

        if trimmed == '---':
            # Visual separator
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(4)
            p.paragraph_format.space_after = Pt(6)
            run = p.add_run("―" * 50)
            run.font.color.rgb = RGBColor(200, 200, 200)
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            i += 1
            continue

        if not trimmed:
            i += 1
            continue

        # Headings
        if trimmed.startswith('# '):
            title_text = trimmed[2:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(14)
            p.paragraph_format.space_after = Pt(6)
            p.paragraph_format.keep_with_next = True
            
            # Check if this is the main cover title or a chapter title
            if "A PROJECT REPORT" in title_text or "MAR ATHANASIOS" in title_text or "CHAPTER" in title_text:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                format_run_text(p, title_text, font_name="Times New Roman", font_size=16, bold=True, color=RGBColor(15, 23, 42))
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                format_run_text(p, title_text, font_name="Times New Roman", font_size=15, bold=True, color=RGBColor(15, 23, 42))
            i += 1
            continue

        if trimmed.startswith('## '):
            heading_text = trimmed[3:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(12)
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.keep_with_next = True
            if "BONAFIDE" in heading_text or "CERTIFICATE" in heading_text or "DECLARATION" in heading_text or "ACKNOWLEDGEMENT" in heading_text or "TABLE OF CONTENTS" in heading_text or "ABSTRACT" in heading_text:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            format_run_text(p, heading_text, font_name="Times New Roman", font_size=13.5, bold=True, color=RGBColor(30, 41, 59))
            i += 1
            continue

        if trimmed.startswith('### '):
            heading_text = trimmed[4:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(10)
            p.paragraph_format.space_after = Pt(3)
            p.paragraph_format.keep_with_next = True
            if "DEPARTMENT" in heading_text or "MASTER" in heading_text or "MAHATMA GANDHI" in heading_text or "2025" in heading_text or "TIRUVALLA" in heading_text:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            format_run_text(p, heading_text, font_name="Times New Roman", font_size=12.5, bold=True, color=RGBColor(30, 41, 59))
            i += 1
            continue

        if trimmed.startswith('#### '):
            heading_text = trimmed[5:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.keep_with_next = True
            format_run_text(p, heading_text, font_name="Times New Roman", font_size=11.5, bold=True, color=RGBColor(51, 65, 85))
            i += 1
            continue

        # Bullet list items
        if trimmed.startswith('- ') or trimmed.startswith('* '):
            bullet_text = trimmed[2:].strip()
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.25
            format_run_text(p, bullet_text, font_name="Times New Roman", font_size=11.5)
            i += 1
            continue

        # Numbered list items
        num_match = re.match(r'^(\d+)\.\s+(.*)$', trimmed)
        if num_match:
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Inches(0.25)
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.25
            r_num = p.add_run(f"{num_match.group(1)}. ")
            r_num.font.name = "Times New Roman"
            r_num.font.size = Pt(11.5)
            r_num.font.bold = True
            format_run_text(p, num_match.group(2), font_name="Times New Roman", font_size=11.5)
            i += 1
            continue

        # Regular Paragraph
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.25
        
        # Center align certificates lines if they contain specific phrases
        if ("Submitted to the" in trimmed or "In partial fulfillment" in trimmed or 
            "Under the Guidance of" in trimmed or "Project Done by" in trimmed or
            "GANESH B" in trimmed or "Reg No: 253242210219" in trimmed or
            "Mrs. SMITHA" in trimmed or "www.macfast.org" in trimmed or
            "BONAFIDE CERTIFICATE" in trimmed or "CERTIFICATE" in trimmed or "DECLARATION" in trimmed):
            if not ("I, GANESH B" in trimmed or "Certified that" in trimmed or "This is to certify" in trimmed):
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        else:
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

        format_run_text(p, trimmed, font_name="Times New Roman", font_size=11.5)
        i += 1

    if in_table:
        flush_table(table_lines)
    if in_code_block:
        flush_code(code_lines)

    doc.save(docx_file_path)
    print(f"SUCCESS: Report saved to {docx_file_path}")
    print(f"File size: {os.path.getsize(docx_file_path)} bytes")

if __name__ == "__main__":
    main()
