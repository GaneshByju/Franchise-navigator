import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import Rectangle, Circle, Polygon, FancyArrowPatch, FancyBboxPatch

OUTPUT_DIR = r"c:\Users\ganes\OneDrive\Desktop\franchise-investment-decision-support-system\report_diagrams"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Styling identical to demo report p31_img1.png
COLOR_BG = '#FFFFFF'
COLOR_BORDER = '#1B2038'         # Dark navy stroke
COLOR_CONTAINER_FILL = '#FFFFFF' # Clean white container
COLOR_BOX_FILL = '#FFFFFF'       # Action pill fill
COLOR_STATUS_FILL = '#F1F5F9'    # Soft slate for status badges
COLOR_DECISION_FILL = '#FFFFFF'
COLOR_TEXT = '#111827'
COLOR_MUTED = '#64748B'
FONT_FAMILY = 'DejaVu Sans'

def create_activity_diagram():
    # Sized for standard Word page printable area
    fig, ax = plt.subplots(figsize=(8.2, 15.5), dpi=300)
    fig.patch.set_facecolor(COLOR_BG)
    ax.set_facecolor(COLOR_BG)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 195)
    ax.axis('off')

    # Helper: Draw straight arrow
    def draw_arrow(x1, y1, x2, y2, lw=1.6, color=COLOR_BORDER):
        arrow = FancyArrowPatch(
            (x1, y1), (x2, y2),
            arrowstyle='-|>',
            mutation_scale=12,
            linewidth=lw,
            color=color,
            zorder=5
        )
        ax.add_patch(arrow)

    # Helper: Draw Container Box (matching p31_img1.png container style)
    def draw_container(x, y, w, h, title):
        box = FancyBboxPatch(
            (x - w/2, y - h/2), w, h,
            boxstyle="round,pad=0.8,rounding_size=2.0",
            facecolor=COLOR_CONTAINER_FILL, edgecolor=COLOR_BORDER,
            linewidth=1.8, zorder=2
        )
        ax.add_patch(box)
        # Top title safely inside container
        ax.text(x, y + h/2 - 2.6, title, ha='center', va='center',
                fontsize=9.2, fontfamily=FONT_FAMILY, fontweight='bold',
                color=COLOR_BORDER, zorder=3)

    # Helper: Draw Action Pill Box (matching p31_img1.png action pill style)
    def draw_action(x, y, w, h, text, subtitle=None, bg=COLOR_BOX_FILL, edge=COLOR_BORDER):
        box = FancyBboxPatch(
            (x - w/2, y - h/2), w, h,
            boxstyle="round,pad=0.5,rounding_size=1.6",
            facecolor=bg, edgecolor=edge,
            linewidth=1.5, zorder=4
        )
        ax.add_patch(box)
        if subtitle:
            ax.text(x, y + 1.1, text, ha='center', va='center',
                    fontsize=8.5, fontfamily=FONT_FAMILY, fontweight='bold',
                    color=COLOR_TEXT, zorder=5)
            ax.text(x, y - 1.2, subtitle, ha='center', va='center',
                    fontsize=7.2, fontfamily=FONT_FAMILY, fontweight='normal',
                    color=COLOR_MUTED, zorder=5)
        else:
            ax.text(x, y, text, ha='center', va='center',
                    fontsize=8.5, fontfamily=FONT_FAMILY, fontweight='bold',
                    color=COLOR_TEXT, zorder=5, multialignment='center')

    # Helper: Draw Status Badge (Gray Pill)
    def draw_badge(x, y, w, h, text):
        badge = FancyBboxPatch(
            (x - w/2, y - h/2), w, h,
            boxstyle="round,pad=0.3,rounding_size=1.2",
            facecolor=COLOR_STATUS_FILL, edgecolor='#94A3B8',
            linewidth=1.2, linestyle='--', zorder=4
        )
        ax.add_patch(badge)
        ax.text(x, y, text, ha='center', va='center',
                fontsize=7.8, fontfamily=FONT_FAMILY, fontweight='bold',
                color='#1E293B', zorder=5)

    # Helper: Draw Decision Diamond
    def draw_diamond(x, y, w, h, text):
        pts = [[x, y + h/2], [x + w/2, y], [x, y - h/2], [x - w/2, y]]
        poly = Polygon(pts, closed=True, facecolor=COLOR_DECISION_FILL,
                       edgecolor=COLOR_BORDER, linewidth=1.6, zorder=4)
        ax.add_patch(poly)
        ax.text(x, y, text, ha='center', va='center',
                fontsize=8.0, fontfamily=FONT_FAMILY, fontweight='bold',
                color=COLOR_TEXT, zorder=5, multialignment='center')

    # -------------------------------------------------------------------------
    # LAYOUT
    # -------------------------------------------------------------------------
    cx = 50.0  # Center X

    # 1. START SYMBOL (Top)
    start_y = 190.0
    start_node = Circle((cx, start_y), 2.2, facecolor=COLOR_BORDER, edgecolor=COLOR_BORDER, linewidth=1.5, zorder=5)
    ax.add_patch(start_node)

    # -------------------------------------------------------------------------
    # CONTAINER 1: Brand Onboarding & Trademark Guard
    # -------------------------------------------------------------------------
    c1_y = 157.0
    c1_h = 52.0
    c1_w = 88.0
    draw_container(cx, c1_y, c1_w, c1_h, "Phase 1: Listing Submission & Trademark Collision Guard")

    # Arrow from Start into Container 1
    draw_arrow(cx, start_y - 2.2, cx, c1_y + c1_h/2 - 0.2)

    # Box 1.1: Franchiser Submits Listing
    b1_y = 173.5
    draw_action(cx, b1_y, 66.0, 5.2, "Franchiser Submits Brand Listing", "Enters operational metrics, fee structure & capital tiers")
    draw_arrow(cx, c1_y + c1_h/2 - 5.0, cx, b1_y + 2.6)

    # Decision: Trademark Conflict?
    dec_y = 159.5
    draw_diamond(cx, dec_y, 44.0, 8.0, "Trademark\nCollision Guard?")
    draw_arrow(cx, b1_y - 2.6, cx, dec_y + 4.0)

    # Branch [YES]: Conflict detected -> Reject & Rebrand
    rej_x = 83.5
    draw_action(rej_x, dec_y, 16.0, 4.6, "Reject Proposal", "Request Rename", bg='#FEE2E2', edge='#DC2626')
    draw_arrow(cx + 22.0, dec_y, rej_x - 8.0, dec_y, color='#DC2626')
    ax.text(cx + 10.5, dec_y + 1.8, "[YES]", ha='center', va='center', fontsize=7.5, fontweight='bold', color='#DC2626', zorder=6)

    # Small End node next to rejection
    term_rej_outer = Circle((rej_x + 9.5, dec_y), 1.6, facecolor='#FFFFFF', edgecolor='#DC2626', linewidth=1.3, zorder=5)
    term_rej_inner = Circle((rej_x + 9.5, dec_y), 0.9, facecolor='#DC2626', edgecolor='none', zorder=6)
    ax.add_patch(term_rej_outer)
    ax.add_patch(term_rej_inner)
    draw_arrow(rej_x + 8.0, dec_y, rej_x + 7.9, dec_y, color='#DC2626')

    # Branch [NO]: Clear -> Admin Initial Review
    b2_y = 145.5
    draw_action(cx, b2_y, 66.0, 5.2, "Admin Initial Sanity Review", "Verifies platform listing eligibility & brand legitimacy")
    draw_arrow(cx, dec_y - 4.0, cx, b2_y + 2.6)
    ax.text(cx - 4.5, 152.5, "[NO]", ha='right', va='center', fontsize=7.5, fontweight='bold', color='#0F766E', zorder=6)

    # Arrow out of Container 1
    draw_arrow(cx, b2_y - 2.6, cx, c1_y - c1_h/2 + 0.2)

    # -------------------------------------------------------------------------
    # CONTAINER 2: Statutory Compliance Vault & Admin Audit
    # -------------------------------------------------------------------------
    c2_y = 104.5
    c2_h = 43.0
    c2_w = 88.0
    draw_container(cx, c2_y, c2_w, c2_h, "Phase 2: Statutory Compliance Vault & Admin Due Diligence Audit")

    # Bridge Badge 1
    draw_badge(cx, 128.5, 48.0, 4.2, "Event: Status Updated -> [Documents Required]")
    draw_arrow(cx, c1_y - c1_h/2, cx, 128.5 + 2.1)
    draw_arrow(cx, 128.5 - 2.1, cx, c2_y + c2_h/2)

    # Box 2.1: Franchiser Uploads Statutory Filings
    b3_y = 118.0
    draw_action(cx, b3_y, 66.0, 5.4, "Franchiser Uploads Statutory Filings", "Uploads GSTIN, MCA Certificate, FSSAI & PAN proofs")
    draw_arrow(cx, c2_y + c2_h/2 - 5.0, cx, b3_y + 2.7)

    # Status 2: Document Audit Pending
    stat2_y = 107.5
    draw_badge(cx, stat2_y, 44.0, 3.8, "State: [Status: Document Audit Pending]")
    draw_arrow(cx, b3_y - 2.7, cx, stat2_y + 1.9)

    # Box 2.2: Admin Document Verification
    b4_y = 96.5
    draw_action(cx, b4_y, 66.0, 5.4, "Compliance Officer Verifies Documents", "Audits cryptographic checksums & validates registration numbers")
    draw_arrow(cx, stat2_y - 1.9, cx, b4_y + 2.7)

    # Arrow out of Container 2
    draw_arrow(cx, b4_y - 2.7, cx, c2_y - c2_h/2 + 0.2)

    # -------------------------------------------------------------------------
    # CONTAINER 3: Investor Due Diligence, DSS & Contracting Execution
    # -------------------------------------------------------------------------
    c3_y = 44.5
    c3_h = 65.0
    c3_w = 88.0
    draw_container(cx, c3_y, c3_w, c3_h, "Phase 3: Investor Due Diligence & Bilateral E-Contract Execution")

    # Bridge Badge 2
    draw_badge(cx, 80.0, 48.0, 4.2, "Event: Listing Approved -> [Status: Active / Published]")
    draw_arrow(cx, c2_y - c2_h/2, cx, 80.0 + 2.1)
    draw_arrow(cx, 80.0 - 2.1, cx, c3_y + c3_h/2)

    # Box 3.1: Investor Discovers Brand & Runs DSS
    b5_y = 67.5
    draw_action(cx, b5_y, 66.0, 5.2, "Investor Discovers Brand & Runs Feasibility DSS", "Simulates ROI, NPV, payback period & multi-factor risk scores")
    draw_arrow(cx, c3_y + c3_h/2 - 5.0, cx, b5_y + 2.6)

    # Box 3.2: Investor Submits Proposal
    b6_y = 58.5
    draw_action(cx, b6_y, 66.0, 4.8, "Investor Submits Proposal & Territory Request", "Specifies unit count, location tier & proposed capital outlay")
    draw_arrow(cx, b5_y - 2.6, cx, b6_y + 2.4)

    # Box 3.3: System Drafts Contract & Investor Signs
    b7_y = 49.5
    draw_action(cx, b7_y, 66.0, 4.8, "System Generates Master Franchise Agreement", "Investor reviews binding clauses & digitally e-signs agreement")
    draw_arrow(cx, b6_y - 2.4, cx, b7_y + 2.4)

    # Box 3.4: Franchiser Countersigns
    b8_y = 40.5
    draw_action(cx, b8_y, 66.0, 4.8, "Franchiser Reviews & Countersigns Agreement", "Executes legally binding bilateral contract with timestamp")
    draw_arrow(cx, b7_y - 2.4, cx, b8_y + 2.4)

    # Box 3.5: Atomic Quota Deduction & Audit Trail
    b9_y = 31.5
    draw_action(cx, b9_y, 66.0, 5.0, "Atomic Territory Quota Allocation & Audit Trail", "Deduct 1 available unit, increment sold units & log SHA-256 hash")
    draw_arrow(cx, b8_y - 2.4, cx, b9_y + 2.5)

    # Arrow out of Container 3
    draw_arrow(cx, b9_y - 2.5, cx, c3_y - c3_h/2 + 0.2)

    # -------------------------------------------------------------------------
    # FINAL TERMINATION NODE (Bullseye)
    # -------------------------------------------------------------------------
    end_y = 6.2
    draw_arrow(cx, c3_y - c3_h/2, cx, end_y + 2.8)

    end_outer = Circle((cx, end_y), 2.5, facecolor='#FFFFFF', edgecolor='#059669', linewidth=2.0, zorder=5)
    end_inner = Circle((cx, end_y), 1.5, facecolor='#059669', edgecolor='none', zorder=6)
    ax.add_patch(end_outer)
    ax.add_patch(end_inner)

    # Terminal state label badge
    badge_end = FancyBboxPatch(
        (cx - 30.0, end_y - 4.5), 60.0, 3.6,
        boxstyle="round,pad=0.4,rounding_size=1.2",
        facecolor='#ECFDF5', edgecolor='#10B981', linewidth=1.3, zorder=5
    )
    ax.add_patch(badge_end)
    ax.text(cx, end_y - 2.7, "Terminal State: Active Franchisee Network Unit Activated",
            ha='center', va='center', fontsize=8.2, fontfamily=FONT_FAMILY,
            fontweight='bold', color='#065F46', zorder=6)

    plt.tight_layout(pad=0.2)
    output_path = os.path.join(OUTPUT_DIR, "fig_activity.png")
    plt.savefig(output_path, dpi=300, facecolor=COLOR_BG)
    plt.close()
    print("Successfully generated:", output_path)

if __name__ == '__main__':
    create_activity_diagram()
