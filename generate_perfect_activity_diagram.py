import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import Rectangle, Circle, Polygon, FancyArrowPatch, FancyBboxPatch

OUTPUT_DIR = r"c:\Users\ganes\OneDrive\Desktop\franchise-investment-decision-support-system\report_diagrams"
os.makedirs(OUTPUT_DIR, exist_ok=True)

FONT_FAMILY = 'DejaVu Sans'
COLOR_BG = '#FFFFFF'
COLOR_BORDER = '#111827'        # Crisp dark border
COLOR_HEADER_BG = '#1E293B'     # Deep navy header fill
COLOR_BOX_FILL = '#F8FAFC'      # Process card fill
COLOR_BADGE_FILL = '#E2E8F0'    # Status badge fill
COLOR_DECISION_FILL = '#FFFFFF' # Decision diamond fill
COLOR_TEXT_DARK = '#0F172A'
COLOR_TEXT_MUTED = '#475569'

def draw_activity_diagram():
    fig, ax = plt.subplots(figsize=(11.5, 14.5), dpi=300)
    fig.patch.set_facecolor(COLOR_BG)
    ax.set_facecolor(COLOR_BG)
    ax.set_xlim(0, 11.5)
    ax.set_ylim(0, 14.5)
    ax.axis('off')

    # -------------------------------------------------------------------------
    # 1. Swimlane Boundaries & Backgrounds
    # -------------------------------------------------------------------------
    lanes = [
        {"name": "FRANCHISER\n(Brand Owner)", "x_start": 0.5, "width": 3.4, "center": 2.2},
        {"name": "COMPLIANCE & SYSTEM ADMIN\n(Platform Engine & Audit)", "x_start": 3.9, "width": 4.1, "center": 5.95},
        {"name": "INVESTOR\n(Franchisee Prospect)", "x_start": 8.0, "width": 3.0, "center": 9.5}
    ]

    top_y = 14.2
    header_h = 0.75
    lane_bottom_y = 0.25

    for idx, lane in enumerate(lanes):
        # Lane column outline
        rect_col = Rectangle((lane["x_start"], lane_bottom_y), lane["width"], top_y - lane_bottom_y - header_h,
                             facecolor='#FAFBFD' if idx % 2 == 1 else '#FFFFFF',
                             edgecolor='#CBD5E1', linewidth=1.2, linestyle='--', zorder=1)
        ax.add_patch(rect_col)

        # Header bar
        rect_hdr = Rectangle((lane["x_start"], top_y - header_h), lane["width"], header_h,
                             facecolor=COLOR_HEADER_BG, edgecolor=COLOR_BORDER, linewidth=1.5, zorder=3)
        ax.add_patch(rect_hdr)

        ax.text(lane["center"], top_y - header_h / 2.0, lane["name"],
                ha='center', va='center', fontsize=9.0, fontfamily=FONT_FAMILY,
                fontweight='bold', color='#FFFFFF', zorder=4, multialignment='center')

    # Helper: draw process box
    def draw_action_box(x, y, w, h, title, subtitle=None, bg=COLOR_BOX_FILL, edge=COLOR_BORDER):
        box = FancyBboxPatch((x - w/2, y - h/2), w, h,
                             boxstyle="round,pad=0.06,rounding_size=0.12",
                             facecolor=bg, edgecolor=edge, linewidth=1.4, zorder=3)
        ax.add_patch(box)
        if subtitle:
            ax.text(x, y + 0.12, title, ha='center', va='center', fontsize=8.5,
                    fontfamily=FONT_FAMILY, fontweight='bold', color=COLOR_TEXT_DARK, zorder=4)
            ax.text(x, y - 0.14, subtitle, ha='center', va='center', fontsize=7.2,
                    fontfamily=FONT_FAMILY, fontweight='normal', color=COLOR_TEXT_MUTED, zorder=4)
        else:
            ax.text(x, y, title, ha='center', va='center', fontsize=8.2,
                    fontfamily=FONT_FAMILY, fontweight='bold', color=COLOR_TEXT_DARK, zorder=4, multialignment='center')

    # Helper: draw status pill badge
    def draw_status_badge(x, y, w, h, text):
        badge = FancyBboxPatch((x - w/2, y - h/2), w, h,
                               boxstyle="round,pad=0.04,rounding_size=0.08",
                               facecolor=COLOR_BADGE_FILL, edgecolor='#94A3B8', linewidth=1.1, zorder=3)
        ax.add_patch(badge)
        ax.text(x, y, text, ha='center', va='center', fontsize=7.5,
                fontfamily=FONT_FAMILY, fontweight='bold', color='#1E293B', zorder=4)

    # Helper: draw decision diamond
    def draw_decision(x, y, w, h, text):
        pts = [[x, y + h/2], [x + w/2, y], [x, y - h/2], [x - w/2, y]]
        poly = Polygon(pts, closed=True, facecolor=COLOR_DECISION_FILL, edgecolor=COLOR_BORDER, linewidth=1.5, zorder=3)
        ax.add_patch(poly)
        ax.text(x, y, text, ha='center', va='center', fontsize=7.8,
                fontfamily=FONT_FAMILY, fontweight='bold', color=COLOR_TEXT_DARK, zorder=4, multialignment='center')

    # Helper: draw arrow
    def draw_flow_arrow(start, end, rad=0.0, label=None, label_pos=None):
        arrow = FancyArrowPatch(start, end, connectionstyle=f"arc3,rad={rad}",
                                arrowstyle='-|>', mutation_scale=11, linewidth=1.4,
                                color=COLOR_BORDER, zorder=5)
        ax.add_patch(arrow)
        if label and label_pos:
            ax.text(label_pos[0], label_pos[1], label, ha='center', va='center',
                    fontsize=7.2, fontfamily=FONT_FAMILY, fontweight='bold',
                    color='#B91C1C' if 'YES' in label or 'Reject' in label else '#0F766E',
                    bbox=dict(boxstyle="square,pad=0.15", facecolor="#FFFFFF", edgecolor='none', alpha=0.9),
                    zorder=6)

    # -------------------------------------------------------------------------
    # 2. Activity Steps & Control Flows
    # -------------------------------------------------------------------------
    c_f = lanes[0]["center"]   # 2.2
    c_adm = lanes[1]["center"] # 5.95
    c_inv = lanes[2]["center"] # 9.5

    # START NODE (Solid circle) in Franchiser Lane
    start_y = 12.85
    start_circle = Circle((c_f, start_y), 0.20, facecolor='#0F172A', edgecolor=COLOR_BORDER, linewidth=1.5, zorder=4)
    ax.add_patch(start_circle)
    ax.text(c_f + 0.35, start_y, "Start", ha='left', va='center', fontsize=8.0, fontweight='bold', color=COLOR_TEXT_DARK)

    # Step 1: Franchiser Submits Listing
    step1_y = 12.0
    draw_action_box(c_f, step1_y, 2.8, 0.75, "Franchiser Submits Listing", "Brand profile & initial capital metrics")
    draw_flow_arrow((c_f, start_y - 0.20), (c_f, step1_y + 0.375))

    # Step 2: Decision: Trademark Conflict?
    dec1_y = 12.0
    draw_decision(c_adm, dec1_y, 2.2, 0.9, "Trademark\nConflict?")
    draw_flow_arrow((c_f + 1.4, step1_y), (c_adm - 1.1, dec1_y))

    # Decision Branch: YES -> Reject & End
    reject_x = c_adm + 1.45
    reject_y = 12.0
    # End node on rejection
    end_rej_outer = Circle((c_adm + 1.6, dec1_y), 0.20, facecolor='#FEE2E2', edgecolor='#DC2626', linewidth=1.4, zorder=4)
    end_rej_inner = Circle((c_adm + 1.6, dec1_y), 0.10, facecolor='#DC2626', edgecolor='none', zorder=5)
    ax.add_patch(end_rej_outer)
    ax.add_patch(end_rej_inner)
    draw_flow_arrow((c_adm + 1.1, dec1_y), (c_adm + 1.4, dec1_y), label="[YES] Reject &\nRequest Rename", label_pos=(c_adm + 1.25, dec1_y + 0.28))

    # Decision Branch: NO -> Admin Initial Review
    step3_y = 10.85
    draw_action_box(c_adm, step3_y, 2.9, 0.72, "Admin Initial Review", "Listing eligibility & brand sanity")
    draw_flow_arrow((c_adm, dec1_y - 0.45), (c_adm, step3_y + 0.36), label="[NO]", label_pos=(c_adm - 0.32, 11.45))

    # Step 4: Status: Documents Required
    badge1_y = 9.85
    draw_status_badge(c_adm, badge1_y, 2.7, 0.38, "Status: Documents Required")
    draw_flow_arrow((c_adm, step3_y - 0.36), (c_adm, badge1_y + 0.19))

    # Step 5: Franchiser Uploads Statutory Documents
    step5_y = 9.85
    draw_action_box(c_f, step5_y, 2.8, 0.75, "Upload Statutory Filings", "GSTIN, MCA, FSSAI & PAN proofs")
    draw_flow_arrow((c_adm - 1.35, badge1_y), (c_f + 1.4, step5_y))

    # Step 6: Status: Document Audit Pending
    badge2_y = 8.75
    draw_status_badge(c_adm, badge2_y, 2.7, 0.38, "Status: Document Audit Pending")
    draw_flow_arrow((c_f + 1.4, step5_y - 0.2), (c_adm - 1.35, badge2_y), rad=-0.15)

    # Step 7: Admin Verifies Physical Documents
    step7_y = 7.75
    draw_action_box(c_adm, step7_y, 3.1, 0.75, "Admin Document Verification", "Inspect official PDF statutory proofs")
    draw_flow_arrow((c_adm, badge2_y - 0.19), (c_adm, step7_y + 0.375))

    # Step 8: Status: Active / Published
    badge3_y = 6.65
    draw_status_badge(c_adm, badge3_y, 3.0, 0.40, "Status: Active / Published to Catalog")
    draw_flow_arrow((c_adm, step7_y - 0.375), (c_adm, badge3_y + 0.20))

    # Step 9: Investor Discovers Brand & Runs DSS
    step9_y = 6.65
    draw_action_box(c_inv, step9_y, 2.6, 0.75, "Investor Discovers Brand", "Runs 5-Factor Feasibility DSS")
    draw_flow_arrow((c_adm + 1.5, badge3_y), (c_inv - 1.3, step9_y))

    # Step 10: Investor Submits Proposal & Territory Request
    step10_y = 5.45
    draw_action_box(c_inv, step10_y, 2.6, 0.75, "Submit Proposal", "Territory request & capital pledge")
    draw_flow_arrow((c_inv, step9_y - 0.375), (c_inv, step10_y + 0.375))

    # Step 11: System Generates Master Franchise Agreement
    step11_y = 5.45
    draw_action_box(c_adm, step11_y, 3.1, 0.75, "Auto-Generate Master Contract", "Binding legal terms & territory clause")
    draw_flow_arrow((c_inv - 1.3, step10_y), (c_adm + 1.55, step11_y))

    # Step 12: Investor Digitally Signs Contract
    step12_y = 4.25
    draw_action_box(c_inv, step12_y, 2.6, 0.75, "Investor E-Signs Contract", "Cryptographic signature stamped")
    draw_flow_arrow((c_adm + 1.55, step11_y - 0.2), (c_inv - 1.3, step12_y), rad=-0.15)

    # Step 13: Franchiser Reviews & Countersigns
    step13_y = 4.25
    draw_action_box(c_f, step13_y, 2.8, 0.75, "Franchiser Countersigns", "Bilateral legal execution")
    draw_flow_arrow((c_inv - 1.3, step12_y), (c_f + 1.4, step13_y), rad=0.20)

    # Step 14: Atomic Inventory Quota Lock
    step14_y = 3.05
    draw_action_box(c_adm, step14_y, 3.2, 0.75, "Atomic Quota Allocation", "Deduct 1 available unit; increment sold units")
    draw_flow_arrow((c_f + 1.4, step13_y - 0.25), (c_adm - 1.6, step14_y), rad=-0.15)

    # Step 15: Generate Audit Trail & Executed PDF
    step15_y = 1.95
    draw_action_box(c_adm, step15_y, 3.2, 0.75, "Audit Ledger Logging", "SHA-256 hash & executed agreement PDF")
    draw_flow_arrow((c_adm, step14_y - 0.375), (c_adm, step15_y + 0.375))

    # END NODE (Bullseye)
    end_y = 0.95
    end_outer = Circle((c_adm, end_y), 0.28, facecolor='#ECFDF5', edgecolor='#059669', linewidth=1.8, zorder=4)
    end_inner = Circle((c_adm, end_y), 0.16, facecolor='#059669', edgecolor='none', zorder=5)
    ax.add_patch(end_outer)
    ax.add_patch(end_inner)
    draw_flow_arrow((c_adm, step15_y - 0.375), (c_adm, end_y + 0.28))
    ax.text(c_adm, end_y - 0.42, "End: Active Franchisee Network Unit Activated",
            ha='center', va='center', fontsize=8.2, fontweight='bold', color='#065F46',
            bbox=dict(boxstyle="round,pad=0.2", facecolor="#E6F4EA", edgecolor='#A7F3D0', linewidth=1.0),
            zorder=6)

    # Footer note
    ax.text(5.75, 0.08, "Figure 3.7: Statutory Compliance, Due Diligence Audit & Bilateral Contract Execution Lifecycle",
            ha='center', va='center', fontsize=8.5, fontfamily=FONT_FAMILY, fontstyle='italic',
            color='#64748B', zorder=4)

    plt.tight_layout(pad=0.2)
    output_path = os.path.join(OUTPUT_DIR, "fig_activity.png")
    plt.savefig(output_path, dpi=300, facecolor=COLOR_BG)
    plt.close()
    print("Successfully generated:", output_path)

if __name__ == '__main__':
    draw_activity_diagram()
