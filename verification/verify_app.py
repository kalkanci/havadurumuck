from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            permissions=['geolocation'],
            geolocation={'latitude': 41.0082, 'longitude': 28.9784}, # Istanbul (Sultanahmet)
            locale='tr-TR',
            viewport={'width': 375, 'height': 812} # iPhone X size
        )
        page = context.new_page()

        print("Navigating to app...")
        try:
            page.goto("http://localhost:3000")

            # Wait for splash screen to go away.
            # We can wait for the "Bugün" (Today) tab to appear, which is in the bottom nav.
            print("Waiting for content...")
            page.wait_for_selector("text=Bugün", timeout=20000)

            # Wait for weather data (temperature)
            # The temperature usually has a degree symbol or is a large number.
            # Let's just wait a bit for animations to finish.
            page.wait_for_timeout(3000)

            print("Taking screenshot...")
            page.screenshot(path="verification/verification.png")
            print("Screenshot saved to verification/verification.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")

        browser.close()

if __name__ == "__main__":
    run()
