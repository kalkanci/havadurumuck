from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Grant geolocation permissions
        context = browser.new_context(
            permissions=['geolocation'],
            geolocation={'latitude': 41.0138, 'longitude': 28.9497}, # Istanbul
            viewport={'width': 375, 'height': 812} # Mobile View
        )
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:3000")

        # Wait for "İstanbul" or loading to finish
        print("Waiting for location...")
        try:
            page.wait_for_selector("text=İstanbul", timeout=15000)
            print("Location loaded: İstanbul")
        except:
            print("Timeout waiting for Istanbul. Checking page content...")
            print(page.content())

        # Take screenshot of Initial State (Celsius)
        time.sleep(3) # Wait for animation
        page.screenshot(path="celsius.png")
        print("Screenshot celsius.png taken")

        # Open Settings
        print("Opening settings...")
        try:
            page.locator('button[aria-label="Ayarlar"]').click()
            time.sleep(1)

            # Toggle Unit
            print("Toggling unit...")
            page.locator('text=Sıcaklık Birimi').click()
            time.sleep(0.5)

            # Close Settings - finding the X button in the modal
            # The modal has a close button at top right
            page.locator('div[class*="fixed inset-0"] button svg.lucide-x').locator("..").click()

            time.sleep(1) # Wait for modal close animation

            # Take screenshot of Fahrenheit State
            page.screenshot(path="fahrenheit.png")
            print("Screenshot fahrenheit.png taken")
        except Exception as e:
            print(f"Error interacting with UI: {e}")
            page.screenshot(path="error.png")

        browser.close()

if __name__ == "__main__":
    run()
