
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Navigate to the app
    page.goto("http://localhost:3000")

    # Wait for the search input to be visible
    search_input = page.locator('input[placeholder="Konum, sokak, mahalle..."]')
    expect(search_input).to_be_visible()

    # Check if the "Current Location" button has aria-label
    current_location_btn = page.locator('button[aria-label="Mevcut Konum"]')
    expect(current_location_btn).to_be_visible()
    print("Verified: Current Location button has aria-label")

    # Type query to trigger search results and loading state
    # We can't easily capture the brief loading state in a screenshot without mocking,
    # but we can verify the search results appear and are buttons.
    search_input.fill("Istanbul")

    # Wait for results
    results_list = page.locator('ul')
    expect(results_list).to_be_visible()

    # Check if the "Clear Search" button has aria-label
    clear_btn = page.locator('button[aria-label="Aramayı Temizle"]')
    expect(clear_btn).to_be_visible()
    print("Verified: Clear Search button has aria-label")

    # Check if results are buttons
    first_result = results_list.locator('li button').first
    expect(first_result).to_be_visible()
    print("Verified: Search results are buttons")

    # Focus the first result to show keyboard accessibility styling
    first_result.focus()

    # Take screenshot
    page.screenshot(path="verification/search_ux_verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
