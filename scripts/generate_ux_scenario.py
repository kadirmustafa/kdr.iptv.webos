import os
from PIL import Image, ImageDraw, ImageFont

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(SCRIPT_DIR)
ASSETS_DIR = os.path.join(BASE_DIR, 'store-assets', 'webos')

PAGE_WIDTH = 1240
PAGE_HEIGHT = 1754
MARGIN = 80

FONT_PATH = "C:/Windows/Fonts/segoeui.ttf"
FONT_BOLD_PATH = "C:/Windows/Fonts/segoeuib.ttf"

def get_font(size, bold=False):
    path = FONT_BOLD_PATH if bold else FONT_PATH
    try:
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

def create_page():
    img = Image.new("RGB", (PAGE_WIDTH, PAGE_HEIGHT), "#FFFFFF")
    return img

def draw_header(draw, title, subtitle, page_num, total_pages=3):
    # Header line
    draw.line([(MARGIN, 80), (PAGE_WIDTH - MARGIN, 80)], fill="#0284C7", width=3)
    
    # Title
    draw.text((MARGIN, 40), title, fill="#0F172A", font=get_font(24, bold=True))
    draw.text((MARGIN, 68), subtitle, fill="#64748B", font=get_font(14))
    
    badge_text = f"PAGE {page_num} OF {total_pages}"
    draw.rounded_rectangle([(PAGE_WIDTH - MARGIN - 120, 44), (PAGE_WIDTH - MARGIN, 72)], radius=4, fill="#0284C7")
    draw.text((PAGE_WIDTH - MARGIN - 105, 52), badge_text, fill="#FFFFFF", font=get_font(12, bold=True))
    
    # Footer
    draw.line([(MARGIN, PAGE_HEIGHT - 60), (PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 60)], fill="#E2E8F0", width=1)
    draw.text((MARGIN, PAGE_HEIGHT - 45), "KDR IPTV (com.kdr.iptv) - LG webOS TV QA Submission Document", fill="#94A3B8", font=get_font(11))
    draw.text((PAGE_WIDTH - MARGIN - 140, PAGE_HEIGHT - 45), "Confidential - LG Seller Lounge", fill="#94A3B8", font=get_font(11))

def draw_section_title(draw, y, title):
    draw.text((MARGIN, y), title, fill="#0369A1", font=get_font(18, bold=True))
    draw.line([(MARGIN, y + 26), (PAGE_WIDTH - MARGIN, y + 26)], fill="#E2E8F0", width=1)
    return y + 36

def draw_info_box(draw, x, y, w, h, label, val):
    draw.rounded_rectangle([(x, y), (x + w, y + h)], radius=6, fill="#F8FAFC", outline="#CBD5E1", width=1)
    draw.text((x + 14, y + 10), label.upper(), fill="#64748B", font=get_font(11, bold=True))
    draw.text((x + 14, y + 28), val, fill="#0F172A", font=get_font(14, bold=True))

def draw_callout(draw, y, title, text, bg="#EFF6FF", border="#0284C7"):
    h = 65
    draw.rounded_rectangle([(MARGIN, y), (PAGE_WIDTH - MARGIN, y + h)], radius=6, fill=bg, outline="#E2E8F0", width=1)
    draw.rectangle([(MARGIN, y), (MARGIN + 5, y + h)], fill=border)
    draw.text((MARGIN + 16, y + 12), title, fill="#0F172A", font=get_font(13, bold=True))
    draw.text((MARGIN + 16, y + 34), text, fill="#334155", font=get_font(12))
    return y + h + 16

def paste_screenshot(page, img_path, y, target_w=PAGE_WIDTH - 2 * MARGIN, target_h=280):
    if os.path.exists(img_path):
        sc = Image.open(img_path)
        sc.thumbnail((target_w, target_h), Image.Resampling.LANCZOS)
        
        # Center horizontally
        pos_x = MARGIN + (target_w - sc.width) // 2
        
        # Draw border
        border_rect = [(pos_x - 2, y - 2), (pos_x + sc.width + 1, y + sc.height + 1)]
        draw = ImageDraw.Draw(page)
        draw.rectangle(border_rect, outline="#94A3B8", width=1)
        
        page.paste(sc, (pos_x, y))
        return y + sc.height + 20
    return y + 20

# ----------------- PAGE 1 -----------------
p1 = create_page()
d1 = ImageDraw.Draw(p1)
draw_header(d1, "LG webOS QA Test UX Scenario", "KDR IPTV: Smart Stream Player (v1.0.4)", 1)

y = 110
y = draw_section_title(d1, y, "1. Application Overview & Metadata")

box_w = (PAGE_WIDTH - 2 * MARGIN - 15) // 2
box_h = 56

draw_info_box(d1, MARGIN, y, box_w, box_h, "App Title", "KDR IPTV: Smart Stream Player")
draw_info_box(d1, MARGIN + box_w + 15, y, box_w, box_h, "App ID", "com.kdr.iptv")
y += box_h + 10

draw_info_box(d1, MARGIN, y, box_w, box_h, "Package Version", "1.0.4 (IPK)")
draw_info_box(d1, MARGIN + box_w + 15, y, box_w, box_h, "Graphic Resolution", "1920x1080 (FHD / 4K UHD Compatible)")
y += box_h + 10

draw_info_box(d1, MARGIN, y, box_w, box_h, "App Category", "Entertainment / Media & Video")
draw_info_box(d1, MARGIN + box_w + 15, y, box_w, box_h, "Billing / Ads", "Free Player / No Ads / No Purchases")
y += box_h + 10

draw_info_box(d1, MARGIN, y, box_w, box_h, "Remote Controller", "Magic Remote & General Remote")
draw_info_box(d1, MARGIN + box_w + 15, y, box_w, box_h, "Pairing Portal", "https://pairiptv.ozturk.app")
y += box_h + 24

y = draw_section_title(d1, y, "2. Remote Controller Key Mapping Table")

headers = [("KEY / INPUT", 220), ("DASHBOARD & CATALOG", 420), ("FULLSCREEN VIDEO PLAYER", 440)]
cur_x = MARGIN
d1.rectangle([(MARGIN, y), (PAGE_WIDTH - MARGIN, y + 28)], fill="#F1F5F9", outline="#CBD5E1")
for h_txt, col_w in headers:
    d1.text((cur_x + 10, y + 7), h_txt, fill="#0F172A", font=get_font(11, bold=True))
    cur_x += col_w
y += 28

key_rows = [
    ("Arrow Up / Down", "Navigate channel rows and vertical lists", "Switch previous / next channel"),
    ("Arrow Left / Right", "Switch tabs (Live, Movies, Series, Settings)", "Seek rewind / fast-forward (VOD)"),
    ("OK / Enter Key", "Select channel, open playback, confirm", "Toggle Player OSD toolbar"),
    ("Back / Return", "Return to top navigation / Exit application", "Close video player, return to catalog"),
    ("Magic Remote Pointer", "Hover, point, click channels, wheel scroll", "Click OSD buttons, Audio, Subtitles, PIP"),
]

for idx, (k, d_val, p_val) in enumerate(key_rows):
    bg_col = "#FFFFFF" if idx % 2 == 0 else "#F8FAFC"
    d1.rectangle([(MARGIN, y), (PAGE_WIDTH - MARGIN, y + 28)], fill=bg_col, outline="#E2E8F0")
    cur_x = MARGIN
    d1.text((cur_x + 10, y + 7), k, fill="#0F172A", font=get_font(11, bold=True))
    cur_x += 220
    d1.text((cur_x + 10, y + 7), d_val, fill="#334155", font=get_font(11))
    cur_x += 420
    d1.text((cur_x + 10, y + 7), p_val, fill="#334155", font=get_font(11))
    y += 28

y += 24
y = draw_section_title(d1, y, "3. Test Credentials & Prerequisites for QA")
y = draw_callout(d1, y, "Zero Login / Pre-Loaded Demo Content", 
                 "No username, password or voucher code is required. The application comes pre-loaded with public streaming channels for instant verification.",
                 bg="#F0FDF4", border="#16A34A")

y = draw_callout(d1, y, "Cloud Pairing & Synchronization Verification",
                 "Testers can test cloud pairing by opening https://pairiptv.ozturk.app on PC/mobile and submitting the 6-character code shown on the TV.",
                 bg="#EFF6FF", border="#0284C7")

# ----------------- PAGE 2 -----------------
p2 = create_page()
d2 = ImageDraw.Draw(p2)
draw_header(d2, "Key UX Scenarios & Visual Flows", "Scenarios 1, 2 & 3: Startup, Catalog & Video Playback", 2)

y = 110
y = draw_section_title(d2, y, "Scenario 1: App Launch & Splash Screen")
d2.text((MARGIN, y), "1. Launch com.kdr.iptv from the webOS Home Launcher.", fill="#334155", font=get_font(12))
d2.text((MARGIN, y + 20), "2. The branded splash screen displays smoothly, initializing storage & local cache.", fill="#334155", font=get_font(12))
d2.text((MARGIN, y + 40), "Expected: Application reaches Dashboard in under 2 seconds without flickering.", fill="#16A34A", font=get_font(12, bold=True))
y += 66

y = draw_section_title(d2, y, "Scenario 2: Main Dashboard & Channel Catalog")
d2.text((MARGIN, y), "1. Use Remote D-Pad or Magic Remote pointer to browse Live TV, Movies, Series.", fill="#334155", font=get_font(12))
d2.text((MARGIN, y + 20), "2. Focus updates instantly with cyan glow; Electronic Program Guide (EPG) displays current show.", fill="#334155", font=get_font(12))
y += 44
y = paste_screenshot(p2, os.path.join(ASSETS_DIR, "screenshot_1_dashboard_1920x1080.jpg"), y, target_h=300)

y = draw_section_title(d2, y, "Scenario 3: Video Player & On-Screen Display (OSD)")
d2.text((MARGIN, y), "1. Press OK/Enter on any channel to launch fullscreen player with native HLS streaming.", fill="#334155", font=get_font(12))
d2.text((MARGIN, y + 20), "2. Press OK/Enter during playback to reveal OSD (Audio track, Subtitles, PIP multi-screen, Aspect ratio).", fill="#334155", font=get_font(12))
d2.text((MARGIN, y + 40), "3. Press Back button to close playback and smoothly return to the channel catalog.", fill="#334155", font=get_font(12))
y += 64
y = paste_screenshot(p2, os.path.join(ASSETS_DIR, "screenshot_2_player_1920x1080.jpg"), y, target_h=300)

# ----------------- PAGE 3 -----------------
p3 = create_page()
d3 = ImageDraw.Draw(p3)
draw_header(d3, "Advanced Features & Settings", "Scenarios 4, 5 & 6: Cloud Pairing, PIP & Compliance", 3)

y = 110
y = draw_section_title(d3, y, "Scenario 4: Cloud Pairing & Remote Playlist Management")
d3.text((MARGIN, y), "1. On the TV, navigate to 'Playlists' / 'Pair Device' modal. A 6-digit pairing code is presented.", fill="#334155", font=get_font(12))
d3.text((MARGIN, y + 20), "2. Open https://pairiptv.ozturk.app on smartphone or browser, enter code, and submit an M3U playlist.", fill="#334155", font=get_font(12))
d3.text((MARGIN, y + 40), "Expected: TV instantly receives the playlist via WebSocket and updates catalog in real-time.", fill="#16A34A", font=get_font(12, bold=True))
y += 64
y = paste_screenshot(p3, os.path.join(ASSETS_DIR, "screenshot_3_playlist_manager_1920x1080.jpg"), y, target_h=300)

y = draw_section_title(d3, y, "Scenario 5: Multi-Screen PIP (Picture-in-Picture)")
d3.text((MARGIN, y), "1. While watching live video, open Player OSD and click the PIP icon.", fill="#334155", font=get_font(12))
d3.text((MARGIN, y + 20), "2. Secondary channel streams smoothly inside the thumbnail overlay without interrupting main audio.", fill="#334155", font=get_font(12))
y += 50

y = draw_section_title(d3, y, "Scenario 6: Settings & Privacy Policy Compliance")
d3.text((MARGIN, y), "1. In Settings tab, inspect App Version (1.0.4) and Privacy Policy link.", fill="#334155", font=get_font(12))
d3.text((MARGIN, y + 20), "2. Privacy page is publicly hosted and accessible at: https://pairiptv.ozturk.app/privacy", fill="#334155", font=get_font(12))
y += 50

y = draw_callout(d3, y, "QA Compliance & Safety Confirmation",
                 "KDR IPTV is an open player shell. It contains zero copyrighted streams, zero adult material, zero advertisements, and complies 100% with LG Seller Lounge App Submission Guidelines.",
                 bg="#F0FDF4", border="#16A34A")

# Save multi-page PDF
pdf_path = os.path.join(ASSETS_DIR, "KDR_IPTV_UX_Scenario.pdf")
p1.save(pdf_path, "PDF", resolution=150.0, save_all=True, append_images=[p2, p3])
print(f"UX Scenario PDF generated successfully: {pdf_path} (Size: {os.path.getsize(pdf_path)} bytes)")
