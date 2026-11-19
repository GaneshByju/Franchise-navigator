import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Circle, Polygon, Rectangle
import numpy as np
import os

os.makedirs('report_diagrams', exist_ok=True)

# Styling constants strictly adhering to demo report's design system
BG_COLOR = "#FFFFFF"
BORDER_COLOR = "#1A1D2E"
FILL_WHITE = "#FFFFFF"
FILL_LIGHT_GRAY = "#D1D5DB"
FILL_CYL_BODY = "#F3F4F6"
FILL_CYL_TOP = "#E5E7EB"
TEXT_COLOR = "#111827"
LINE_WIDTH = 1.8
FONT_FAMILY = "sans-serif"

def draw_cylinder(ax, x, y, w, h, text, font_size=8.5):
    """Draws a 3D database cylinder store matching demo report style."""
    ellipse_h = h * 0.28
    
    # Body rectangle
    body = Rectangle((x - w/2, y - h/2 + ellipse_h/2), w, h - ellipse_h, 
                     facecolor=FILL_CYL_BODY, edgecolor=BORDER_COLOR, linewidth=LINE_WIDTH)
    ax.add_patch(body)
    
    # Bottom ellipse arc
    bottom_arc = patches.Arc((x, y - h/2 + ellipse_h/2), w, ellipse_h, 
                             angle=0, theta1=180, theta2=360, 
                             edgecolor=BORDER_COLOR, linewidth=LINE_WIDTH)
    ax.add_patch(bottom_arc)
    
    # Fill bottom
    theta = np.linspace(np.pi, 2*np.pi, 50)
    arc_x = x + (w/2) * np.cos(theta)
    arc_y = (y - h/2 + ellipse_h/2) + (ellipse_h/2) * np.sin(theta)
    verts = list(zip(arc_x, arc_y)) + [(x + w/2, y - h/2 + ellipse_h/2), (x - w/2, y - h/2 + ellipse_h/2)]
    ax.add_patch(Polygon(verts, closed=True, facecolor=FILL_CYL_BODY, edgecolor='none'))
    
    # Top ellipse (full)
    top_ellipse = patches.Ellipse((x, y + h/2 - ellipse_h/2), w, ellipse_h, 
                                  facecolor=FILL_CYL_TOP, edgecolor=BORDER_COLOR, linewidth=LINE_WIDTH)
    ax.add_patch(top_ellipse)
    
    # Text
    ax.text(x, y - h*0.08, text, ha='center', va='center', 
            fontsize=font_size, fontweight='bold', color=TEXT_COLOR, fontfamily=FONT_FAMILY)

def draw_pill_badge(ax, x, y, text, w=None, h=0.34, font_size=8.0):
    """Draws gray label badge along arrows matching demo report style."""
    lines = text.split('\n')
    max_len = max(len(l) for l in lines)
    calc_w = max(1.8, max_len * 0.082) if w is None else w
    calc_h = max(h, 0.25 * len(lines) + 0.1)
    
    badge = Rectangle((x - calc_w/2, y - calc_h/2), calc_w, calc_h,
                      facecolor=FILL_LIGHT_GRAY, edgecolor='none', zorder=4)
    ax.add_patch(badge)
    ax.text(x, y, text, ha='center', va='center',
            fontsize=font_size, color=TEXT_COLOR, fontfamily=FONT_FAMILY, zorder=5)

def draw_box(ax, x, y, w, h, text, font_size=9.5, bold=True, fill_color=FILL_WHITE, text_color=TEXT_COLOR):
    """Draws standard entity/process rectangle matching demo report."""
    rect = Rectangle((x - w/2, y - h/2), w, h,
                     facecolor=fill_color, edgecolor=BORDER_COLOR, linewidth=LINE_WIDTH, zorder=3)
    ax.add_patch(rect)
    ax.text(x, y, text, ha='center', va='center',
            fontsize=font_size, fontweight='bold' if bold else 'normal', color=text_color, fontfamily=FONT_FAMILY, zorder=4)

def draw_rounded_box(ax, x, y, w, h, text, font_size=8.5, fill_color=FILL_WHITE):
    """Draws rounded box matching demo report process module."""
    bbox = FancyBboxPatch((x - w/2, y - h/2), w, h,
                          boxstyle="round,pad=0.04,rounding_size=0.12",
                          facecolor=fill_color, edgecolor=BORDER_COLOR, linewidth=LINE_WIDTH, zorder=3)
    ax.add_patch(bbox)
    ax.text(x, y, text, ha='center', va='center',
            fontsize=font_size, color=TEXT_COLOR, fontfamily=FONT_FAMILY, zorder=4)

def draw_circle(ax, x, y, r, text, font_size=9.5):
    """Draws circular process matching demo report Level 0 DFD."""
    circle = Circle((x, y), r, facecolor=FILL_WHITE, edgecolor=BORDER_COLOR, linewidth=LINE_WIDTH*1.1, zorder=3)
    ax.add_patch(circle)
    ax.text(x, y, text, ha='center', va='center',
            fontsize=font_size, fontweight='bold', color=TEXT_COLOR, fontfamily=FONT_FAMILY, zorder=4)

def draw_arrow(ax, x1, y1, x2, y2, zorder=2, rad=0.0):
    """Draws connecting arrow matching demo report."""
    connectionstyle = f"arc3,rad={rad}" if rad != 0.0 else "arc3"
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="-|>", color=BORDER_COLOR, lw=1.5,
                                connectionstyle=connectionstyle, mutation_scale=13),
                zorder=zorder)

# ==============================================================================
# 1. LEVEL 0 DFD (CONTEXT DIAGRAM)
# ==============================================================================
def gen_level0():
    fig, ax = plt.subplots(figsize=(17, 7.5), dpi=300)
    ax.set_facecolor(BG_COLOR)
    fig.patch.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 18)
    ax.set_ylim(0, 8.5)
    ax.axis('off')

    # System boundary box
    sys_boundary = Rectangle((5.2, 0.4), 7.6, 7.6,
                             facecolor=FILL_WHITE, edgecolor=BORDER_COLOR, linewidth=LINE_WIDTH, zorder=1)
    ax.add_patch(sys_boundary)
    ax.text(9.0, 7.6, "Franchise Investment Decision Support System Boundary", 
            ha='center', va='center', fontsize=12, fontweight='bold', color=TEXT_COLOR)

    # Core engine circle
    draw_circle(ax, 9.0, 3.8, 1.9, "Franchise Decision Support\n& Investment Engine\n(FDSS Core Engine)", font_size=10.5)

    # Left external entities
    draw_box(ax, 2.2, 6.0, 3.4, 1.2, "Franchiser\n(Brand Owner)", font_size=10.5)
    draw_box(ax, 2.2, 1.8, 3.4, 1.2, "Statutory Compliance\nAuthorities (GST/FSSAI)", font_size=10)

    # Right external entities
    draw_box(ax, 15.8, 6.0, 3.4, 1.2, "Investor /\nProspective Franchisee", font_size=10.5)
    draw_box(ax, 15.8, 1.8, 3.4, 1.2, "System Administrator /\nCompliance Officer", font_size=10)

    # Franchiser flows
    draw_arrow(ax, 3.9, 6.3, 7.1, 4.8)
    draw_pill_badge(ax, 5.2, 6.0, "1. Brand Profile & CapEx Specs")

    draw_arrow(ax, 7.2, 4.3, 3.9, 5.6)
    draw_pill_badge(ax, 5.3, 4.8, "Listing Published & Dual E-Sign Notice")

    # Statutory flows
    draw_arrow(ax, 3.9, 2.0, 7.2, 3.0)
    draw_pill_badge(ax, 5.3, 2.2, "Document Vault Verification Feed")

    # Investor flows
    draw_arrow(ax, 14.1, 6.3, 10.9, 4.8)
    draw_pill_badge(ax, 12.6, 6.0, "2. Capital, Risk & Territory App")

    draw_arrow(ax, 10.9, 4.3, 14.1, 5.6)
    draw_pill_badge(ax, 12.6, 4.8, "DSS Feasibility & Unit Lock Notice")

    # Admin flows
    draw_arrow(ax, 14.1, 2.2, 10.8, 3.0)
    draw_pill_badge(ax, 12.6, 2.6, "3. Compliance Audit & Approvals")

    draw_arrow(ax, 10.8, 2.6, 14.1, 1.6)
    draw_pill_badge(ax, 12.6, 1.6, "Immutable Audit Trail Logs")

    plt.tight_layout()
    fig.savefig('report_diagrams/fig_dfd_level0.png', bbox_inches='tight', dpi=300)
    plt.close()
    print("Generated fig_dfd_level0.png")

# ==============================================================================
# 2. LEVEL 1 DFD (SYSTEM PROCESSING MODULES)
# ==============================================================================
def gen_level1():
    fig, ax = plt.subplots(figsize=(17, 9.5), dpi=300)
    ax.set_facecolor(BG_COLOR)
    fig.patch.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 18)
    ax.set_ylim(0, 10.5)
    ax.axis('off')

    # External entities (Left / Bottom)
    draw_box(ax, 1.4, 8.8, 2.2, 1.0, "Franchiser\n(Brand)", font_size=9)
    draw_box(ax, 1.4, 5.2, 2.2, 1.0, "Compliance\nAdmin", font_size=9)
    draw_box(ax, 8.5, 0.8, 3.0, 0.9, "Investor / Franchisee", font_size=9.5)

    # System Processing Modules Boundary Box
    boundary = Rectangle((3.2, 1.8), 10.6, 8.2,
                         facecolor=FILL_WHITE, edgecolor=BORDER_COLOR, linewidth=LINE_WIDTH, zorder=1)
    ax.add_patch(boundary)
    ax.text(8.5, 9.7, "System Processing Modules", ha='center', va='center', 
            fontsize=12, fontweight='bold', color=TEXT_COLOR)

    # Process modules inside
    draw_rounded_box(ax, 5.4, 8.5, 3.4, 1.1, "1.0 Authentication & User\nSession Management (RBAC)")
    draw_rounded_box(ax, 5.4, 6.4, 3.4, 1.1, "2.0 Brand Onboarding &\nDocument Compliance Vault")
    draw_rounded_box(ax, 11.2, 6.4, 3.4, 1.1, "3.0 DSS Feasibility &\nBreak-Even Simulation Engine")
    draw_rounded_box(ax, 8.5, 4.3, 3.4, 1.1, "4.0 Territory Quota Allocation\n& Atomic Decrement Engine")
    draw_rounded_box(ax, 8.5, 2.6, 3.4, 1.0, "5.0 Bilateral Contract\nE-Signature & Hash Engine")

    # Database Stores on Right
    draw_cylinder(ax, 16.0, 8.8, 2.8, 1.2, "User Profiles\nStore")
    draw_cylinder(ax, 16.0, 7.0, 2.8, 1.2, "Franchise Listings\nStore")
    draw_cylinder(ax, 16.0, 5.2, 2.8, 1.2, "Compliance Documents\nVault")
    draw_cylinder(ax, 16.0, 3.4, 2.8, 1.2, "Applications &\nAllocations")
    draw_cylinder(ax, 16.0, 1.6, 2.8, 1.2, "Contracts & Audit\nTrail Store")

    # Connect Entities to Processes
    draw_arrow(ax, 2.5, 8.8, 3.7, 8.5)
    draw_arrow(ax, 2.5, 8.4, 3.7, 6.6)
    draw_arrow(ax, 2.5, 5.2, 3.7, 6.2)
    draw_arrow(ax, 8.5, 1.3, 5.4, 7.9) # Investor auth
    draw_arrow(ax, 8.5, 1.3, 11.2, 5.8) # Investor DSS
    draw_arrow(ax, 8.5, 1.3, 8.5, 3.7) # Investor apply

    # Inter-process flows
    draw_arrow(ax, 7.1, 6.4, 9.5, 6.4)
    draw_pill_badge(ax, 8.3, 6.65, "Approved Catalog Specs", font_size=7.5)

    draw_arrow(ax, 11.2, 5.8, 9.8, 4.8)
    draw_pill_badge(ax, 11.2, 5.1, "Feasibility Metrics Approved", font_size=7.5)

    draw_arrow(ax, 8.5, 3.7, 8.5, 3.1)
    draw_pill_badge(ax, 9.6, 3.4, "Lock Territory Quota", font_size=7.5)

    # Process to DB flows
    draw_arrow(ax, 7.1, 8.5, 14.6, 8.8) # 1.0 -> Users
    draw_arrow(ax, 7.1, 6.8, 14.6, 7.0) # 2.0 -> Listings
    draw_arrow(ax, 7.1, 6.2, 14.6, 5.2) # 2.0 -> Docs
    draw_arrow(ax, 10.2, 4.3, 14.6, 3.4) # 4.0 -> Applications
    draw_arrow(ax, 10.2, 2.6, 14.6, 1.6) # 5.0 -> Contracts

    plt.tight_layout()
    fig.savefig('report_diagrams/fig_dfd_level1.png', bbox_inches='tight', dpi=300)
    plt.close()
    print("Generated fig_dfd_level1.png")

# ==============================================================================
# 3. LEVEL 2 DFD (DSS SIMULATION & CONTRACT EXECUTION)
# ==============================================================================
def gen_level2():
    fig, ax = plt.subplots(figsize=(16, 9.0), dpi=300)
    ax.set_facecolor(BG_COLOR)
    fig.patch.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 17)
    ax.set_ylim(0, 9.5)
    ax.axis('off')

    # Top client: React Client
    draw_box(ax, 7.5, 8.6, 3.2, 0.9, "React Client (Decision UI)", font_size=10)

    # Boundary Box: Sub-Process 3.0: DSS Investment Simulation Engine
    boundary = Rectangle((0.8, 0.5), 12.0, 7.4,
                         facecolor=FILL_WHITE, edgecolor=BORDER_COLOR, linewidth=LINE_WIDTH, zorder=1)
    ax.add_patch(boundary)
    ax.text(6.8, 7.6, "Sub-Process 3.0: DSS Investment Simulation & Feasibility Engine", 
            ha='center', va='center', fontsize=11, fontweight='bold', color=TEXT_COLOR)

    # Sub-processes inside
    draw_rounded_box(ax, 4.0, 6.4, 4.4, 0.9, "3.1 Ingest Investor Capital & Risk Profile")
    draw_rounded_box(ax, 4.0, 4.8, 4.4, 0.9, "3.2 Query Approved Brand Financial Metrics")
    draw_rounded_box(ax, 4.0, 3.2, 4.4, 0.9, "3.3 Run Multi-Scenario Cash Flow Projection")
    draw_rounded_box(ax, 4.0, 1.6, 4.4, 0.9, "3.4 Calculate ROI, NPV, IRR & Payback Period")
    draw_rounded_box(ax, 9.4, 3.2, 3.0, 1.6, "3.5 Multi-Criteria\nScorecard & Risk\nClassification\n(Low/Mod/High)")

    # Right DB Stores
    draw_cylinder(ax, 15.0, 5.5, 2.8, 1.4, "Franchise Listings\nDatabase")
    draw_cylinder(ax, 15.0, 2.2, 2.8, 1.4, "Investment Simulation\nLedger")

    # Connect client down
    draw_arrow(ax, 6.5, 8.1, 4.0, 6.9)
    draw_pill_badge(ax, 4.5, 7.5, "POST /api/simulations/run/")

    # Sequence flows
    draw_arrow(ax, 4.0, 5.9, 4.0, 5.3)
    draw_arrow(ax, 4.0, 4.3, 4.0, 3.7)
    draw_arrow(ax, 4.0, 2.7, 4.0, 2.1)
    draw_arrow(ax, 6.2, 2.0, 8.0, 2.8)

    # Connect to DB
    draw_arrow(ax, 6.2, 4.8, 13.6, 5.5)
    draw_pill_badge(ax, 9.6, 5.3, "Fetch Approved CapEx & Royalties", font_size=7.5)

    draw_arrow(ax, 9.4, 4.0, 13.6, 2.4)
    draw_pill_badge(ax, 11.2, 3.5, "Persist Simulation Metrics", font_size=7.5)

    # Return to client
    draw_arrow(ax, 9.4, 4.0, 8.8, 8.1)
    draw_pill_badge(ax, 9.8, 6.8, "JSON Feasibility Dashboard &\nMonte Carlo Confidence Bar", font_size=7.5)

    plt.tight_layout()
    fig.savefig('report_diagrams/fig_dfd_level2.png', bbox_inches='tight', dpi=300)
    plt.close()
    print("Generated fig_dfd_level2.png")

# ==============================================================================
# 4. UML USE CASE DIAGRAM
# ==============================================================================
def gen_use_case():
    fig, ax = plt.subplots(figsize=(13, 11.0), dpi=300)
    ax.set_facecolor(BG_COLOR)
    fig.patch.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 13)
    ax.set_ylim(0, 12.0)
    ax.axis('off')

    # System Boundary Box
    sys_box = Rectangle((4.6, 0.4), 7.8, 11.2,
                        facecolor=FILL_WHITE, edgecolor=BORDER_COLOR, linewidth=LINE_WIDTH, zorder=1)
    ax.add_patch(sys_box)
    ax.text(8.5, 11.3, "Franchise Investment Decision Support System (FDSS)", 
            ha='center', va='center', fontsize=11.5, fontweight='bold', color=TEXT_COLOR)

    # Actors on the left (Circles with text matching demo style)
    draw_circle(ax, 2.0, 9.4, 1.2, "Franchiser\n(Brand Owner)", font_size=9.5)
    draw_circle(ax, 2.0, 5.8, 1.2, "Investor /\nFranchisee", font_size=9.5)
    draw_circle(ax, 2.0, 2.2, 1.2, "System Admin /\nCompliance", font_size=9.5)

    # Use Cases (Rectangular boxes matching demo report style)
    ucs = [
        (8.5, 10.4, "UC-1: Register & Authenticate User (JWT / RBAC)"),
        (8.5, 9.1, "UC-2: Submit Franchise Proposal & CapEx Financials"),
        (8.5, 7.8, "UC-3: Upload Statutory Compliance Certificates"),
        (8.5, 6.5, "UC-4: Admin Audit & Document Verification Pipeline"),
        (8.5, 5.2, "UC-5: Run DSS Feasibility & Risk Simulation"),
        (8.5, 3.9, "UC-6: Apply for Territory & Lock Quota Units"),
        (8.5, 2.6, "UC-7: Dual-Party Bilateral Contract E-Signing"),
        (8.5, 1.3, "UC-8: Immutable Audit Trail & Platform Monitoring")
    ]

    for x, y, text in ucs:
        draw_box(ax, x, y, 6.6, 0.85, text, font_size=8.5, bold=False)

    # Franchiser links
    draw_arrow(ax, 3.2, 9.4, 5.2, 10.4)
    draw_arrow(ax, 3.2, 9.4, 5.2, 9.1)
    draw_arrow(ax, 3.2, 9.4, 5.2, 7.8)
    draw_arrow(ax, 3.2, 9.0, 5.2, 2.6) # Franchiser signs contract

    # Investor links
    draw_arrow(ax, 3.2, 6.0, 5.2, 10.4)
    draw_arrow(ax, 3.2, 6.0, 5.2, 5.2)
    draw_arrow(ax, 3.2, 5.8, 5.2, 3.9)
    draw_arrow(ax, 3.2, 5.6, 5.2, 2.6)

    # Admin links
    draw_arrow(ax, 3.2, 2.4, 5.2, 10.4)
    draw_arrow(ax, 3.2, 2.4, 5.2, 6.5)
    draw_arrow(ax, 3.2, 2.0, 5.2, 1.3)

    plt.tight_layout()
    fig.savefig('report_diagrams/fig_use_case.png', bbox_inches='tight', dpi=300)
    plt.close()
    print("Generated fig_use_case.png")

# ==============================================================================
# 5. UML ACTIVITY DIAGRAM
# ==============================================================================
def gen_activity():
    fig, ax = plt.subplots(figsize=(8.5, 14.5), dpi=300)
    ax.set_facecolor(BG_COLOR)
    fig.patch.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 9)
    ax.set_ylim(0, 16)
    ax.axis('off')

    # Start symbol (Solid circle)
    start = Circle((4.5, 15.3), 0.22, facecolor='#111827', edgecolor=BORDER_COLOR, linewidth=1.5)
    ax.add_patch(start)

    # State 1: Login
    draw_rounded_box(ax, 4.5, 14.1, 4.6, 0.9, "User Enters Credentials & JWT Authenticated")
    draw_arrow(ax, 4.5, 15.08, 4.5, 14.55)

    # Decision diamond
    diamond_pts = [[4.5, 13.0], [5.2, 12.5], [4.5, 12.0], [3.8, 12.5]]
    poly = Polygon(diamond_pts, closed=True, facecolor=FILL_WHITE, edgecolor=BORDER_COLOR, linewidth=LINE_WIDTH)
    ax.add_patch(poly)
    ax.text(4.5, 12.5, "Role?", ha='center', va='center', fontsize=8.5, fontweight='bold')
    draw_arrow(ax, 4.5, 13.65, 4.5, 13.0)

    # Two Swimlanes / Branches: Franchiser (Left), Investor (Right)
    # Left Branch: Franchiser Onboarding
    draw_rounded_box(ax, 2.4, 11.0, 3.4, 0.85, "Submit Brand Proposal\n& Capital Metrics")
    draw_rounded_box(ax, 2.4, 9.6, 3.4, 0.85, "Upload Statutory Docs\n(GST, FSSAI, PAN)")
    draw_rounded_box(ax, 2.4, 8.2, 3.4, 0.85, "Admin Verification &\nListing Approval")
    
    draw_arrow(ax, 3.8, 12.5, 2.4, 11.45, rad=0.2)
    draw_arrow(ax, 2.4, 10.55, 2.4, 10.05)
    draw_arrow(ax, 2.4, 9.15, 2.4, 8.65)

    # Right Branch: Investor Decision Journey
    draw_rounded_box(ax, 6.6, 11.0, 3.4, 0.85, "Browse Approved\nFranchise Catalog")
    draw_rounded_box(ax, 6.6, 9.6, 3.4, 0.85, "Run DSS Feasibility\n(ROI, NPV, Payback)")
    draw_rounded_box(ax, 6.6, 8.2, 3.4, 0.85, "Select Territory &\nSubmit Application")
    
    draw_arrow(ax, 5.2, 12.5, 6.6, 11.45, rad=-0.2)
    draw_arrow(ax, 6.6, 10.55, 6.6, 10.05)
    draw_arrow(ax, 6.6, 9.15, 6.6, 8.65)

    # Synchronization Bar (Horizontal Black Bar)
    bar = Rectangle((1.2, 6.9), 6.6, 0.16, facecolor='#111827', edgecolor='none')
    ax.add_patch(bar)
    draw_arrow(ax, 2.4, 7.75, 2.4, 7.06)
    draw_arrow(ax, 6.6, 7.75, 6.6, 7.06)

    # Merged Flow: Quota Allocation & E-Signing
    draw_rounded_box(ax, 4.5, 5.8, 5.0, 0.85, "Atomically Decrement Quota & Lock Territory")
    draw_arrow(ax, 4.5, 6.9, 4.5, 6.25)

    draw_rounded_box(ax, 4.5, 4.4, 5.0, 0.85, "Investor Reviews & E-Signs Legal Agreement")
    draw_arrow(ax, 4.5, 5.35, 4.5, 4.85)

    draw_rounded_box(ax, 4.5, 3.0, 5.0, 0.85, "Franchiser Counter-Signs Agreement")
    draw_arrow(ax, 4.5, 3.95, 4.5, 3.45)

    draw_rounded_box(ax, 4.5, 1.7, 5.0, 0.85, "Generate Audit Trail & Executed Contract PDF")
    draw_arrow(ax, 4.5, 2.55, 4.5, 2.15)

    # Bullseye End symbol
    end_outer = Circle((4.5, 0.5), 0.28, facecolor=FILL_WHITE, edgecolor=BORDER_COLOR, linewidth=1.5)
    end_inner = Circle((4.5, 0.5), 0.16, facecolor='#111827', edgecolor='none')
    ax.add_patch(end_outer)
    ax.add_patch(end_inner)
    draw_arrow(ax, 4.5, 1.25, 4.5, 0.78)

    plt.tight_layout()
    fig.savefig('report_diagrams/fig_activity.png', bbox_inches='tight', dpi=300)
    plt.close()
    print("Generated fig_activity.png")

# ==============================================================================
# 6. UML CLASS DIAGRAM
# ==============================================================================
def gen_class_diagram():
    fig, ax = plt.subplots(figsize=(17, 12.5), dpi=300)
    ax.set_facecolor(BG_COLOR)
    fig.patch.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 18)
    ax.set_ylim(0, 13.0)
    ax.axis('off')

    def draw_uml_class(x, y, w, title, attributes, methods):
        title_h = 0.65
        attr_h = 0.26 * len(attributes) + 0.2
        meth_h = 0.26 * len(methods) + 0.2
        total_h = title_h + attr_h + meth_h
        
        # Outer box
        rect = Rectangle((x - w/2, y - total_h/2), w, total_h,
                         facecolor=FILL_WHITE, edgecolor=BORDER_COLOR, linewidth=LINE_WIDTH, zorder=3)
        ax.add_patch(rect)
        
        # Title compartment
        t_rect = Rectangle((x - w/2, y + total_h/2 - title_h), w, title_h,
                           facecolor='#F3F4F6', edgecolor=BORDER_COLOR, linewidth=LINE_WIDTH, zorder=3)
        ax.add_patch(t_rect)
        ax.text(x, y + total_h/2 - title_h/2, title, ha='center', va='center',
                fontsize=9.5, fontweight='bold', color=TEXT_COLOR)
        
        # Attributes
        attr_top = y + total_h/2 - title_h - 0.12
        ax.text(x - w/2 + 0.18, attr_top, "\n".join(attributes), ha='left', va='top',
                fontsize=8.0, color=TEXT_COLOR, fontfamily='monospace')
        
        # Divider line
        div_y = y + total_h/2 - title_h - attr_h
        ax.plot([x - w/2, x + w/2], [div_y, div_y], color=BORDER_COLOR, lw=LINE_WIDTH, zorder=3)
        
        # Methods
        meth_top = div_y - 0.12
        ax.text(x - w/2 + 0.18, meth_top, "\n".join(methods), ha='left', va='top',
                fontsize=8.0, color=TEXT_COLOR, fontfamily='monospace')
        return total_h

    # Class 1: User
    draw_uml_class(2.6, 10.5, 4.4, "User (CustomUser)",
                   ["+id: UUID", "+username: String", "+role: Enum[INVESTOR|FRANCHISER|ADMIN]", "+email: String", "+date_joined: DateTime"],
                   ["+authenticate(): Boolean", "+get_role(): String", "+has_perm(perm): Boolean"])

    # Class 2: FranchiseListing
    draw_uml_class(9.0, 10.5, 5.2, "FranchiseListing",
                   ["+id: UUID", "+brand_name: String", "+industry: String", "+min_investment: Decimal", "+royalty_pct: Decimal", "+total_units: Integer", "+remaining_units: Integer", "+is_approved: Boolean"],
                   ["+approve_listing(): Void", "+decrement_quota(): Boolean", "+get_active_listings(): List"])

    # Class 3: FranchiseDocument
    draw_uml_class(15.4, 10.5, 4.2, "FranchiseDocument",
                   ["+id: UUID", "+doc_type: Enum[GST|FSSAI|PAN]", "+license_number: String", "+file_url: String", "+status: Enum[PENDING|VERIFIED]"],
                   ["+verify_doc(): Void", "+reject_doc(reason): Void"])

    # Class 4: FranchiseApplication
    draw_uml_class(4.6, 5.2, 5.0, "FranchiseApplication",
                   ["+id: UUID", "+target_territory: String", "+capital_committed: Decimal", "+status: Enum[SUBMITTED|APPROVED|LOCKED]", "+created_at: DateTime"],
                   ["+lock_territory(): Boolean", "+transition_status(): Void", "+generate_agreement(): Contract"])

    # Class 5: ContractAgreement
    draw_uml_class(12.6, 5.2, 5.4, "ContractAgreement",
                   ["+id: UUID", "+agreement_hash: SHA256", "+investor_signed_at: DateTime", "+franchiser_signed_at: DateTime", "+status: Enum[DRAFT|SIGNED|EXECUTED]"],
                   ["+sign_as_investor(sig): Void", "+sign_as_franchiser(sig): Void", "+generate_pdf(): File"])

    # Class 6: InvestmentSimulation
    draw_uml_class(4.6, 1.4, 5.0, "InvestmentSimulation",
                   ["+id: UUID", "+projected_roi: Decimal", "+npv: Decimal", "+irr: Decimal", "+payback_months: Integer", "+risk_score: String"],
                   ["+compute_cashflows(): Matrix", "+run_sensitivity(): Dict"])

    # Class 7: AuditLog
    draw_uml_class(12.6, 1.4, 5.4, "AuditLog",
                   ["+id: UUID", "+action: String", "+ip_address: String", "+timestamp: DateTime", "+checksum: Hash"],
                   ["+record_event(): Void", "+verify_integrity(): Boolean"])

    # Associations
    draw_arrow(ax, 4.8, 10.5, 6.4, 10.5) # User -> Listing
    ax.text(5.6, 10.7, "1 .. *", ha='center', va='bottom', fontsize=8.0, fontweight='bold', color=TEXT_COLOR)

    draw_arrow(ax, 11.6, 10.5, 13.3, 10.5) # Listing -> Docs
    ax.text(12.45, 10.7, "1 .. *", ha='center', va='bottom', fontsize=8.0, fontweight='bold', color=TEXT_COLOR)

    draw_arrow(ax, 8.2, 8.6, 5.8, 6.85) # Listing -> Application
    draw_arrow(ax, 7.1, 5.2, 9.9, 5.2) # Application -> Contract
    ax.text(8.5, 5.4, "1 .. 1", ha='center', va='bottom', fontsize=8.0, fontweight='bold', color=TEXT_COLOR)

    draw_arrow(ax, 4.6, 3.55, 4.6, 2.65) # App -> Simulation
    draw_arrow(ax, 12.6, 3.55, 12.6, 2.65) # Contract -> Audit

    plt.tight_layout()
    fig.savefig('report_diagrams/fig_class_diagram.png', bbox_inches='tight', dpi=300)
    plt.close()
    print("Generated fig_class_diagram.png")

# ==============================================================================
# 7. UML SEQUENCE DIAGRAM
# ==============================================================================
def gen_sequence_diagram():
    fig, ax = plt.subplots(figsize=(16, 11.5), dpi=300)
    ax.set_facecolor(BG_COLOR)
    fig.patch.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 12.5)
    ax.axis('off')

    # Lifeline participants at top
    participants = [
        ("Investor\n(User)", 1.5),
        ("React UI\n(Client)", 4.0),
        ("Django REST\nAPI (Backend)", 7.0),
        ("DSS Simulation\nEngine", 10.0),
        ("Database\n(SQLite/PostgreSQL)", 13.0),
        ("Franchiser\n(User)", 15.2)
    ]

    for name, x in participants:
        draw_box(ax, x, 11.8, 2.0, 0.9, name, font_size=8.5)
        # Lifeline dashed line
        ax.plot([x, x], [0.4, 11.35], color='#9CA3AF', linestyle='--', lw=1.2, zorder=1)

    # Phased horizontal bands matching demo report sequence style
    # Phase 1: Authentication & Catalog
    p1_bg = Rectangle((0.4, 9.4), 15.2, 1.6, facecolor='#FEF3C7', edgecolor='none', alpha=0.5, zorder=0)
    ax.add_patch(p1_bg)
    ax.text(8.0, 10.7, "1. Authentication & Catalog Discovery", ha='center', va='center', 
            fontsize=9.5, fontweight='bold', color='#92400E')

    draw_arrow(ax, 1.5, 10.3, 4.0, 10.3)
    ax.text(2.75, 10.45, "1. Enter Credentials", ha='center', fontsize=7.5)

    draw_arrow(ax, 4.0, 9.9, 7.0, 9.9)
    ax.text(5.5, 10.05, "2. POST /api/token/ (JWT)", ha='center', fontsize=7.5)

    draw_arrow(ax, 7.0, 9.6, 13.0, 9.6)
    ax.text(10.0, 9.75, "3. Query Verified Brand Catalog", ha='center', fontsize=7.5)

    # Phase 2: DSS Investment Feasibility
    p2_bg = Rectangle((0.4, 6.7), 15.2, 2.4, facecolor='#E0F2FE', edgecolor='none', alpha=0.5, zorder=0)
    ax.add_patch(p2_bg)
    ax.text(8.0, 8.8, "2. Decision Support Simulation & Risk Scoring", ha='center', va='center', 
            fontsize=9.5, fontweight='bold', color='#075985')

    draw_arrow(ax, 1.5, 8.4, 4.0, 8.4)
    ax.text(2.75, 8.55, "4. Input Capital & Desired Payback", ha='center', fontsize=7.5)

    draw_arrow(ax, 4.0, 8.0, 7.0, 8.0)
    ax.text(5.5, 8.15, "5. POST /api/simulations/run/", ha='center', fontsize=7.5)

    draw_arrow(ax, 7.0, 7.6, 10.0, 7.6)
    ax.text(8.5, 7.75, "6. Execute DCF & Monte Carlo", ha='center', fontsize=7.5)

    draw_arrow(ax, 10.0, 7.2, 7.0, 7.2)
    ax.text(8.5, 7.35, "7. Return ROI (38.4%) & NPV (Rs 2.48M)", ha='center', fontsize=7.5)

    draw_arrow(ax, 7.0, 6.8, 4.0, 6.8)
    ax.text(5.5, 6.95, "8. Render Dynamic Feasibility Dashboard", ha='center', fontsize=7.5)

    # Phase 3: Quota Locking & Dual-Party Contract E-Signing
    p3_bg = Rectangle((0.4, 0.6), 15.2, 5.8, facecolor='#DCFCE7', edgecolor='none', alpha=0.5, zorder=0)
    ax.add_patch(p3_bg)
    ax.text(8.0, 6.1, "3. Atomic Quota Allocation & Dual-Party Contract E-Signing", ha='center', va='center', 
            fontsize=9.5, fontweight='bold', color='#166534')

    draw_arrow(ax, 1.5, 5.6, 4.0, 5.6)
    ax.text(2.75, 5.75, "9. Submit Application for Kochi Central", ha='center', fontsize=7.5)

    draw_arrow(ax, 4.0, 5.1, 7.0, 5.1)
    ax.text(5.5, 5.25, "10. Atomic Decrement Quota (F-Expression)", ha='center', fontsize=7.5)

    draw_arrow(ax, 7.0, 4.6, 13.0, 4.6)
    ax.text(10.0, 4.75, "11. Units Remaining: 5 -> 4 (Row Locked)", ha='center', fontsize=7.5)

    draw_arrow(ax, 7.0, 4.1, 4.0, 4.1)
    ax.text(5.5, 4.25, "12. Generate Bilateral Agreement Draft", ha='center', fontsize=7.5)

    draw_arrow(ax, 1.5, 3.5, 7.0, 3.5)
    ax.text(4.25, 3.65, "13. Investor Signs: /api/contracts/{id}/sign-investor/", ha='center', fontsize=7.5)

    draw_arrow(ax, 7.0, 3.0, 15.2, 3.0)
    ax.text(11.1, 3.15, "14. Notify Brand Owner (Counter-Sign Pending)", ha='center', fontsize=7.5)

    draw_arrow(ax, 15.2, 2.4, 7.0, 2.4)
    ax.text(11.1, 2.55, "15. Franchiser Counter-Signs: /api/contracts/{id}/sign-franchiser/", ha='center', fontsize=7.5)

    draw_arrow(ax, 7.0, 1.7, 13.0, 1.7)
    ax.text(10.0, 1.85, "16. Persist Cryptographic Signatures & Timestamp", ha='center', fontsize=7.5)

    draw_arrow(ax, 7.0, 1.1, 4.0, 1.1)
    ax.text(5.5, 1.25, "17. Contract Fully Executed (PDF Vault Sealed)", ha='center', fontsize=7.5)

    plt.tight_layout()
    fig.savefig('report_diagrams/fig_sequence_diagram.png', bbox_inches='tight', dpi=300)
    plt.close()
    print("Generated fig_sequence_diagram.png")

# ==============================================================================
# 8. ENTITY RELATIONSHIP (ER) DIAGRAM
# ==============================================================================
def gen_er_diagram():
    fig, ax = plt.subplots(figsize=(15, 7.5), dpi=300)
    ax.set_facecolor(BG_COLOR)
    fig.patch.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 8.5)
    ax.axis('off')

    def draw_diamond(x, y, text, w=1.8, h=1.2):
        pts = [[x, y + h/2], [x + w/2, y], [x, y - h/2], [x - w/2, y]]
        poly = Polygon(pts, closed=True, facecolor=FILL_WHITE, edgecolor=BORDER_COLOR, linewidth=LINE_WIDTH, zorder=3)
        ax.add_patch(poly)
        ax.text(x, y, text, ha='center', va='center', fontsize=8.5, fontweight='bold', color=TEXT_COLOR, zorder=4)

    def draw_oval_attr(x, y, text, w=1.8, h=0.75):
        ellipse = patches.Ellipse((x, y), w, h, facecolor=FILL_WHITE, edgecolor='#6B7280', linewidth=1.2, zorder=3)
        ax.add_patch(ellipse)
        ax.text(x, y, text, ha='center', va='center', fontsize=7.5, color=TEXT_COLOR, zorder=4)

    # Entities
    draw_box(ax, 1.8, 4.5, 2.4, 1.1, "User\n(Account)", font_size=9.5)
    draw_diamond(5.0, 6.2, "Registers")
    draw_box(ax, 8.0, 6.2, 2.6, 1.1, "Franchise\nListing", font_size=9.5)
    draw_diamond(11.2, 6.2, "Validates")
    draw_box(ax, 14.2, 6.2, 2.6, 1.1, "Compliance\nDocument", font_size=9.5)

    draw_diamond(5.0, 2.8, "Submits")
    draw_box(ax, 8.0, 2.8, 2.6, 1.1, "Franchise\nApplication", font_size=9.5)
    draw_diamond(11.2, 2.8, "Generates")
    draw_box(ax, 14.2, 2.8, 2.6, 1.1, "Contract\nAgreement", font_size=9.5)

    # Attributes (Ovals)
    draw_oval_attr(1.8, 6.5, "user_id (PK)")
    draw_oval_attr(1.8, 2.5, "role (Enum)")
    draw_arrow(ax, 1.8, 5.05, 1.8, 6.12)
    draw_arrow(ax, 1.8, 3.95, 1.8, 2.88)

    draw_oval_attr(8.0, 7.9, "brand_name")
    draw_oval_attr(8.0, 4.4, "remaining_units")
    draw_arrow(ax, 8.0, 6.75, 8.0, 7.52)
    draw_arrow(ax, 8.0, 5.65, 8.0, 4.78)

    draw_oval_attr(14.2, 7.9, "doc_hash")
    draw_arrow(ax, 14.2, 6.75, 14.2, 7.52)

    draw_oval_attr(14.2, 1.4, "contract_hash")
    draw_arrow(ax, 14.2, 2.25, 14.2, 1.78)

    # Entity Connectors
    draw_arrow(ax, 3.0, 4.8, 4.1, 6.2)
    draw_arrow(ax, 5.9, 6.2, 6.7, 6.2)
    draw_arrow(ax, 9.3, 6.2, 10.3, 6.2)
    draw_arrow(ax, 12.1, 6.2, 12.9, 6.2)

    draw_arrow(ax, 3.0, 4.2, 4.1, 2.8)
    draw_arrow(ax, 5.9, 2.8, 6.7, 2.8)
    draw_arrow(ax, 9.3, 2.8, 10.3, 2.8)
    draw_arrow(ax, 12.1, 2.8, 12.9, 2.8)

    # Cross relation: Listing to Application (Contains)
    draw_arrow(ax, 8.0, 5.65, 8.0, 3.35)
    draw_pill_badge(ax, 8.0, 4.5, "1 .. N Quota Units", font_size=7.5)

    plt.tight_layout()
    fig.savefig('report_diagrams/fig_er_diagram.png', bbox_inches='tight', dpi=300)
    plt.close()
    print("Generated fig_er_diagram.png")

# ==============================================================================
# 9. GANTT CHART (PROJECT TIMELINE)
# ==============================================================================
def gen_gantt_chart():
    fig, ax = plt.subplots(figsize=(14, 6.5), dpi=300)
    ax.set_facecolor(BG_COLOR)
    fig.patch.set_facecolor(BG_COLOR)
    
    tasks = [
        "1. Problem Definition & Domain Literature",
        "2. Requirements Engineering & SRS Drafting",
        "3. System Architecture & DFD/UML Modeling",
        "4. Database Schema Design & Migrations",
        "5. Django REST API & RBAC Core Engines",
        "6. DSS Financial Models & Monte Carlo Engine",
        "7. React UI & Interactive Decision Dashboards",
        "8. Document Vault & Quota Locking Pipeline",
        "9. Dual-Party Contract E-Signature Engine",
        "10. System Testing, Bug Fixes & Optimization",
        "11. Documentation, Academic Report & Viva Prep"
    ]
    starts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    durations = [2, 2, 2, 2, 3, 3, 3, 2, 2, 2, 2]
    
    y_pos = np.arange(len(tasks))
    ax.set_yticks(y_pos)
    ax.set_yticklabels(tasks, fontsize=9.5, color=TEXT_COLOR)
    ax.invert_yaxis()  # top-down
    
    # Plot Gantt bars
    colors = ['#3B82F6', '#2563EB', '#1D4ED8', '#0D9488', '#059669', 
              '#10B981', '#F59E0B', '#D97706', '#8B5CF6', '#6366F1', '#4F46E5']
    
    for idx, (s, d, c) in enumerate(zip(starts, durations, colors)):
        ax.barh(idx, d, left=s, height=0.55, align='center', color=c, edgecolor=BORDER_COLOR, linewidth=1.2)
        ax.text(s + d/2, idx, f"W{s}-W{s+d-1}", ha='center', va='center', 
                color='#FFFFFF', fontweight='bold', fontsize=7.5)

    ax.set_xlabel("Project Timeline (Weeks 1 to 12)", fontsize=10.5, fontweight='bold', color=TEXT_COLOR)
    ax.set_xlim(0.5, 13)
    ax.set_xticks(range(1, 13))
    ax.set_xticklabels([f"Week {w}" for w in range(1, 13)], fontsize=8.5)
    ax.grid(axis='x', linestyle='--', alpha=0.5)

    plt.tight_layout()
    fig.savefig('report_diagrams/fig_gantt_chart.png', bbox_inches='tight', dpi=300)
    plt.close()
    print("Generated fig_gantt_chart.png")

# ==============================================================================
# 10. PERT NETWORK DIAGRAM
# ==============================================================================
def gen_pert_chart():
    fig, ax = plt.subplots(figsize=(15, 6.5), dpi=300)
    ax.set_facecolor(BG_COLOR)
    fig.patch.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 7)
    ax.axis('off')

    # Nodes (Events) as Circles
    nodes = [
        (1.5, 3.5, "1", "Project Start"),
        (4.0, 5.2, "2", "Specs Complete"),
        (4.0, 1.8, "3", "DB Schema"),
        (7.5, 5.2, "4", "Backend APIs"),
        (7.5, 1.8, "5", "DSS Engine"),
        (11.0, 3.5, "6", "Frontend & E-Sign"),
        (14.5, 3.5, "7", "Project Complete")
    ]

    for x, y, num, lbl in nodes:
        c = Circle((x, y), 0.55, facecolor='#EFF6FF', edgecolor=BORDER_COLOR, linewidth=LINE_WIDTH, zorder=3)
        ax.add_patch(c)
        ax.text(x, y, num, ha='center', va='center', fontsize=11, fontweight='bold', color=TEXT_COLOR, zorder=4)
        ax.text(x, y - 0.85, lbl, ha='center', va='center', fontsize=8.0, fontweight='bold', color=TEXT_COLOR, zorder=4)

    # Directed Activity Arrows
    arrows = [
        (1.5, 3.5, 4.0, 5.2, "A: Literature (2w)"),
        (1.5, 3.5, 4.0, 1.8, "B: Data Modeling (2w)"),
        (4.0, 5.2, 7.5, 5.2, "C: Core REST API (3w) [CRITICAL]"),
        (4.0, 1.8, 7.5, 1.8, "D: Financial DSS (3w)"),
        (7.5, 5.2, 11.0, 3.5, "E: React & Vault (3w) [CRITICAL]"),
        (7.5, 1.8, 11.0, 3.5, "F: Quota Locking (2w)"),
        (11.0, 3.5, 14.5, 3.5, "G: Testing & E-Sign (2w) [CRITICAL]")
    ]

    for x1, y1, x2, y2, lbl in arrows:
        # Offset for circle radius
        dx, dy = x2 - x1, y2 - y1
        dist = np.hypot(dx, dy)
        ux, uy = dx / dist, dy / dist
        sx, sy = x1 + 0.55*ux, y1 + 0.55*uy
        ex, ey = x2 - 0.55*ux, y2 - 0.55*uy
        
        is_crit = "[CRITICAL]" in lbl
        color = "#DC2626" if is_crit else BORDER_COLOR
        lw = 2.2 if is_crit else 1.5
        
        ax.annotate("", xy=(ex, ey), xytext=(sx, sy),
                    arrowprops=dict(arrowstyle="-|>", color=color, lw=lw, mutation_scale=14),
                    zorder=2)
        mid_x, mid_y = (sx + ex)/2, (sy + ey)/2 + 0.3
        ax.text(mid_x, mid_y, lbl, ha='center', va='center', 
                fontsize=7.5, fontweight='bold' if is_crit else 'normal',
                color=color, bbox=dict(facecolor=FILL_WHITE, edgecolor='none', pad=1))

    plt.tight_layout()
    fig.savefig('report_diagrams/fig_pert_chart.png', bbox_inches='tight', dpi=300)
    plt.close()
    print("Generated fig_pert_chart.png")

if __name__ == "__main__":
    gen_level0()
    gen_level1()
    gen_level2()
    gen_use_case()
    gen_activity()
    gen_class_diagram()
    gen_sequence_diagram()
    gen_er_diagram()
    gen_gantt_chart()
    gen_pert_chart()
    print("All 10 report diagrams successfully generated!")
