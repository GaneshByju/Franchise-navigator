import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import Ellipse, Rectangle, Circle, FancyArrowPatch
import numpy as np

OUTPUT_DIR = r"c:\Users\ganes\OneDrive\Desktop\franchise-investment-decision-support-system\report_diagrams"
os.makedirs(OUTPUT_DIR, exist_ok=True)

FONT_FAMILY = 'DejaVu Sans'
COLOR_BG = '#FFFFFF'
COLOR_BORDER = '#111827'       # Dark crisp border (demo report)
COLOR_MODULE_FILL = '#F3F4F6'  # Demo report process block fill
COLOR_BADGE_FILL = '#D1D5DB'   # Demo report gray badge fill
COLOR_BADGE_TEXT = '#111827'
COLOR_TEXT = '#111827'
COLOR_CYLINDER_FILL = '#E5E7EB'
COLOR_CYLINDER_TOP = '#D1D5DB'

def draw_cylinder(ax, x, y, w, h, label, font_size=8.5, bold=True):
    """Draws a clean 3D database cylinder matching demo report style."""
    r_h = h * 0.22
    rect = Rectangle((x - w/2, y - h/2 + r_h/2), w, h - r_h,
                     facecolor=COLOR_CYLINDER_FILL, edgecolor=COLOR_BORDER, linewidth=1.6, zorder=3)
    ax.add_patch(rect)
    bottom_ellipse = Ellipse((x, y - h/2 + r_h/2), w, r_h,
                             facecolor=COLOR_CYLINDER_FILL, edgecolor=COLOR_BORDER, linewidth=1.6, zorder=3)
    ax.add_patch(bottom_ellipse)
    rect_inner = Rectangle((x - w/2 + 0.05, y - h/2 + r_h/2), w - 0.1, h - r_h,
                           facecolor=COLOR_CYLINDER_FILL, edgecolor='none', zorder=4)
    ax.add_patch(rect_inner)
    top_ellipse = Ellipse((x, y + h/2 - r_h/2), w, r_h,
                          facecolor=COLOR_CYLINDER_TOP, edgecolor=COLOR_BORDER, linewidth=1.6, zorder=5)
    ax.add_patch(top_ellipse)
    ax.text(x, y - 0.04*h, label, ha='center', va='center', fontsize=font_size,
            fontfamily=FONT_FAMILY, fontweight='bold' if bold else 'normal',
            color=COLOR_TEXT, zorder=7, multialignment='center')

def draw_badge(ax, x, y, w, h, text, font_size=8.0, bold=False):
    """Draws a rectangular gray label badge matching demo report style."""
    rect = Rectangle((x - w/2, y - h/2), w, h,
                     facecolor=COLOR_BADGE_FILL, edgecolor='none', zorder=8)
    ax.add_patch(rect)
    ax.text(x, y, text, ha='center', va='center', fontsize=font_size,
            fontfamily=FONT_FAMILY, fontweight='bold' if bold else 'normal',
            color=COLOR_BADGE_TEXT, zorder=9, multialignment='center')

def draw_arrow(ax, start, end, rad=0.0, lw=1.5, color=COLOR_BORDER):
    """Draws a clean directed arrow matching demo report style."""
    arrow = FancyArrowPatch(
        start, end,
        connectionstyle=f"arc3,rad={rad}",
        arrowstyle='-|>',
        mutation_scale=11,
        linewidth=lw,
        color=color,
        zorder=2
    )
    ax.add_patch(arrow)

# ==============================================================================
# 1. LEVEL 0 DFD (Context Diagram - Identical to p26_img2.png)
# ==============================================================================
def generate_dfd_level0():
    fig, ax = plt.subplots(figsize=(15.5, 6.0), dpi=200)
    fig.patch.set_facecolor(COLOR_BG)
    ax.set_facecolor(COLOR_BG)
    ax.set_xlim(0, 155)
    ax.set_ylim(0, 60)
    ax.axis('off')

    # Central System Boundary Rectangle
    sb_w, sb_h = 42, 57
    sb_x, sb_y = 68, 29.5
    rect_sb = Rectangle((sb_x - sb_w/2, sb_y - sb_h/2), sb_w, sb_h,
                        facecolor='#FFFFFF', edgecolor=COLOR_BORDER, linewidth=2.0, zorder=1)
    ax.add_patch(rect_sb)
    # Centered title safely inside boundary
    ax.text(sb_x, sb_y + sb_h/2 - 3.5, "Franchise Investment Decision Support System Boundary",
            ha='center', va='center', fontsize=10.5, fontfamily=FONT_FAMILY, fontweight='bold',
            color=COLOR_TEXT, zorder=6)

    # Core Engine Circle inside System Boundary
    circle_r = 21.0
    circle = Circle((sb_x, sb_y - 2.5), circle_r,
                    facecolor='#FFFFFF', edgecolor=COLOR_BORDER, linewidth=2.2, zorder=3)
    ax.add_patch(circle)
    ax.text(sb_x, sb_y - 2.5, "Franchise Investment Decision\nSupport System (FDSS)\nCore Platform Engine",
            ha='center', va='center', fontsize=11.5, fontfamily=FONT_FAMILY, fontweight='bold',
            color=COLOR_TEXT, zorder=7, multialignment='center', linespacing=1.3)

    # Left Entity: Franchiser (Brand Owner)
    ent_left_x, ent_left_y = 14, 27.5
    ent_w, ent_h = 24, 9.0
    rect_left = Rectangle((ent_left_x - ent_w/2, ent_left_y - ent_h/2), ent_w, ent_h,
                          facecolor='#FFFFFF', edgecolor=COLOR_BORDER, linewidth=2.0, zorder=3)
    ax.add_patch(rect_left)
    ax.text(ent_left_x, ent_left_y, "Franchiser\n(Brand Owner)",
            ha='center', va='center', fontsize=10.5, fontfamily=FONT_FAMILY, fontweight='bold',
            color=COLOR_TEXT, zorder=7, multialignment='center')

    # Flow from Franchiser to Core Engine
    badge_left_x, badge_left_y = 36.5, 27.5
    draw_badge(ax, badge_left_x, badge_left_y, 19, 5.0,
               "1. Brand Profile, CapEx &\nFinancial Metrics Specs", font_size=8.0)
    draw_arrow(ax, (ent_left_x + ent_w/2, ent_left_y), (badge_left_x - 9.5, badge_left_y), lw=1.6)
    draw_arrow(ax, (badge_left_x + 9.5, badge_left_y), (sb_x - circle_r, badge_left_y), lw=1.6)

    # Right Entity: Investor / End-User
    ent_right_x, ent_right_y = 143, 27.5
    rect_right = Rectangle((ent_right_x - ent_w/2, ent_right_y - ent_h/2), ent_w, ent_h,
                           facecolor='#FFFFFF', edgecolor=COLOR_BORDER, linewidth=2.0, zorder=3)
    ax.add_patch(rect_right)
    ax.text(ent_right_x, ent_right_y, "Investor /\nEnd-User Franchisee",
            ha='center', va='center', fontsize=10.5, fontfamily=FONT_FAMILY, fontweight='bold',
            color=COLOR_TEXT, zorder=7, multialignment='center')

    # Right Stack of 7 Gray Badges - Exact layout of p26_img2.png!
    b_x = 111
    b_w = 26.5
    b_h = 4.2
    badge_items = [
        (47.5, "A. JWT Bearer Security & Session Token", False),
        (41.0, "B. Verified Brand Catalog & ROI Cards", False),
        (34.5, "C. Real-Time Multi-Scenario DCF Projections", False),
        (28.0, "D. Feasibility Scorecard (NPV, IRR, Payback)", False),
        (21.5, "2. User Registration & Auth Credentials", True),
        (15.0, "3. Investment Horizon & Risk Criteria", True),
        (8.5,  "4. Territory Application & Dual E-Signature", True),
    ]

    circ_center_y = sb_y - 2.5
    for y_pos, b_text, is_input in badge_items:
        draw_badge(ax, b_x, y_pos, b_w, b_h, b_text, font_size=8.0)

        dy = y_pos - circ_center_y
        dx = np.sqrt(max(0, circle_r**2 - dy**2))
        circ_pt = (sb_x + dx, y_pos)
        ent_pt = (ent_right_x - ent_w/2, ent_right_y)

        if not is_input:
            rad_val = 0.08 if dy > 0 else -0.08
            draw_arrow(ax, circ_pt, (b_x - b_w/2, y_pos), rad=rad_val, lw=1.5)
            draw_arrow(ax, (b_x + b_w/2, y_pos), ent_pt, rad=-0.04 if dy > 0 else 0.04, lw=1.5)
        else:
            rad_val = 0.05 if dy > 0 else -0.05
            draw_arrow(ax, ent_pt, (b_x + b_w/2, y_pos), rad=rad_val, lw=1.5)
            draw_arrow(ax, (b_x - b_w/2, y_pos), circ_pt, rad=-0.08 if dy > 0 else 0.08, lw=1.5)

    plt.tight_layout(pad=0.2)
    output_path = os.path.join(OUTPUT_DIR, "fig_dfd_level0.png")
    plt.savefig(output_path, dpi=200, facecolor=COLOR_BG)
    plt.close()
    print("Generated:", output_path)

# ==============================================================================
# 2. LEVEL 1 DFD (Matching p27_img1.png Layout & Style)
# ==============================================================================
def generate_dfd_level1():
    fig, ax = plt.subplots(figsize=(16.5, 7.8), dpi=200)
    fig.patch.set_facecolor(COLOR_BG)
    ax.set_facecolor(COLOR_BG)
    ax.set_xlim(0, 165)
    ax.set_ylim(0, 78)
    ax.axis('off')

    # Left External Entity: Franchiser (Brand Owner)
    f_x, f_y = 10, 58
    f_w, f_h = 16, 7.5
    rect_f = Rectangle((f_x - f_w/2, f_y - f_h/2), f_w, f_h,
                       facecolor=COLOR_MODULE_FILL, edgecolor=COLOR_BORDER, linewidth=1.6, zorder=3)
    ax.add_patch(rect_f)
    ax.text(f_x, f_y, "Franchiser\n(Brand Owner)", ha='center', va='center',
            fontsize=9.0, fontfamily=FONT_FAMILY, fontweight='bold', color=COLOR_TEXT, zorder=7)

    # Bottom External Entity: Investor
    inv_x, inv_y = 75, 4.5
    inv_w, inv_h = 18, 6.0
    rect_inv = Rectangle((inv_x - inv_w/2, inv_y - inv_h/2), inv_w, inv_h,
                         facecolor=COLOR_MODULE_FILL, edgecolor=COLOR_BORDER, linewidth=1.6, zorder=3)
    ax.add_patch(rect_inv)
    ax.text(inv_x, inv_y, "Investor / Franchisee", ha='center', va='center',
            fontsize=9.0, fontfamily=FONT_FAMILY, fontweight='bold', color=COLOR_TEXT, zorder=7)

    # Central Box: System Processing Modules
    sm_x, sm_y = 75, 42
    sm_w, sm_h = 96, 66
    rect_sm = Rectangle((sm_x - sm_w/2, sm_y - sm_h/2), sm_w, sm_h,
                        facecolor='#FFFFFF', edgecolor=COLOR_BORDER, linewidth=1.8, zorder=1)
    ax.add_patch(rect_sm)
    ax.text(sm_x, sm_y + sm_h/2 - 3.0, "System Processing Modules",
            ha='center', va='center', fontsize=11, fontfamily=FONT_FAMILY, fontweight='bold',
            color=COLOR_TEXT, zorder=6)

    # Right Box: Database Stores
    db_box_x, db_box_y = 150, 42
    db_box_w, db_box_h = 24, 66
    rect_db = Rectangle((db_box_x - db_box_w/2, db_box_y - db_box_h/2), db_box_w, db_box_h,
                        facecolor='#FFFFFF', edgecolor=COLOR_BORDER, linewidth=1.8, zorder=1)
    ax.add_patch(rect_db)
    ax.text(db_box_x, db_box_y + db_box_h/2 - 3.0, "Database Stores",
            ha='center', va='center', fontsize=10.5, fontfamily=FONT_FAMILY, fontweight='bold',
            color=COLOR_TEXT, zorder=6)

    # 5 Cylinders stacked inside Database Stores (Exact 3D styling from demo report!)
    cyl_w, cyl_h = 19, 9.2
    cylinders = [
        (db_box_x, 66, "User Accounts Store"),
        (db_box_x, 53, "Franchise Listings Store"),
        (db_box_x, 40, "Compliance Vault Store"),
        (db_box_x, 27, "Applications & Quotas"),
        (db_box_x, 14, "Contracts & Audit Ledger")
    ]
    for cx, cy, clabel in cylinders:
        draw_cylinder(ax, cx, cy, cyl_w, cyl_h, clabel, font_size=8.0)

    # 5 Processing Modules
    mod_w, mod_h = 24, 7.5

    # Module 1.0
    m1_x, m1_y = 44, 66
    rect_m1 = Rectangle((m1_x - mod_w/2, m1_y - mod_h/2), mod_w, mod_h,
                        facecolor=COLOR_MODULE_FILL, edgecolor=COLOR_BORDER, linewidth=1.5, zorder=3)
    ax.add_patch(rect_m1)
    ax.text(m1_x, m1_y, "1.0 User Authentication &\nSession Management", ha='center', va='center',
            fontsize=8.5, fontfamily=FONT_FAMILY, fontweight='bold', color=COLOR_TEXT, zorder=7)

    # Module 2.0
    m2_x, m2_y = 44, 46.5
    rect_m2 = Rectangle((m2_x - mod_w/2, m2_y - mod_h/2), mod_w, mod_h,
                        facecolor=COLOR_MODULE_FILL, edgecolor=COLOR_BORDER, linewidth=1.5, zorder=3)
    ax.add_patch(rect_m2)
    ax.text(m2_x, m2_y, "2.0 Brand Onboarding &\nDocument Compliance Vault", ha='center', va='center',
            fontsize=8.5, fontfamily=FONT_FAMILY, fontweight='bold', color=COLOR_TEXT, zorder=7)

    # Module 3.0
    m3_x, m3_y = 96, 53
    rect_m3 = Rectangle((m3_x - mod_w/2, m3_y - mod_h/2), mod_w, mod_h,
                        facecolor=COLOR_MODULE_FILL, edgecolor=COLOR_BORDER, linewidth=1.5, zorder=3)
    ax.add_patch(rect_m3)
    ax.text(m3_x, m3_y, "3.0 Feasibility Simulation &\nMulti-Scenario DCF Engine", ha='center', va='center',
            fontsize=8.5, fontfamily=FONT_FAMILY, fontweight='bold', color=COLOR_TEXT, zorder=7)

    # Module 4.0
    m4_x, m4_y = 96, 36.5
    rect_m4 = Rectangle((m4_x - mod_w/2, m4_y - mod_h/2), mod_w, mod_h,
                        facecolor=COLOR_MODULE_FILL, edgecolor=COLOR_BORDER, linewidth=1.5, zorder=3)
    ax.add_patch(rect_m4)
    ax.text(m4_x, m4_y, "4.0 Territory Quota Allocation\n& Atomic Reservation", ha='center', va='center',
            fontsize=8.5, fontfamily=FONT_FAMILY, fontweight='bold', color=COLOR_TEXT, zorder=7)

    # Module 5.0
    m5_x, m5_y = 96, 20
    rect_m5 = Rectangle((m5_x - mod_w/2, m5_y - mod_h/2), mod_w, mod_h,
                        facecolor=COLOR_MODULE_FILL, edgecolor=COLOR_BORDER, linewidth=1.5, zorder=3)
    ax.add_patch(rect_m5)
    ax.text(m5_x, m5_y, "5.0 Bilateral Contract Digital\nSigning & SHA-256 Engine", ha='center', va='center',
            fontsize=8.5, fontfamily=FONT_FAMILY, fontweight='bold', color=COLOR_TEXT, zorder=7)

    # DIRECT ARROWS WITH CLEAN TEXT LABELS
    # 1. Franchiser to 1.0 & 2.0
    draw_arrow(ax, (f_x + f_w/2, f_y + 1.2), (m1_x - mod_w/2, m1_y - 1.0), lw=1.4)
    draw_arrow(ax, (f_x + f_w/2, f_y - 1.2), (m2_x - mod_w/2, m2_y + 1.0), lw=1.4)
    ax.text(23, 67, "Credentials", fontsize=7.5, fontfamily=FONT_FAMILY, color=COLOR_TEXT)
    ax.text(22, 51.5, "Submit Proposal", fontsize=7.5, fontfamily=FONT_FAMILY, color=COLOR_TEXT)

    # 2. Module 1.0 to User Accounts Store
    draw_arrow(ax, (m1_x + mod_w/2, m1_y), (db_box_x - cyl_w/2, 66), lw=1.4)
    ax.text(82, 67.5, "Validate & Write User Session", fontsize=8.0, fontfamily=FONT_FAMILY, color=COLOR_TEXT)

    # 3. Module 2.0 to Franchise Listings & Compliance stores
    draw_arrow(ax, (m2_x + mod_w/2, m2_y + 1.5), (db_box_x - cyl_w/2, 53), lw=1.4)
    ax.text(113, 55, "Persist Listing Specifications", fontsize=7.5, fontfamily=FONT_FAMILY, color=COLOR_TEXT)

    draw_arrow(ax, (m2_x + mod_w/2, m2_y - 1.5), (db_box_x - cyl_w/2, 40), lw=1.4)
    ax.text(113, 41.5, "Store GST / FSSAI Proofs", fontsize=7.5, fontfamily=FONT_FAMILY, color=COLOR_TEXT)

    # 4. Module 2.0 to 3.0 (Approved specs)
    draw_arrow(ax, (m2_x + mod_w/2, m2_y + 2.5), (m3_x - mod_w/2, m3_y - 1.0), lw=1.4)
    ax.text(62, 51.0, "Approved CapEx", fontsize=7.5, fontfamily=FONT_FAMILY, color=COLOR_TEXT)

    # 5. Module 3.0 to 4.0
    draw_arrow(ax, (m3_x, m3_y - mod_h/2), (m4_x, m4_y + mod_h/2), lw=1.4)
    ax.text(97.5, 45, "Feasibility Accepted", fontsize=7.5, fontfamily=FONT_FAMILY, color=COLOR_TEXT)

    # 6. Module 4.0 to Quotas store
    draw_arrow(ax, (m4_x + mod_w/2, m4_y), (db_box_x - cyl_w/2, 27), lw=1.4)
    ax.text(114, 29, "Atomic Decrement Quota", fontsize=7.5, fontfamily=FONT_FAMILY, color=COLOR_TEXT)

    # 7. Module 4.0 to 5.0
    draw_arrow(ax, (m4_x, m4_y - mod_h/2), (m5_x, m5_y + mod_h/2), lw=1.4)
    ax.text(97.5, 28, "Quota Lock Notice", fontsize=7.5, fontfamily=FONT_FAMILY, color=COLOR_TEXT)

    # 8. Module 5.0 to Contracts Ledger
    draw_arrow(ax, (m5_x + mod_w/2, m5_y), (db_box_x - cyl_w/2, 14), lw=1.4)
    ax.text(114, 16.5, "Store Signed Contract & Hash", fontsize=7.5, fontfamily=FONT_FAMILY, color=COLOR_TEXT)

    # 9. Investor connections to 1.0, 3.0, 4.0, 5.0 (clean fan out)
    draw_arrow(ax, (inv_x - 5, inv_y + inv_h/2), (m1_x + 2, m1_y - mod_h/2), lw=1.3)
    ax.text(49, 32, "Auth / Token", fontsize=7.5, fontfamily=FONT_FAMILY, color=COLOR_TEXT)

    draw_arrow(ax, (inv_x - 1, inv_y + inv_h/2), (m3_x - 4, m3_y - mod_h/2), lw=1.3)
    ax.text(76, 24, "Capital & Risk Inputs", fontsize=7.5, fontfamily=FONT_FAMILY, color=COLOR_TEXT)

    draw_arrow(ax, (m3_x - 2, m3_y - mod_h/2), (inv_x + 2, inv_y + inv_h/2), lw=1.3)
    ax.text(88, 11, "NPV / IRR Metrics", fontsize=7.5, fontfamily=FONT_FAMILY, color=COLOR_TEXT)

    draw_arrow(ax, (inv_x + 5, inv_y + inv_h/2), (m5_x - 3, m5_y - mod_h/2), lw=1.3)
    ax.text(84, 15.5, "Digital E-Sign", fontsize=7.5, fontfamily=FONT_FAMILY, color=COLOR_TEXT)

    plt.tight_layout(pad=0.2)
    output_path = os.path.join(OUTPUT_DIR, "fig_dfd_level1.png")
    plt.savefig(output_path, dpi=200, facecolor=COLOR_BG)
    plt.close()
    print("Generated:", output_path)

# ==============================================================================
# 3. LEVEL 2 DFD (Matching p27_img2.png Sub-Process Flow)
# ==============================================================================
def generate_dfd_level2():
    fig, ax = plt.subplots(figsize=(15.5, 8.5), dpi=200)
    fig.patch.set_facecolor(COLOR_BG)
    ax.set_facecolor(COLOR_BG)
    ax.set_xlim(0, 155)
    ax.set_ylim(0, 85)
    ax.axis('off')

    # Top Entity: React Client (Investment Decision UI)
    rc_x, rc_y = 66, 78.5
    rc_w, rc_h = 28, 6.5
    rect_rc = Rectangle((rc_x - rc_w/2, rc_y - rc_h/2), rc_w, rc_h,
                        facecolor='#FFFFFF', edgecolor=COLOR_BORDER, linewidth=1.8, zorder=3)
    ax.add_patch(rect_rc)
    ax.text(rc_x, rc_y, "React Client\n(Investment Decision UI)", ha='center', va='center',
            fontsize=9.5, fontfamily=FONT_FAMILY, fontweight='bold', color=COLOR_TEXT,
            zorder=7, multialignment='center')

    # REST API Badges below React Client
    draw_badge(ax, 35, 68.5, 23, 5.0, "POST /api/simulations/run/\n(Capital, Risk, Horizon)", font_size=7.5)
    draw_badge(ax, 66, 68.5, 21, 5.0, "GET /api/listings/{id}/\n(CapEx & Royalties)", font_size=7.5)
    draw_badge(ax, 102, 68.5, 24, 5.0, "Response: Feasibility Dashboard\n& Monte Carlo Confidence", font_size=7.5)

    # Arrows between React Client and Badges
    draw_arrow(ax, (rc_x - rc_w/3, rc_y - rc_h/2), (35, 71.0), lw=1.5)
    draw_arrow(ax, (rc_x, rc_y - rc_h/2), (66, 71.0), lw=1.5)
    draw_arrow(ax, (102, 71.0), (rc_x + rc_w/3, rc_y - rc_h/2), lw=1.5)

    # Sub-Process Boundary Box
    sp_x, sp_y = 62, 32
    sp_w, sp_h = 114, 60
    rect_sp = Rectangle((sp_x - sp_w/2, sp_y - sp_h/2), sp_w, sp_h,
                        facecolor='#FFFFFF', edgecolor=COLOR_BORDER, linewidth=1.8, zorder=1)
    ax.add_patch(rect_sp)
    ax.text(sp_x, sp_y + sp_h/2 - 3.0, "Sub-Process 3.0: DSS Investment Simulation & Feasibility Engine",
            ha='center', va='center', fontsize=10.5, fontfamily=FONT_FAMILY, fontweight='bold',
            color=COLOR_TEXT, zorder=6)

    # 5 Process Boxes inside (Crisp white rectangles with dark navy border, matching p27_img2.png!)
    box_w, box_h = 28, 7.5

    # 3.1
    b1_x, b1_y = 35, 51
    rect_b1 = Rectangle((b1_x - box_w/2, b1_y - box_h/2), box_w, box_h,
                        facecolor='#FFFFFF', edgecolor=COLOR_BORDER, linewidth=1.8, zorder=3)
    ax.add_patch(rect_b1)
    ax.text(b1_x, b1_y, "3.1 Ingest Investor Capital &\nRisk Tolerance Constraints", ha='center', va='center',
            fontsize=8.5, fontfamily=FONT_FAMILY, fontweight='bold', color=COLOR_TEXT, zorder=7)

    # 3.2
    b2_x, b2_y = 35, 37
    rect_b2 = Rectangle((b2_x - box_w/2, b2_y - box_h/2), box_w, box_h,
                        facecolor='#FFFFFF', edgecolor=COLOR_BORDER, linewidth=1.8, zorder=3)
    ax.add_patch(rect_b2)
    ax.text(b2_x, b2_y, "3.2 Query Approved Brand\nFinancial & CapEx Parameters", ha='center', va='center',
            fontsize=8.5, fontfamily=FONT_FAMILY, fontweight='bold', color=COLOR_TEXT, zorder=7)

    # 3.3
    b3_x, b3_y = 35, 23
    rect_b3 = Rectangle((b3_x - box_w/2, b3_y - box_h/2), box_w, box_h,
                        facecolor='#FFFFFF', edgecolor=COLOR_BORDER, linewidth=1.8, zorder=3)
    ax.add_patch(rect_b3)
    ax.text(b3_x, b3_y, "3.3 Multi-Scenario DCF Cash Flow\nProjection Engine (Base/Opt/Pess)", ha='center', va='center',
            fontsize=8.5, fontfamily=FONT_FAMILY, fontweight='bold', color=COLOR_TEXT, zorder=7)

    # 3.4
    b4_x, b4_y = 35, 9.5
    rect_b4 = Rectangle((b4_x - box_w/2, b4_y - box_h/2), box_w, box_h,
                        facecolor='#FFFFFF', edgecolor=COLOR_BORDER, linewidth=1.8, zorder=3)
    ax.add_patch(rect_b4)
    ax.text(b4_x, b4_y, "3.4 Compute Payback Period,\nNPV & Internal Rate of Return (IRR)", ha='center', va='center',
            fontsize=8.5, fontfamily=FONT_FAMILY, fontweight='bold', color=COLOR_TEXT, zorder=7)

    # 3.5 (Right-center)
    b5_x, b5_y = 86, 30
    rect_b5 = Rectangle((b5_x - box_w/2, b5_y - box_h/2), box_w, box_h,
                        facecolor='#FFFFFF', edgecolor=COLOR_BORDER, linewidth=1.8, zorder=3)
    ax.add_patch(rect_b5)
    ax.text(b5_x, b5_y, "3.5 Multi-Criteria Feasibility\nScorecard & Risk Classification", ha='center', va='center',
            fontsize=8.5, fontfamily=FONT_FAMILY, fontweight='bold', color=COLOR_TEXT, zorder=7)

    # 2 Databases on the right (matching p27_img2.png)
    db_w, db_h = 22, 10.5
    draw_cylinder(ax, 138, 48, db_w, db_h, "Franchise Listings\nDatabase", font_size=8.5)
    draw_cylinder(ax, 138, 18, db_w, db_h, "Investment Simulations\nLedger", font_size=8.5)

    # Connections and Flow Badges
    # API badge 1 to 3.1
    draw_arrow(ax, (35, 66.0), (b1_x, b1_y + box_h/2), lw=1.5)

    # 3.1 to 3.2
    draw_arrow(ax, (b1_x, b1_y - box_h/2), (b2_x, b2_y + box_h/2), lw=1.5)
    draw_badge(ax, 47, 44.0, 16, 3.2, "Capital & Horizon", font_size=7.0)

    # 3.2 to 3.3
    draw_arrow(ax, (b2_x, b2_y - box_h/2), (b3_x, b3_y + box_h/2), lw=1.5)
    draw_badge(ax, 47, 30.0, 16, 3.2, "Financial Baseline", font_size=7.0)

    # 3.3 to 3.4
    draw_arrow(ax, (b3_x, b3_y - box_h/2), (b4_x, b4_y + box_h/2), lw=1.5)
    draw_badge(ax, 47, 16.5, 16, 3.2, "Annual Cash Flows", font_size=7.0)

    # 3.4 to 3.5
    draw_arrow(ax, (b4_x + box_w/2, b4_y), (b5_x - box_w/2, b5_y - 2), rad=-0.1, lw=1.5)
    draw_badge(ax, 61, 18.5, 18, 3.5, "NPV, IRR, Break-Even", font_size=7.0)

    # 3.2 to Database 1 (query)
    draw_arrow(ax, (b2_x + box_w/2, b2_y + 1), (138 - db_w/2, 48), lw=1.5)
    draw_badge(ax, 82, 43, 20, 3.5, "Query CapEx & Royalty Model", font_size=7.0)

    # Database 1 to 3.2 (return specs)
    draw_arrow(ax, (138 - db_w/2, 46), (b2_x + box_w/2, b2_y - 1), rad=0.08, lw=1.5)
    draw_badge(ax, 82, 38, 20, 3.5, "Approved Brand Specs", font_size=7.0)

    # 3.5 to Database 2 (persist)
    draw_arrow(ax, (b5_x + box_w/2, b5_y - 2), (138 - db_w/2, 18), lw=1.5)
    draw_badge(ax, 112, 23, 19, 3.5, "Persist Simulation Ledger", font_size=7.0)

    # 3.5 to API badge 3 (return to client)
    draw_arrow(ax, (b5_x, b5_y + box_h/2), (102, 66.0), lw=1.5)
    draw_badge(ax, 106, 50, 19, 3.5, "Feasibility Metrics Result", font_size=7.0)

    plt.tight_layout(pad=0.2)
    output_path = os.path.join(OUTPUT_DIR, "fig_dfd_level2.png")
    plt.savefig(output_path, dpi=200, facecolor=COLOR_BG)
    plt.close()
    print("Generated:", output_path)

if __name__ == "__main__":
    generate_dfd_level0()
    generate_dfd_level1()
    generate_dfd_level2()
