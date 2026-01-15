
from playwright.sync_api import sync_playwright, expect

def test_search_accessibility():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        page.goto("http://localhost:3000")

        # Wait for app to load (checking for search input)
        search_input = page.locator('input[aria-label="Şehir veya bölge ara"]')
        expect(search_input).to_be_visible()

        # Check current location button aria-label
        location_btn = page.locator('button[aria-label="Mevcut konumu kullan"]')
        expect(location_btn).to_be_visible()

        # Type into search
        search_input.fill("Istanbul")

        # Wait for clear button to appear
        clear_btn = page.locator('button[aria-label="Aramayı temizle"]')
        expect(clear_btn).to_be_visible()

        # Wait for results
        # Depending on how fast the API is, we might see results.
        # But we can at least verify the UI state with input filled

        # Take a screenshot
        page.screenshot(path="search_a11y_verification.png")

        browser.close()

if __name__ == "__main__":
    test_search_accessibility()
