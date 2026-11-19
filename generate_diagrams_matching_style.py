import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Circle, Polygon, Rectangle, PathPatch
from matplotlib.path import Path
import numpy as np
import os

os.makedirs('report_diagrams', exist_ok=True)

# Common styling constants matching the friend's demo PDF design system
BG_COLOR = "#FFFFFF"
BORDER_COLOR = "#1A1D2E"
FILL_WHITE = "#FFFFFF"
FILL_LIGHT_GRAY = "#D1D5DB"
TEXT_COLOR = "#111827"
LINE_WIDTH = 1.8
FONT_FAMILY = "sans-serif"

def draw_cylinder(ax, x, y, w, h, text, font_size=9):
    """Draws a 3D database cylinder store matching demo report style."""
    ellipse_h = h * 0.28
    
    # Body rectangle
    body = Rectangle((x - w/2, y - h/2 + ellipse_h/2), w, h - ellipse_h, 
                     facecolor='#F3F4F6', edgecolor=BORDER_COLOR, linewidth=LINE_WIDTH)
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
    ax.add_patch(Polygon(verts, closed=True, facecolor='#F3F4F6', edgecolor='none'))
    
    # Top ellipse (full)
    top_ellipse = patches.Ellipse((x, y + h/2 - ellipse_h/2), w, ellipse_h, 
                                  facecolor='#E5E7EB', edgecolor=BORDER_COLOR, linewidth=LINE_WIDTH)
    ax.add_patch(top_ellipse)
    
    # Text
    ax.text(x, y - h*0.08, text, ha='center', va='center', 
            fontsize=font_size, fontweight='bold', color=TEXT_COLOR, fontfamily=FONT_FAMILY)

def draw_pill_badge(ax, x, y, text, w=None, h=0.35, font_size=8.5):
    """Draws gray label badge along arrows matching demo report style."""
    lines = text.split('\n')
    max_len = max(len(l) for l in lines)
    calc_w = max(1.8, max_len * 0.088) if w is None else w
    calc_h = max(h, 0.26 * len(lines) + 0.1)
    
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

def draw_rounded_box(ax, x, y, w, h, text, font_size=9, fill_color=FILL_WHITE):
    """Draws rounded box matching demo report process module."""
    bbox = FancyBboxPatch((x - w/2, y - h/2), w, h,
                          boxstyle="round,pad=0.04,rounding_size=0.15",
                          facecolor=fill_color, edgecolor=BORDER_COLOR, linewidth=LINE_WIDTH, zorder=3)
    ax.add_patch(bbox)
    ax.text(x, y, text, ha='center', va='center',
            fontsize=font_size, color=TEXT_COLOR, fontfamily=FONT_FAMILY, zorder=4)

def draw_circle(ax, x, y, r, text, font_size=10):
    """Draws circular process matching demo report Level 0 DFD."""
    circle = Circle((x, y), r, facecolor=FILL_WHITE, edgecolor=BORDER_COLOR, linewidth=LINE_WIDTH*1.1, zorder=3)
    ax.add_patch(circle)
    ax.text(x, y, text, ha='center', va='center',
            fontsize=font_size, fontweight='bold', color=TEXT_COLOR, fontfamily=FONT_FAMILY, zorder=4)

def draw_arrow(ax, x1, y1, x2, y2, zorder=2, rad=0.0):
    """Draws connecting arrow matching demo report."""
    connectionstyle = f"arc3,rad={rad}" if rad != 0.0 else "arc3"
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="-|>", color=BORDER_COLOR, lw=1.6,
                                connectionstyle=connectionstyle, mutation_scale=14),
                zorder=zorder)

# ==========================================
# 1. LEVEL 0 DFD: CONTEXT DIAGRAM
# ==========================================
def generate_level0_dfd():
    fig, ax = plt.subplots(figsize=(14, 6.5), dpi=300)
    ax.set_facecolor(BG_COLOR)
    fig.patch.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 8)
    ax.axis('off')

    # System boundary box
    sys_boundary = Rectangle((5.2, 0.4), 5.6, 7.2,
                             facecolor=FILL_WHITE, edgecolor=BORDER_COLOR, linewidth=LINE_WIDTH, zorder=1)
    ax.add_patch(sys_boundary)
    ax.text(8.0, 7.3, "Franchise Investment Decision Support System Boundary", 
            ha='center', va='center', fontsize=11, fontweight='bold', color=TEXT_COLOR)

    # Core engine circle
    draw_circle(ax, 8.0, 3.8, 1.8, "Franchise Decision Support\n& Investment Engine\n(FDSS Core)", font_size=10.5)

    # Left external entities
    draw_box(ax, 2.0, 5.8, 3.2, 1.1, "Franchiser\n(Brand Owner)", font_size=10.5)
    draw_box(ax, 2.0, 2.2, 3.2, 1.1, "Statutory Compliance\nAuthorities (GST/FSSAI)", font_size=10)

    # Right external entities
    draw_box(ax, 14.0, 5.8, 3.0, 1.1, "Investor /\nProspective Franchisee", font_size=10.5)
    draw_box(ax, 14.0, 2.2, 3.0, 1.1, "System Administrator /\nCompliance Officer", font_size=10)

    # Left flows (Franchiser -> Core)
    draw_arrow(ax, 3.6, 6.0, 6.3, 4.6)
    draw_pill_badge(ax, 4.8, 5.5, "1. Brand Profile & Financials")

    draw_arrow(ax, 6.4, 4.2, 3.6, 5.5)
    draw_pill_badge(ax, 4.9, 4.6, "Listing Status & Dual E-Sign Notice")

    # Left flows (Compliance -> Core)
    draw_arrow(ax, 3.6, 2.2, 6.3, 3.2)
    draw_pill_badge(ax, 4.8, 2.5, "Document Vault Verification Feed")

    # Right flows (Investor <-> Core)
    draw_arrow(ax, 12.5, 6.0, 9.7, 4.6)
    draw_pill_badge(ax, 11.2, 5.6, "2. Capital, Risk Profile & Territory Application")

    draw_arrow(ax, 9.7, 4.2, 12.5, 5.5)
    draw_pill_badge(ax, 11.2, 4.6, "DSS Feasibility Report & Quota Confirmation")

    # Right flows (Admin <-> Core)
    draw_arrow(ax, 12.5, 2.4, 9.6, 3.2)
    draw_pill_badge(ax, 11.2, 2.7, "3. Compliance Audit & Approvals")

    draw_arrow(ax, 9.6, 3.0, 12.5, 2.0)
    draw_pill_badge(ax, 11.2, 1.7, "Immutable Audit Trail Logs")

    plt.tight_layout()
    fig.savefig('report_diagrams/fig_dfd_level0.png', bbox_inches='tight', dpi=300)
    plt.close()
    print("Saved fig_dfd_level0.png")

generate_level0_dfd()
